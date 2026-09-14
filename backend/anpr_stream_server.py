import asyncio
import base64
import os
import cv2
import numpy as np
from fastapi import FastAPI, BackgroundTasks, HTTPException
from pydantic import BaseModel
from ultralytics import YOLO
from vidgear.gears import CamGear
from supabase import create_client, Client
from fastapi.middleware.cors import CORSMiddleware

# Initialize FastAPI app
app = FastAPI(
    title="StarTracker YOLO Stream & Supabase Bridge",
    description="Processes live CCTV/YouTube streams with YOLOv8, extracts color & telemetry, and logs to Supabase."
)

# Allow CORS for local frontend testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Supabase configuration
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://zacenlhwuibqvyeysegw.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphY2VubGh3dWlicXZ5ZXlzZWd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4MDAwNzMsImV4cCI6MjEwNDM3NjA3M30.XqEZ4n1JOG2D6lO8Gt-_sNg25HSlcN6XMBwpC7s1JCc")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Load YOLO model (CPU optimized nano weights)
print("Loading YOLOv8 model...")
try:
    model = YOLO('yolov8n.pt')
    print("YOLOv8 Model loaded successfully.")
except Exception as err:
    print(f"Warning loading YOLO model: {err}. Inference will initialize on first stream request.")
    model = None

# Global state for stream control
is_processing = False
processing_task = None
current_stream_url = ""

class StreamRequest(BaseModel):
    url: str
    camera_id: str = "YT-CAM"
    location: str = "YouTube Live Feed"

class DetectionInsertRequest(BaseModel):
    plate_number: str
    color: str
    confidence: float
    camera_id: str = "CAM-01"
    location: str = "City Sentry Node"
    object_type: str = "car"
    person_clothing_color: str = ""
    thumbnail: str = ""
    video_url: str = ""

def get_dominant_color(img):
    """Estimate dominant color of a vehicle or pedestrian crop."""
    try:
        h, w = img.shape[:2]
        if h == 0 or w == 0:
            return "Unknown"
            
        # Focus on upper/central body (avoid ground/tires)
        crop = img[int(h*0.1):int(h*0.65), int(w*0.1):int(w*0.9)]
        if crop.size == 0:
            return "Unknown"
        
        # Convert to HSV color space
        hsv = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)
        mean_h, mean_s, mean_v = cv2.mean(hsv)[:3]
        
        h = mean_h * 2  # OpenCV hue is 0-179 -> scaled to 0-360
        s = mean_s / 255.0
        v = mean_v / 255.0

        if s < 0.22 or v < 0.20:
            if v > 0.78: return "White"
            elif v < 0.28: return "Black"
            elif 0.28 <= v <= 0.78: return "Silver/Gray"
            return "Unknown"
        
        if (h < 15) or (h >= 345): return "Red"
        if 15 <= h < 45: return "Orange/Yellow"
        if 45 <= h < 75: return "Yellow"
        if 75 <= h < 165: return "Green"
        if 165 <= h < 260: return "Blue"
        if 260 <= h < 345: return "Purple/Pink"
        
        return "Unknown"
    except Exception as e:
        print(f"Color error: {e}")
        return "Unknown"

def process_video_stream(url: str, camera_id: str = "YT-CAM", location: str = "YouTube Live Feed"):
    """Background task to process a YouTube or RTSP stream."""
    global is_processing, model, current_stream_url
    is_processing = True
    current_stream_url = url

    print(f"Starting processing for {url} ({camera_id})")
    try:
        if model is None:
            model = YOLO('yolov8n.pt')

        options = {"STREAM_RESOLUTION": "480p", "STREAM_PARAMS": {"n_threads": "2"}}
        stream = CamGear(source=url, stream_mode=True, logging=True, **options).start()
        
        frame_skip = 15  # Process 1 frame out of 15 (approx 2 fps to save CPU)
        frame_count = 0
        recent_detections_count = {}

        while is_processing:
            frame = stream.read()
            if frame is None:
                break
                
            frame_count += 1
            if frame_count % frame_skip != 0:
                continue

            # Run YOLO on vehicles and pedestrians (0=person, 2=car, 3=motorcycle, 5=bus, 7=truck)
            results = model.predict(source=frame, classes=[0, 2, 3, 5, 7], conf=0.45, verbose=False)

            for result in results:
                boxes = result.boxes
                for box in boxes:
                    x1, y1, x2, y2 = [int(v) for v in box.xyxy[0]]
                    conf = float(box.conf[0])
                    cls_id = int(box.cls[0])
                    
                    h, w = frame.shape[:2]
                    x1, y1 = max(0, x1), max(0, y1)
                    x2, y2 = min(w, x2), min(h, y2)
                    
                    if x2 <= x1 or y2 <= y1:
                        continue

                    crop = frame[y1:y2, x1:x2]
                    color = get_dominant_color(crop)
                    
                    # Convert crop to base64 for thumbnail
                    _, buffer = cv2.imencode('.jpg', crop, [int(cv2.IMWRITE_JPEG_QUALITY), 65])
                    img_base64 = base64.b64encode(buffer).decode('utf-8')
                    thumb_data_url = f"data:image/jpeg;base64,{img_base64}"

                    is_person = (cls_id == 0)
                    object_type = "person" if is_person else ("car" if cls_id == 2 else ("motorcycle" if cls_id == 3 else ("bus" if cls_id == 5 else "truck")))
                    
                    plate_text = f"YT-{camera_id}"
                    person_clothes = f"{color} apparel" if is_person else None

                    # Deduplication check
                    dedup_key = f"{object_type}-{color}"
                    if dedup_key not in recent_detections_count:
                        recent_detections_count[dedup_key] = 1
                    else:
                        recent_detections_count[dedup_key] += 1
                        if recent_detections_count[dedup_key] > 6: 
                            continue

                    record = {
                        "plate_number": f"{plate_text}-{recent_detections_count[dedup_key]}",
                        "color": color,
                        "confidence": round(conf, 2),
                        "camera_id": camera_id,
                        "thumbnail": thumb_data_url,
                        "location": location,
                        "object_type": object_type,
                        "person_clothing_color": person_clothes,
                        "video_url": url
                    }

                    try:
                        supabase.table('vehicle_detections').insert(record).execute()
                        print(f"Inserted into Supabase: {object_type} | {color} | Conf: {conf:.2f}")
                    except Exception as e:
                        print(f"Supabase error: {e}")

        stream.stop()
    except Exception as e:
        print(f"Stream error: {e}")
    finally:
        is_processing = False
        current_stream_url = ""
        print("Processing stopped.")


@app.post("/start_stream")
async def start_stream(req: StreamRequest, background_tasks: BackgroundTasks):
    global is_processing
    if is_processing:
        return {"status": "error", "message": "A stream is already being processed. Stop it first."}
    
    background_tasks.add_task(process_video_stream, req.url, req.camera_id, req.location)
    return {"status": "success", "message": f"Started processing stream: {req.url}"}

@app.get("/stop_stream")
async def stop_stream():
    global is_processing
    if not is_processing:
        return {"status": "info", "message": "No stream is currently processing."}
    
    is_processing = False
    return {"status": "success", "message": "Stopping stream processing..."}

@app.get("/status")
async def status():
    return {
        "is_processing": is_processing,
        "current_stream_url": current_stream_url,
        "supabase_connected": bool(SUPABASE_URL and SUPABASE_KEY)
    }

@app.post("/insert_detection")
async def insert_detection_manual(req: DetectionInsertRequest):
    """Directly insert a detection record into Supabase."""
    record = req.dict()
    try:
        res = supabase.table('vehicle_detections').insert(record).execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/search")
async def search_endpoint(q: str):
    """Search Supabase by plate or color or clothes."""
    try:
        res = supabase.table('vehicle_detections') \
            .select('*') \
            .or_(f"plate_number.ilike.%{q}%,color.ilike.%{q}%,person_clothing_color.ilike.%{q}%") \
            .order('detected_at', desc=True) \
            .limit(50) \
            .execute()
        return {"status": "success", "results": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
