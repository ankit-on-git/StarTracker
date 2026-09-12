import os
from typing import List

try:
    from pydantic_settings import BaseSettings
    class Settings(BaseSettings):
        PROJECT_NAME: str = "StarTracker"
        VERSION: str = "1.0.0"
        API_V1_PREFIX: str = "/api"
        HOST: str = os.getenv("BACKEND_HOST", "0.0.0.0")
        PORT: int = int(os.getenv("BACKEND_PORT", "8000"))
        DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"
        CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000", "*"]
        SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
        SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
        SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
        YOLO_MODEL_PATH: str = os.getenv("YOLO_MODEL_PATH", "yolov8n.pt")
        CONFIDENCE_THRESHOLD: float = float(os.getenv("CONFIDENCE_THRESHOLD", "0.45"))
        FRAME_SKIP: int = int(os.getenv("FRAME_SKIP", "3"))
        ENABLE_PADDLEOCR: bool = os.getenv("ENABLE_PADDLEOCR", "true").lower() == "true"
        STORAGE_BUCKET: str = os.getenv("STORAGE_BUCKET", "startracker-media")
        class Config:
            env_file = ".env"
            extra = "allow"
except ImportError:
    class Settings:
        PROJECT_NAME: str = "StarTracker"
        VERSION: str = "1.0.0"
        API_V1_PREFIX: str = "/api"
        HOST: str = os.getenv("BACKEND_HOST", "0.0.0.0")
        PORT: int = int(os.getenv("BACKEND_PORT", "8000"))
        DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"
        CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000", "*"]
        SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
        SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
        SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
        YOLO_MODEL_PATH: str = os.getenv("YOLO_MODEL_PATH", "yolov8n.pt")
        CONFIDENCE_THRESHOLD: float = float(os.getenv("CONFIDENCE_THRESHOLD", "0.45"))
        FRAME_SKIP: int = int(os.getenv("FRAME_SKIP", "3"))
        ENABLE_PADDLEOCR: bool = os.getenv("ENABLE_PADDLEOCR", "true").lower() == "true"
        STORAGE_BUCKET: str = os.getenv("STORAGE_BUCKET", "startracker-media")

settings = Settings()

