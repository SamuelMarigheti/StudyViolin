FROM python:3.11-slim

WORKDIR /app

# Copy backend files
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

# Railway injects PORT env var
ENV PORT=8000
EXPOSE 8000

CMD uvicorn server:app --host 0.0.0.0 --port $PORT
