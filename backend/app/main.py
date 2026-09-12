"""
StarTracker - Main FastAPI Application Server
SIH26127: City-Wide AI Engine for Multi-Camera ANPR Trajectory Tracking
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.config import settings
from app.api.routes import router as api_router

app = FastAPI(
    title="StarTracker API",
    description="City-Wide AI Traffic Intelligence Platform (SIH26127) - Multi-Camera ANPR & Attribute Tracking",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure Cross-Origin Resource Sharing (CORS) for Next.js / React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes under /api
app.include_router(api_router, prefix="/api")

# Serve sample images/videos if directory exists
sample_data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../sample_data"))
if os.path.exists(sample_data_dir):
    app.mount("/sample_data", StaticFiles(directory=sample_data_dir), name="sample_data")


@app.get("/", tags=["Root"])
def root():
    return {
        "project": "StarTracker",
        "description": "City-Wide AI Engine for Multi-Camera ANPR Trajectory Tracking and Urban Traffic Analytics",
        "problem_statement": "SIH26127",
        "documentation": "/docs",
        "health_check": "/api/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
