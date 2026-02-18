from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import bcrypt
from jose import JWTError, jwt
import time
import json
from bson import ObjectId

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Import lesson data from seed file
from data.lessons_seed import (
    SESSION_TYPES, METHODS, LEVEL_THRESHOLDS, WARMUP_CHECKLIST,
    SCALES_LESSONS, BOW_TECHNIQUE_LESSONS, SPEED_FINGERING_LESSONS,
    POSITIONS_TRILLS_LESSONS, STUDIES_LESSONS, REPERTOIRE_LESSONS,
    REPERTOIRE_STUDY_GUIDE, get_all_lessons, get_total_lessons
)

# JWT Configuration
_jwt_secret = os.environ.get('JWT_SECRET', '')
if not _jwt_secret and os.environ.get('RAILWAY_ENVIRONMENT'):
    raise RuntimeError("JWT_SECRET must be set in production")
SECRET_KEY = _jwt_secret or 'violin-study-plan-secret-key-2024-dev-only'
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

# Admin default password
ADMIN_DEFAULT_PASSWORD = "violino2024"

# Brute force protection
LOGIN_ATTEMPTS = {}  # {ip: {"count": int, "last_attempt": timestamp, "locked_until": timestamp}}
MAX_ATTEMPTS = 5
LOCKOUT_DURATION = 300  # 5 minutes

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'violin_study')]

# Security headers middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        if os.environ.get('RAILWAY_ENVIRONMENT'):
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response

# Create the main app
app = FastAPI(title="Violin Study Plan API", version="2.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

security = HTTPBearer(auto_error=False)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============== MODELS ==============

class LoginRequest(BaseModel):
    username: str = Field(..., max_length=100)
    password: str = Field(..., max_length=200)

class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., max_length=200)
    new_password: str = Field(..., max_length=200)

class FirstLoginPasswordRequest(BaseModel):
    new_password: str = Field(..., max_length=200)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    must_change_password: bool = False

class UserResponse(BaseModel):
    username: str
    created_at: datetime
    first_login_at: Optional[datetime] = None
    must_change_password: bool = False

class SessionProgress(BaseModel):
    session_type: str
    current_lesson: int = 1
    completed_lessons: List[int] = []
    practice_counts: Dict[int, int] = {}
    last_practiced: Dict[int, str] = {}
    notes: Dict[int, str] = {}

class PracticeLogRequest(BaseModel):
    session_type: str
    lesson_id: int

class AdvanceLessonRequest(BaseModel):
    session_type: str
    direction: str = "next"

class UpdateNotesRequest(BaseModel):
    session_type: str = Field(..., max_length=50)
    lesson_id: int
    notes: str = Field(..., max_length=5000)

class WarmupCheckRequest(BaseModel):
    item_id: int
    completed: bool

class DailyLogRequest(BaseModel):
    notes: Optional[str] = Field(None, max_length=5000)

class UpdateSessionDurationsRequest(BaseModel):
    durations: Dict[str, int]  # session_id -> duration in seconds

class CreateMethodRequest(BaseModel):
    name: str = Field(..., max_length=200)
    author: str = Field(..., max_length=200)
    category: str = Field(..., max_length=100)
    session_type: str = Field(..., max_length=50)

class CreateLessonRequest(BaseModel):
    title: str = Field(..., max_length=500)
    subtitle: str = Field("", max_length=500)
    instruction: str = Field("", max_length=2000)
    level: str = Field("", max_length=100)
    tags: List[str] = []

class BatchLessonRequest(BaseModel):
    title_prefix: str = Field(..., max_length=200)
    count: int = Field(..., ge=1, le=500)
    subtitle: str = Field("", max_length=500)
    instruction: str = Field("", max_length=2000)
    level: str = Field("", max_length=100)
    tags: List[str] = []

class UpdateMethodRequest(BaseModel):
    name: Optional[str] = Field(None, max_length=200)
    author: Optional[str] = Field(None, max_length=200)
    category: Optional[str] = Field(None, max_length=100)

class UpdateLessonRequest(BaseModel):
    title: Optional[str] = Field(None, max_length=500)
    subtitle: Optional[str] = Field(None, max_length=500)
    instruction: Optional[str] = Field(None, max_length=2000)
    level: Optional[str] = Field(None, max_length=100)
    tags: Optional[List[str]] = None

class ReorderLessonsRequest(BaseModel):
    lesson_ids: List[str]  # Ordered list of lesson _id strings

class ExportDataResponse(BaseModel):
    data: Dict[str, Any]
    exported_at: str
    version: str = "2.0"

class ImportDataRequest(BaseModel):
    data: Dict[str, Any]

class ImportPreviewResponse(BaseModel):
    valid: bool
    summary: Dict[str, Any]
    warnings: List[str]

# ============== HELPER FUNCTIONS ==============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0]
    return request.client.host if request.client else "unknown"

def check_brute_force(ip: str) -> bool:
    """Returns True if request should be blocked"""
    now = time.time()
    if ip in LOGIN_ATTEMPTS:
        attempt = LOGIN_ATTEMPTS[ip]
        # Check if locked
        if attempt.get("locked_until", 0) > now:
            return True
        # Reset if last attempt was long ago
        if now - attempt.get("last_attempt", 0) > LOCKOUT_DURATION:
            LOGIN_ATTEMPTS[ip] = {"count": 0, "last_attempt": now}
    return False

def record_login_attempt(ip: str, success: bool):
    """Record a login attempt"""
    now = time.time()
    if ip not in LOGIN_ATTEMPTS:
        LOGIN_ATTEMPTS[ip] = {"count": 0, "last_attempt": now}
    
    if success:
        LOGIN_ATTEMPTS[ip] = {"count": 0, "last_attempt": now}
    else:
        LOGIN_ATTEMPTS[ip]["count"] += 1
        LOGIN_ATTEMPTS[ip]["last_attempt"] = now
        if LOGIN_ATTEMPTS[ip]["count"] >= MAX_ATTEMPTS:
            LOGIN_ATTEMPTS[ip]["locked_until"] = now + LOCKOUT_DURATION

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Não autenticado")
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Token inválido")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado")
    
    user = await db.users.find_one({"username": username})
    if user is None:
        raise HTTPException(status_code=401, detail="Usuário não encontrado")
    return user

async def get_all_lessons_merged():
    """Returns all lessons organized by session type, merging seed + custom"""
    import copy
    seed_lessons = {k: list(v) for k, v in get_all_lessons().items()}
    # Get custom lessons from DB
    custom_lessons_cursor = db.custom_lessons.find({}).sort("order", 1)
    custom_lessons = await custom_lessons_cursor.to_list(5000)

    # Get custom methods for method info
    custom_methods_cursor = db.custom_methods.find({})
    custom_methods_list = await custom_methods_cursor.to_list(500)
    custom_methods_map = {str(m["_id"]): m for m in custom_methods_list}

    for cl in custom_lessons:
        session_type = cl.get("session_type")
        if session_type and session_type in seed_lessons:
            # Assign an ID that doesn't collide with seed (offset by 10000)
            lesson_entry = {
                "id": cl.get("order", 0) + 10000,
                "title": cl["title"],
                "method_id": cl.get("custom_method_id"),
                "subtitle": cl.get("subtitle", ""),
                "instruction": cl.get("instruction", ""),
                "level": cl.get("level", ""),
                "tags": cl.get("tags", []),
                "is_custom": True,
                "custom_lesson_id": str(cl["_id"]),
                "custom_method_id": cl.get("custom_method_id"),
            }
            seed_lessons[session_type].append(lesson_entry)

    return seed_lessons

async def get_all_methods_merged():
    """Returns all methods merging seed + custom"""
    methods = [dict(m, is_seed=True) for m in METHODS]
    custom_methods_cursor = db.custom_methods.find({})
    custom_methods = await custom_methods_cursor.to_list(500)
    for cm in custom_methods:
        methods.append({
            "id": str(cm["_id"]),
            "name": cm["name"],
            "author": cm["author"],
            "category": cm.get("category", ""),
            "session_type": cm.get("session_type", ""),
            "is_seed": False,
            "is_custom": True,
        })
    return methods

async def get_total_lessons_merged():
    """Returns total count of all lessons including custom"""
    all_lessons = await get_all_lessons_merged()
    return sum(len(lessons) for lessons in all_lessons.values())

async def init_user_progress(username: str):
    """Initialize progress for a new user"""
    all_lessons = get_all_lessons()
    progress = {
        "username": username,
        "scales": {"current_lesson": 1, "completed_lessons": [], "practice_counts": {}, "last_practiced": {}, "notes": {}},
        "bow": {"current_lesson": 1, "completed_lessons": [], "practice_counts": {}, "last_practiced": {}, "notes": {}},
        "speed": {"current_lesson": 1, "completed_lessons": [], "practice_counts": {}, "last_practiced": {}, "notes": {}},
        "positions": {"current_lesson": 1, "completed_lessons": [], "practice_counts": {}, "last_practiced": {}, "notes": {}},
        "studies": {"current_lesson": 1, "completed_lessons": [], "practice_counts": {}, "last_practiced": {}, "notes": {}},
        "repertoire": {"current_lesson": 1, "completed_lessons": [], "practice_counts": {}, "last_practiced": {}, "notes": {}},
        "practice_dates": [],
        "first_practice_date": None,
        "created_at": datetime.utcnow().isoformat(),
    }
    await db.progress.insert_one(progress)
    return progress

async def init_app_settings():
    """Initialize app settings"""
    settings = await db.settings.find_one({"_id": "app_settings"})
    if not settings:
        settings = {
            "_id": "app_settings",
            "start_date": datetime.utcnow().isoformat(),
            "session_durations": {s["id"]: s["default_duration_sec"] for s in SESSION_TYPES},
            "theme": "dark",
            "accent_color": "#d4a843",
        }
        await db.settings.insert_one(settings)
    return settings

def get_today_string():
    return datetime.utcnow().strftime("%Y-%m-%d")

def calculate_level(studies_completed: int) -> dict:
    """Calculate level based on studies progress"""
    for threshold in LEVEL_THRESHOLDS:
        if threshold["min"] <= studies_completed <= threshold["max"]:
            return {
                "level": threshold["level"],
                "method_range": threshold["method_range"],
                "completed": studies_completed,
                "next_threshold": threshold["max"] + 1 if threshold["max"] < 296 else None
            }
    return {"level": "Iniciante", "method_range": "Wohlfahrt", "completed": 0, "next_threshold": 60}

# ============== ROUTES ==============

@api_router.get("/")
async def root():
    return {
        "message": "Violin Study Plan API",
        "version": "2.0",
        "total_lessons": get_total_lessons()
    }

# ============== AUTH ROUTES ==============

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(request: LoginRequest, req: Request):
    """Login with username and password"""
    ip = get_client_ip(req)
    
    # Check brute force
    if check_brute_force(ip):
        raise HTTPException(
            status_code=429, 
            detail="Muitas tentativas falhas. Aguarde 5 minutos."
        )
    
    user = await db.users.find_one({"username": request.username})
    
    # Create default admin user if not exists
    if user is None and request.username == "admin":
        hashed = hash_password(ADMIN_DEFAULT_PASSWORD)
        user = {
            "username": "admin",
            "password_hash": hashed,
            "created_at": datetime.utcnow(),
            "first_login_at": datetime.utcnow(),
            "must_change_password": True,  # Force password change on first login
            "password_changed": False
        }
        await db.users.insert_one(user)
        await init_user_progress("admin")
        await init_app_settings()
    
    if user is None:
        record_login_attempt(ip, False)
        raise HTTPException(status_code=401, detail="Usuário ou senha incorretos")
    
    if not verify_password(request.password, user["password_hash"]):
        record_login_attempt(ip, False)
        raise HTTPException(status_code=401, detail="Usuário ou senha incorretos")
    
    record_login_attempt(ip, True)
    
    # Update first login if needed
    if user.get("first_login_at") is None:
        await db.users.update_one(
            {"username": request.username},
            {"$set": {"first_login_at": datetime.utcnow()}}
        )
    
    access_token = create_access_token(data={"sub": request.username})
    return TokenResponse(
        access_token=access_token,
        must_change_password=user.get("must_change_password", False)
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(user: dict = Depends(get_current_user)):
    """Get current user info"""
    return UserResponse(
        username=user["username"],
        created_at=user["created_at"],
        first_login_at=user.get("first_login_at"),
        must_change_password=user.get("must_change_password", False)
    )

@api_router.post("/auth/change-password")
async def change_password(request: ChangePasswordRequest, user: dict = Depends(get_current_user)):
    """Change user password"""
    if not verify_password(request.current_password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Senha atual incorreta")

    if len(request.new_password) < 8:
        raise HTTPException(status_code=400, detail="A nova senha deve ter pelo menos 8 caracteres")
    
    new_hash = hash_password(request.new_password)
    await db.users.update_one(
        {"username": user["username"]},
        {"$set": {
            "password_hash": new_hash,
            "password_changed": True,
            "must_change_password": False
        }}
    )
    return {"message": "Senha alterada com sucesso"}

@api_router.post("/auth/first-login-password")
async def first_login_password(request: FirstLoginPasswordRequest, user: dict = Depends(get_current_user)):
    """Change password on first login (forced)"""
    if not user.get("must_change_password", False):
        raise HTTPException(status_code=400, detail="Troca de senha não necessária")

    if len(request.new_password) < 8:
        raise HTTPException(status_code=400, detail="A nova senha deve ter pelo menos 8 caracteres")
    
    new_hash = hash_password(request.new_password)
    await db.users.update_one(
        {"username": user["username"]},
        {"$set": {
            "password_hash": new_hash,
            "password_changed": True,
            "must_change_password": False
        }}
    )
    return {"message": "Senha definida com sucesso"}

@api_router.get("/auth/verify")
async def verify_token(user: dict = Depends(get_current_user)):
    """Verify if token is valid"""
    return {
        "valid": True,
        "username": user["username"],
        "must_change_password": user.get("must_change_password", False)
    }

# ============== LESSON DATA ROUTES ==============

@api_router.get("/session-types")
async def get_session_types():
    """Get all session types with their configuration"""
    settings = await db.settings.find_one({"_id": "app_settings"})
    durations = settings.get("session_durations", {}) if settings else {}

    all_lessons = await get_all_lessons_merged()
    sessions = []
    for s in SESSION_TYPES:
        session = s.copy()
        session["duration_sec"] = durations.get(s["id"], s["default_duration_sec"])
        session["total_lessons"] = len(all_lessons.get(s["id"], [])) if s["type"] == "progressive" else 0
        sessions.append(session)

    return {"sessions": sessions, "total_time_sec": 3600}

@api_router.get("/session-info")
async def get_session_info():
    """Get info about all sessions (legacy endpoint)"""
    settings = await db.settings.find_one({"_id": "app_settings"})
    durations = settings.get("session_durations", {}) if settings else {}
    all_lessons = await get_all_lessons_merged()

    sessions = []
    for s in SESSION_TYPES:
        duration = durations.get(s["id"], s["default_duration_sec"])
        sessions.append({
            "id": s["id"],
            "name": s["name"],
            "icon": s["icon"],
            "time": f"{sum(durations.get(st['id'], st['default_duration_sec']) for st in SESSION_TYPES[:s['order']-1])//60:02d}:00–{(sum(durations.get(st['id'], st['default_duration_sec']) for st in SESSION_TYPES[:s['order']-1]) + duration)//60:02d}:00",
            "duration": duration // 60,
            "duration_sec": duration,
            "lessons": len(all_lessons.get(s["id"], [])) if s["type"] == "progressive" else 0,
            "type": s["type"]
        })

    tips = {s["id"]: s["tip"] for s in SESSION_TYPES}
    total = sum(len(lessons) for lessons in all_lessons.values())

    return {
        "sessions": sessions,
        "tips": tips,
        "total_lessons": total
    }

@api_router.get("/lessons/{session_type}")
async def get_lessons(session_type: str):
    """Get all lessons for a session type"""
    all_lessons = await get_all_lessons_merged()
    if session_type not in all_lessons:
        raise HTTPException(status_code=404, detail="Tipo de sessão não encontrado")

    session = next((s for s in SESSION_TYPES if s["id"] == session_type), None)
    tip = session["tip"] if session else ""

    # Get all methods (seed + custom) for method info
    all_methods = await get_all_methods_merged()
    methods_map = {m["id"]: m for m in all_methods}

    # Add method info to lessons
    lessons = []
    for lesson in all_lessons[session_type]:
        lesson_copy = lesson.copy()
        method_id = lesson_copy.get("method_id") or lesson_copy.get("custom_method_id")
        if method_id and method_id in methods_map:
            method = methods_map[method_id]
            lesson_copy["method"] = method["name"]
            lesson_copy["method_author"] = method["author"]
        lessons.append(lesson_copy)

    return {
        "session_type": session_type,
        "lessons": lessons,
        "total": len(lessons),
        "tip": tip
    }

@api_router.get("/methods")
async def get_methods():
    """Get all methods/authors (seed + custom)"""
    methods = await get_all_methods_merged()
    return {"methods": methods}

@api_router.get("/level-thresholds")
async def get_level_thresholds():
    """Get level threshold configuration"""
    return {"thresholds": LEVEL_THRESHOLDS}

@api_router.get("/warmup-checklist")
async def get_warmup_checklist():
    """Get the warmup checklist"""
    session = next((s for s in SESSION_TYPES if s["id"] == "warmup"), None)
    return {
        "checklist": WARMUP_CHECKLIST,
        "tip": session["tip"] if session else ""
    }

# ============== PROGRESS ROUTES ==============

@api_router.get("/progress")
async def get_progress(user: dict = Depends(get_current_user)):
    """Get user progress"""
    progress = await db.progress.find_one({"username": user["username"]})
    if not progress:
        progress = await init_user_progress(user["username"])
    
    today = get_today_string()
    warmup = await db.warmups.find_one({"username": user["username"], "date": today})
    
    return {
        "scales": progress.get("scales", {"current_lesson": 1, "completed_lessons": [], "practice_counts": {}, "last_practiced": {}, "notes": {}}),
        "bow": progress.get("bow", {"current_lesson": 1, "completed_lessons": [], "practice_counts": {}, "last_practiced": {}, "notes": {}}),
        "speed": progress.get("speed", {"current_lesson": 1, "completed_lessons": [], "practice_counts": {}, "last_practiced": {}, "notes": {}}),
        "positions": progress.get("positions", {"current_lesson": 1, "completed_lessons": [], "practice_counts": {}, "last_practiced": {}, "notes": {}}),
        "studies": progress.get("studies", {"current_lesson": 1, "completed_lessons": [], "practice_counts": {}, "last_practiced": {}, "notes": {}}),
        "repertoire": progress.get("repertoire", {"current_lesson": 1, "completed_lessons": [], "practice_counts": {}, "last_practiced": {}, "notes": {}}),
        "warmup_today": warmup,
        "practice_dates": progress.get("practice_dates", []),
        "first_practice_date": progress.get("first_practice_date"),
    }

@api_router.post("/progress/practice")
async def log_practice(request: PracticeLogRequest, user: dict = Depends(get_current_user)):
    """Log a practice session for a lesson"""
    all_lessons = await get_all_lessons_merged()
    if request.session_type not in all_lessons:
        raise HTTPException(status_code=400, detail="Tipo de sessão inválido")
    
    today = get_today_string()
    progress = await db.progress.find_one({"username": user["username"]})
    
    if not progress:
        progress = await init_user_progress(user["username"])
    
    session_data = progress.get(request.session_type, {
        "current_lesson": 1,
        "completed_lessons": [],
        "practice_counts": {},
        "last_practiced": {},
        "notes": {}
    })
    
    lesson_key = str(request.lesson_id)
    session_data["practice_counts"][lesson_key] = session_data.get("practice_counts", {}).get(lesson_key, 0) + 1
    session_data["last_practiced"][lesson_key] = today
    
    # Add today to practice dates if not already there
    practice_dates = progress.get("practice_dates", [])
    if today not in practice_dates:
        practice_dates.append(today)
    
    # Set first practice date if not set
    first_practice_date = progress.get("first_practice_date")
    if not first_practice_date:
        first_practice_date = today
    
    await db.progress.update_one(
        {"username": user["username"]},
        {"$set": {
            request.session_type: session_data,
            "practice_dates": practice_dates,
            "first_practice_date": first_practice_date
        }}
    )
    
    # Update daily log
    await update_daily_log(user["username"], today, request.session_type)
    
    return {
        "message": "Prática registrada",
        "lesson_id": request.lesson_id,
        "practice_count": session_data["practice_counts"][lesson_key],
        "date": today
    }

@api_router.post("/progress/advance")
async def advance_lesson(request: AdvanceLessonRequest, user: dict = Depends(get_current_user)):
    """Advance to next or previous lesson"""
    all_lessons = await get_all_lessons_merged()
    if request.session_type not in all_lessons:
        raise HTTPException(status_code=400, detail="Tipo de sessão inválido")
    
    total_lessons = len(all_lessons[request.session_type])
    progress = await db.progress.find_one({"username": user["username"]})
    
    if not progress:
        progress = await init_user_progress(user["username"])
    
    session_data = progress.get(request.session_type, {
        "current_lesson": 1,
        "completed_lessons": [],
        "practice_counts": {},
        "last_practiced": {},
        "notes": {}
    })
    
    current = session_data.get("current_lesson", 1)
    completed = session_data.get("completed_lessons", [])
    
    if request.direction == "next":
        if current < total_lessons:
            if current not in completed:
                completed.append(current)
            current += 1
    elif request.direction == "previous":
        if current > 1:
            current -= 1
    
    session_data["current_lesson"] = current
    session_data["completed_lessons"] = completed
    
    await db.progress.update_one(
        {"username": user["username"]},
        {"$set": {request.session_type: session_data}}
    )
    
    return {
        "message": f"Agora na lição {current}",
        "current_lesson": current,
        "total_lessons": total_lessons,
        "completed_count": len(completed)
    }

@api_router.post("/progress/jump")
async def jump_to_lesson(session_type: str, lesson_id: int, user: dict = Depends(get_current_user)):
    """Jump to a specific lesson"""
    all_lessons = await get_all_lessons_merged()
    if session_type not in all_lessons:
        raise HTTPException(status_code=400, detail="Tipo de sessão inválido")
    
    total_lessons = len(all_lessons[session_type])
    if lesson_id < 1 or lesson_id > total_lessons:
        raise HTTPException(status_code=400, detail="ID de lição inválido")
    
    progress = await db.progress.find_one({"username": user["username"]})
    
    if not progress:
        progress = await init_user_progress(user["username"])
    
    session_data = progress.get(session_type, {
        "current_lesson": 1,
        "completed_lessons": [],
        "practice_counts": {},
        "last_practiced": {},
        "notes": {}
    })
    
    session_data["current_lesson"] = lesson_id
    
    await db.progress.update_one(
        {"username": user["username"]},
        {"$set": {session_type: session_data}}
    )
    
    # Log the jump
    await db.activity_log.insert_one({
        "username": user["username"],
        "action": "jump_to_lesson",
        "session_type": session_type,
        "lesson_id": lesson_id,
        "timestamp": datetime.utcnow()
    })
    
    return {
        "message": f"Pulou para lição {lesson_id}",
        "current_lesson": lesson_id
    }

@api_router.post("/progress/notes")
async def update_notes(request: UpdateNotesRequest, user: dict = Depends(get_current_user)):
    """Update notes for a lesson"""
    all_lessons = await get_all_lessons_merged()
    if request.session_type not in all_lessons:
        raise HTTPException(status_code=400, detail="Tipo de sessão inválido")
    
    progress = await db.progress.find_one({"username": user["username"]})
    
    if not progress:
        progress = await init_user_progress(user["username"])
    
    session_data = progress.get(request.session_type, {
        "current_lesson": 1,
        "completed_lessons": [],
        "practice_counts": {},
        "last_practiced": {},
        "notes": {}
    })
    
    notes = session_data.get("notes", {})
    notes[str(request.lesson_id)] = request.notes
    session_data["notes"] = notes
    
    await db.progress.update_one(
        {"username": user["username"]},
        {"$set": {request.session_type: session_data}}
    )
    
    return {"message": "Anotações salvas"}

# ============== WARMUP ROUTES ==============

@api_router.post("/warmup/check")
async def update_warmup_check(request: WarmupCheckRequest, user: dict = Depends(get_current_user)):
    """Update warmup checklist item"""
    today = get_today_string()
    warmup = await db.warmups.find_one({"username": user["username"], "date": today})
    
    if not warmup:
        warmup = {
            "username": user["username"],
            "date": today,
            "checklist": [{"id": item["id"], "text": item["text"], "completed": False} for item in WARMUP_CHECKLIST]
        }
        await db.warmups.insert_one(warmup)
    
    checklist = warmup["checklist"]
    for item in checklist:
        if item["id"] == request.item_id:
            item["completed"] = request.completed
            break
    
    await db.warmups.update_one(
        {"username": user["username"], "date": today},
        {"$set": {"checklist": checklist}}
    )
    
    # Update practice dates
    progress = await db.progress.find_one({"username": user["username"]})
    if progress:
        practice_dates = progress.get("practice_dates", [])
        if today not in practice_dates:
            practice_dates.append(today)
            first_practice_date = progress.get("first_practice_date") or today
            await db.progress.update_one(
                {"username": user["username"]},
                {"$set": {"practice_dates": practice_dates, "first_practice_date": first_practice_date}}
            )
    
    # Update daily log
    await update_daily_log(user["username"], today, "warmup")
    
    return {"message": "Checklist atualizado", "checklist": checklist}

# ============== DAILY LOG ROUTES ==============

async def update_daily_log(username: str, date: str, session_type: str, time_sec: int = 0):
    """Update or create daily log"""
    log = await db.daily_logs.find_one({"username": username, "date": date})
    
    if not log:
        log = {
            "username": username,
            "date": date,
            "studied": True,
            "total_time_sec": 0,
            "session_times": {},
            "sessions_practiced": [],
            "created_at": datetime.utcnow()
        }
        await db.daily_logs.insert_one(log)
    
    sessions_practiced = log.get("sessions_practiced", [])
    if session_type not in sessions_practiced:
        sessions_practiced.append(session_type)
    
    session_times = log.get("session_times", {})
    session_times[session_type] = session_times.get(session_type, 0) + time_sec
    
    await db.daily_logs.update_one(
        {"username": username, "date": date},
        {"$set": {
            "studied": True,
            "sessions_practiced": sessions_practiced,
            "session_times": session_times,
            "total_time_sec": sum(session_times.values())
        }}
    )

@api_router.get("/daily-logs")
async def get_daily_logs(user: dict = Depends(get_current_user), limit: int = 365):
    """Get daily practice logs"""
    logs = await db.daily_logs.find(
        {"username": user["username"]}
    ).sort("date", -1).limit(limit).to_list(limit)
    
    return {"logs": [{k: v for k, v in log.items() if k != "_id"} for log in logs]}

@api_router.get("/daily-logs/{date}")
async def get_daily_log(date: str, user: dict = Depends(get_current_user)):
    """Get specific daily log"""
    log = await db.daily_logs.find_one({"username": user["username"], "date": date})
    if not log:
        return {"log": None}
    log.pop("_id", None)
    return {"log": log}

@api_router.post("/daily-logs/{date}/notes")
async def update_daily_notes(date: str, request: DailyLogRequest, user: dict = Depends(get_current_user)):
    """Update daily notes"""
    log = await db.daily_logs.find_one({"username": user["username"], "date": date})
    
    if not log:
        log = {
            "username": user["username"],
            "date": date,
            "studied": False,
            "total_time_sec": 0,
            "session_times": {},
            "sessions_practiced": [],
            "notes": request.notes,
            "created_at": datetime.utcnow()
        }
        await db.daily_logs.insert_one(log)
    else:
        await db.daily_logs.update_one(
            {"username": user["username"], "date": date},
            {"$set": {"notes": request.notes}}
        )
    
    return {"message": "Notas salvas"}

@api_router.post("/daily-logs/log-time")
async def log_session_time(session_type: str, time_sec: int, user: dict = Depends(get_current_user)):
    """Log time for a session"""
    today = get_today_string()
    await update_daily_log(user["username"], today, session_type, time_sec)
    return {"message": "Tempo registrado"}

# ============== STATS ROUTES ==============

@api_router.get("/stats")
async def get_stats(user: dict = Depends(get_current_user)):
    """Get user statistics"""
    progress = await db.progress.find_one({"username": user["username"]})
    
    if not progress:
        progress = await init_user_progress(user["username"])
    
    all_lessons = await get_all_lessons_merged()
    total_lessons = sum(len(lessons) for lessons in all_lessons.values())
    completed_lessons = 0
    
    for session_type in all_lessons.keys():
        session_data = progress.get(session_type, {})
        completed_lessons += len(session_data.get("completed_lessons", []))
    
    # Calculate level based on Studies progress
    studies_completed = len(progress.get("studies", {}).get("completed_lessons", []))
    level_info = calculate_level(studies_completed)
    
    practice_dates = progress.get("practice_dates", [])
    
    # Calculate total practice time
    total_time = 0
    logs = await db.daily_logs.find({"username": user["username"]}).to_list(1000)
    for log in logs:
        total_time += log.get("total_time_sec", 0)
    
    return {
        "total_lessons": total_lessons,
        "completed_lessons": completed_lessons,
        "completion_percentage": round((completed_lessons / total_lessons) * 100, 1) if total_lessons > 0 else 0,
        "level": level_info["level"],
        "level_info": level_info,
        "studies_completed": studies_completed,
        "practice_days": len(practice_dates),
        "total_practice_time_sec": total_time,
        "first_practice_date": progress.get("first_practice_date"),
        "session_progress": {
            session_type: {
                "total": len(all_lessons[session_type]),
                "completed": len(progress.get(session_type, {}).get("completed_lessons", [])),
                "current": progress.get(session_type, {}).get("current_lesson", 1)
            }
            for session_type in all_lessons.keys()
        }
    }

@api_router.get("/calendar")
async def get_calendar(user: dict = Depends(get_current_user), year: int = None, month: int = None):
    """Get calendar data for practice history"""
    progress = await db.progress.find_one({"username": user["username"]})
    practice_dates = progress.get("practice_dates", []) if progress else []
    
    # Get daily logs for more detail
    logs = await db.daily_logs.find({"username": user["username"]}).to_list(1000)
    logs_by_date = {log["date"]: log for log in logs}
    
    calendar_data = []
    for date_str in practice_dates:
        log = logs_by_date.get(date_str, {})
        calendar_data.append({
            "date": date_str,
            "studied": True,
            "total_time_sec": log.get("total_time_sec", 0),
            "sessions_count": len(log.get("sessions_practiced", []))
        })
    
    return {
        "practice_dates": practice_dates,
        "calendar_data": calendar_data,
        "total_days": len(practice_dates)
    }

# ============== METHODS & LESSONS CRUD ROUTES ==============

@api_router.post("/methods")
async def create_method(request: CreateMethodRequest, user: dict = Depends(get_current_user)):
    """Create a custom method"""
    valid_session_types = ["scales", "bow", "speed", "positions", "studies", "repertoire"]
    if request.session_type not in valid_session_types:
        raise HTTPException(status_code=400, detail="Tipo de sessão inválido")

    method = {
        "name": request.name,
        "author": request.author,
        "category": request.category,
        "session_type": request.session_type,
        "created_by": user["username"],
        "created_at": datetime.utcnow(),
    }
    result = await db.custom_methods.insert_one(method)
    method["_id"] = str(result.inserted_id)

    return {
        "message": "Método criado com sucesso",
        "method": {
            "id": str(result.inserted_id),
            "name": request.name,
            "author": request.author,
            "category": request.category,
            "session_type": request.session_type,
            "is_seed": False,
            "is_custom": True,
        }
    }

@api_router.put("/methods/{method_id}")
async def update_method(method_id: str, request: UpdateMethodRequest, user: dict = Depends(get_current_user)):
    """Update a custom method"""
    try:
        oid = ObjectId(method_id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID de método inválido")

    method = await db.custom_methods.find_one({"_id": oid})
    if not method:
        raise HTTPException(status_code=404, detail="Método não encontrado ou é um método padrão (não editável)")

    if method.get("created_by") and method["created_by"] != user["username"]:
        raise HTTPException(status_code=403, detail="Você não tem permissão para editar este método")

    update_data = {}
    if request.name is not None:
        update_data["name"] = request.name
    if request.author is not None:
        update_data["author"] = request.author
    if request.category is not None:
        update_data["category"] = request.category

    if not update_data:
        raise HTTPException(status_code=400, detail="Nenhum campo para atualizar")

    await db.custom_methods.update_one({"_id": oid}, {"$set": update_data})
    return {"message": "Método atualizado com sucesso"}

@api_router.delete("/methods/{method_id}")
async def delete_method(method_id: str, user: dict = Depends(get_current_user)):
    """Delete a custom method and its lessons"""
    try:
        oid = ObjectId(method_id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID de método inválido")

    method = await db.custom_methods.find_one({"_id": oid})
    if not method:
        raise HTTPException(status_code=404, detail="Método não encontrado ou é um método padrão (não editável)")

    if method.get("created_by") and method["created_by"] != user["username"]:
        raise HTTPException(status_code=403, detail="Você não tem permissão para deletar este método")

    # Delete all custom lessons belonging to this method
    await db.custom_lessons.delete_many({"custom_method_id": method_id})
    await db.custom_methods.delete_one({"_id": oid})

    return {"message": "Método e suas lições deletados com sucesso"}

@api_router.post("/methods/{method_id}/lessons")
async def create_lesson(method_id: str, request: CreateLessonRequest, user: dict = Depends(get_current_user)):
    """Create a lesson within a custom method"""
    try:
        oid = ObjectId(method_id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID de método inválido")

    method = await db.custom_methods.find_one({"_id": oid})
    if not method:
        raise HTTPException(status_code=404, detail="Método não encontrado")

    # Get the max order for lessons in this method
    last_lesson = await db.custom_lessons.find_one(
        {"custom_method_id": method_id},
        sort=[("order", -1)]
    )
    next_order = (last_lesson["order"] + 1) if last_lesson else 1

    lesson = {
        "title": request.title,
        "custom_method_id": method_id,
        "session_type": method["session_type"],
        "subtitle": request.subtitle,
        "instruction": request.instruction,
        "level": request.level,
        "tags": request.tags,
        "order": next_order,
        "created_by": user["username"],
        "created_at": datetime.utcnow(),
    }
    result = await db.custom_lessons.insert_one(lesson)

    return {
        "message": "Lição criada com sucesso",
        "lesson": {
            "id": str(result.inserted_id),
            "title": request.title,
            "order": next_order,
        }
    }

@api_router.post("/methods/{method_id}/lessons/batch")
async def create_lessons_batch(method_id: str, request: BatchLessonRequest, user: dict = Depends(get_current_user)):
    """Create multiple lessons at once (e.g. 'Wohlfahrt 1 a 60')"""
    try:
        oid = ObjectId(method_id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID de método inválido")

    method = await db.custom_methods.find_one({"_id": oid})
    if not method:
        raise HTTPException(status_code=404, detail="Método não encontrado")

    # Get the max order for lessons in this method
    last_lesson = await db.custom_lessons.find_one(
        {"custom_method_id": method_id},
        sort=[("order", -1)]
    )
    start_order = (last_lesson["order"] + 1) if last_lesson else 1

    lessons = []
    for i in range(1, request.count + 1):
        lessons.append({
            "title": f"{request.title_prefix} {i}",
            "custom_method_id": method_id,
            "session_type": method["session_type"],
            "subtitle": request.subtitle,
            "instruction": request.instruction,
            "level": request.level,
            "tags": request.tags,
            "order": start_order + i - 1,
            "created_by": user["username"],
            "created_at": datetime.utcnow(),
        })

    if lessons:
        await db.custom_lessons.insert_many(lessons)

    return {
        "message": f"{request.count} lições criadas com sucesso",
        "count": request.count,
    }

@api_router.put("/lessons/{lesson_id}")
async def update_lesson(lesson_id: str, request: UpdateLessonRequest, user: dict = Depends(get_current_user)):
    """Update a custom lesson"""
    try:
        oid = ObjectId(lesson_id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID de lição inválido")

    lesson = await db.custom_lessons.find_one({"_id": oid})
    if not lesson:
        raise HTTPException(status_code=404, detail="Lição não encontrada ou é uma lição padrão (não editável)")

    if lesson.get("created_by") and lesson["created_by"] != user["username"]:
        raise HTTPException(status_code=403, detail="Você não tem permissão para editar esta lição")

    update_data = {}
    if request.title is not None:
        update_data["title"] = request.title
    if request.subtitle is not None:
        update_data["subtitle"] = request.subtitle
    if request.instruction is not None:
        update_data["instruction"] = request.instruction
    if request.level is not None:
        update_data["level"] = request.level
    if request.tags is not None:
        update_data["tags"] = request.tags

    if not update_data:
        raise HTTPException(status_code=400, detail="Nenhum campo para atualizar")

    await db.custom_lessons.update_one({"_id": oid}, {"$set": update_data})
    return {"message": "Lição atualizada com sucesso"}

@api_router.delete("/lessons/{lesson_id}")
async def delete_lesson(lesson_id: str, user: dict = Depends(get_current_user)):
    """Delete a custom lesson"""
    try:
        oid = ObjectId(lesson_id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID de lição inválido")

    lesson = await db.custom_lessons.find_one({"_id": oid})
    if not lesson:
        raise HTTPException(status_code=404, detail="Lição não encontrada ou é uma lição padrão (não editável)")

    if lesson.get("created_by") and lesson["created_by"] != user["username"]:
        raise HTTPException(status_code=403, detail="Você não tem permissão para deletar esta lição")

    await db.custom_lessons.delete_one({"_id": oid})
    return {"message": "Lição deletada com sucesso"}

@api_router.put("/methods/{method_id}/lessons/reorder")
async def reorder_lessons(method_id: str, request: ReorderLessonsRequest, user: dict = Depends(get_current_user)):
    """Reorder lessons within a custom method"""
    try:
        ObjectId(method_id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID de método inválido")

    for idx, lid in enumerate(request.lesson_ids, 1):
        try:
            oid = ObjectId(lid)
            await db.custom_lessons.update_one(
                {"_id": oid, "custom_method_id": method_id},
                {"$set": {"order": idx}}
            )
        except Exception:
            continue

    return {"message": "Lições reordenadas com sucesso"}

# Add endpoint to get lessons of a specific custom method
@api_router.get("/methods/{method_id}/lessons")
async def get_method_lessons(method_id: str, user: dict = Depends(get_current_user)):
    """Get all lessons of a specific custom method"""
    from bson import ObjectId

    # Check if it's a seed method
    seed_method = next((m for m in METHODS if m["id"] == method_id), None)
    if seed_method:
        # Return seed lessons for this method
        all_lessons = get_all_lessons()
        lessons = []
        for session_type, session_lessons in all_lessons.items():
            for lesson in session_lessons:
                if lesson.get("method_id") == method_id:
                    lesson_copy = lesson.copy()
                    lesson_copy["is_seed"] = True
                    lesson_copy["session_type"] = session_type
                    lessons.append(lesson_copy)
        return {"lessons": lessons, "total": len(lessons)}

    # Custom method
    try:
        oid = ObjectId(method_id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID de método inválido")

    method = await db.custom_methods.find_one({"_id": oid})
    if not method:
        raise HTTPException(status_code=404, detail="Método não encontrado")

    lessons_cursor = db.custom_lessons.find({"custom_method_id": method_id}).sort("order", 1)
    lessons = await lessons_cursor.to_list(5000)
    result = []
    for l in lessons:
        result.append({
            "id": str(l["_id"]),
            "title": l["title"],
            "subtitle": l.get("subtitle", ""),
            "instruction": l.get("instruction", ""),
            "level": l.get("level", ""),
            "tags": l.get("tags", []),
            "order": l.get("order", 0),
            "is_seed": False,
            "is_custom": True,
            "session_type": l.get("session_type", ""),
        })

    return {"lessons": result, "total": len(result)}

# ============== SETTINGS ROUTES ==============

@api_router.get("/settings")
async def get_settings(user: dict = Depends(get_current_user)):
    """Get app settings"""
    settings = await db.settings.find_one({"_id": "app_settings"})
    if not settings:
        settings = await init_app_settings()
    settings.pop("_id", None)
    return {"settings": settings}

@api_router.put("/settings/session-durations")
async def update_session_durations(request: UpdateSessionDurationsRequest, user: dict = Depends(get_current_user)):
    """Update session durations"""
    # Validate total time is 60 minutes
    total_sec = sum(request.durations.values())
    if total_sec != 3600:
        raise HTTPException(
            status_code=400, 
            detail=f"O total deve ser 60 minutos (3600 segundos). Atual: {total_sec} segundos"
        )
    
    await db.settings.update_one(
        {"_id": "app_settings"},
        {"$set": {"session_durations": request.durations}},
        upsert=True
    )
    return {"message": "Durações atualizadas"}

# ============== EXPORT/IMPORT ROUTES ==============

@api_router.get("/export")
async def export_data(user: dict = Depends(get_current_user)):
    """Export all user data as JSON"""
    progress = await db.progress.find_one({"username": user["username"]})
    warmups = await db.warmups.find({"username": user["username"]}).to_list(1000)
    daily_logs = await db.daily_logs.find({"username": user["username"]}).to_list(1000)
    settings = await db.settings.find_one({"_id": "app_settings"})
    
    # Remove MongoDB _id fields
    if progress:
        progress.pop("_id", None)
    for w in warmups:
        w.pop("_id", None)
    for d in daily_logs:
        d.pop("_id", None)
    if settings:
        settings.pop("_id", None)
    
    return {
        "data": {
            "progress": progress,
            "warmups": warmups,
            "daily_logs": daily_logs,
            "settings": settings,
            "user": {
                "username": user["username"],
                "created_at": user["created_at"].isoformat() if user.get("created_at") else None,
                "first_login_at": user["first_login_at"].isoformat() if user.get("first_login_at") else None,
            }
        },
        "exported_at": datetime.utcnow().isoformat(),
        "version": "2.0"
    }

@api_router.post("/import/preview")
async def preview_import(request: ImportDataRequest, user: dict = Depends(get_current_user)):
    """Preview import data before applying"""
    data = request.data
    warnings = []
    
    # Validate structure
    if "progress" not in data and "data" not in data:
        return ImportPreviewResponse(valid=False, summary={}, warnings=["Formato de dados inválido"])
    
    # Handle nested data structure
    if "data" in data:
        data = data["data"]
    
    summary = {
        "has_progress": "progress" in data and data["progress"] is not None,
        "warmups_count": len(data.get("warmups", [])),
        "daily_logs_count": len(data.get("daily_logs", [])),
        "has_settings": "settings" in data and data["settings"] is not None,
    }
    
    # Check for potential data loss
    current_progress = await db.progress.find_one({"username": user["username"]})
    if current_progress:
        current_completed = sum(
            len(current_progress.get(s, {}).get("completed_lessons", []))
            for s in ["scales", "bow", "speed", "positions", "studies", "repertoire"]
        )
        if current_completed > 0:
            warnings.append(f"Você tem {current_completed} lições concluídas que serão substituídas")
    
    return ImportPreviewResponse(valid=True, summary=summary, warnings=warnings)

@api_router.post("/import")
async def import_data(request: ImportDataRequest, user: dict = Depends(get_current_user)):
    """Import user data from JSON backup"""
    data = request.data
    
    # Handle nested data structure
    if "data" in data:
        data = data["data"]
    
    if "progress" in data and data["progress"]:
        progress_data = data["progress"]
        progress_data["username"] = user["username"]
        progress_data.pop("_id", None)
        
        await db.progress.delete_one({"username": user["username"]})
        await db.progress.insert_one(progress_data)
    
    if "warmups" in data and data["warmups"]:
        await db.warmups.delete_many({"username": user["username"]})
        for warmup in data["warmups"]:
            warmup["username"] = user["username"]
            warmup.pop("_id", None)
            await db.warmups.insert_one(warmup)
    
    if "daily_logs" in data and data["daily_logs"]:
        await db.daily_logs.delete_many({"username": user["username"]})
        for log in data["daily_logs"]:
            log["username"] = user["username"]
            log.pop("_id", None)
            await db.daily_logs.insert_one(log)
    
    if "settings" in data and data["settings"]:
        settings = data["settings"]
        settings["_id"] = "app_settings"
        await db.settings.replace_one({"_id": "app_settings"}, settings, upsert=True)
    
    return {"message": "Dados importados com sucesso"}

@api_router.post("/reset")
async def reset_progress(user: dict = Depends(get_current_user)):
    """Reset all user progress"""
    await db.progress.delete_one({"username": user["username"]})
    await db.warmups.delete_many({"username": user["username"]})
    await db.daily_logs.delete_many({"username": user["username"]})
    await db.activity_log.delete_many({"username": user["username"]})
    await init_user_progress(user["username"])
    
    return {"message": "Progresso resetado com sucesso"}

# Include the router in the main app
app.include_router(api_router)

# CORS — read allowed origins from env, default to permissive for dev
_allowed_origins_str = os.environ.get('ALLOWED_ORIGINS', '')
_allowed_origins = [o.strip() for o in _allowed_origins_str.split(',') if o.strip()] if _allowed_origins_str else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=_allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(SecurityHeadersMiddleware)

# Serve frontend static files (built with: npx expo export --platform web)
FRONTEND_DIR = ROOT_DIR / "static"
if FRONTEND_DIR.exists():
    # Serve static assets (JS, CSS, images)
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIR / "assets")), name="assets")
    app.mount("/_expo", StaticFiles(directory=str(FRONTEND_DIR / "_expo")), name="expo")

    # Catch-all: serve index.html for any non-API route (SPA routing)
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Try to serve the exact file first
        file_path = FRONTEND_DIR / full_path
        if file_path.is_file():
            return FileResponse(str(file_path))
        # Fallback to index.html for SPA routing
        index_path = FRONTEND_DIR / "index.html"
        if index_path.exists():
            return FileResponse(str(index_path))
        raise HTTPException(status_code=404, detail="Not Found")
else:
    # Fallback root route when no frontend is built
    @app.get("/")
    async def root_info():
        return {
            "message": "Violin Study Plan API",
            "version": "2.0",
            "docs": "/docs",
            "api": "/api/"
        }

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
