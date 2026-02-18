# Stage 1: Build frontend
FROM node:20-slim AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
ENV EXPO_PUBLIC_BACKEND_URL=""
RUN npx expo export --platform web

# Stage 2: Backend + frontend static files
FROM python:3.11-slim
WORKDIR /app

# Install backend dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ .

# Copy frontend build output to backend static folder
COPY --from=frontend-build /app/frontend/dist ./static

ENV PORT=8000
EXPOSE 8000

CMD uvicorn server:app --host 0.0.0.0 --port $PORT
