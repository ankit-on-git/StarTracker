@echo off
echo ========================================================
echo StarTracker YOLO Stream & Supabase Ingestion Worker
echo ========================================================
python -m venv venv
call venv\Scripts\activate.bat
pip install fastapi uvicorn ultralytics opencv-python vidgear[asyncio] supabase python-dotenv
echo Starting Python YOLO + Supabase Streaming Bridge on http://localhost:8000 ...
uvicorn anpr_stream_server:app --reload --host 0.0.0.0 --port 8000
