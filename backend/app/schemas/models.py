from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class CameraBase(BaseModel):
    id: str
    name: str
    location: str
    latitude: float
    longitude: float
    status: str = "active"
    stream_url: Optional[str] = None
    fps: int = 25
    resolution: str = "1920x1080"

class Camera(CameraBase):
    created_at: Optional[datetime] = None
    last_detection_time: Optional[datetime] = None
    total_detections: Optional[int] = 0

class DetectionBase(BaseModel):
    camera_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    object_type: str
    confidence: float
    bbox_x: float
    bbox_y: float
    bbox_width: float
    bbox_height: float
    frame_path: Optional[str] = None
    video_path: Optional[str] = None

class Detection(DetectionBase):
    id: str
    created_at: Optional[datetime] = None

class VehicleBase(BaseModel):
    plate_number: str
    plate_confidence: float = 0.0
    vehicle_type: str = "car"
    vehicle_color: str = "unknown"
    color_confidence: float = 0.0

class Vehicle(VehicleBase):
    id: str
    total_sightings: int = 1
    first_seen_at: Optional[datetime] = None
    last_seen_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

class VehicleEventBase(BaseModel):
    vehicle_id: str
    detection_id: Optional[str] = None
    camera_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    latitude: float
    longitude: float
    speed_estimate_kmh: Optional[float] = None
    heading_degrees: Optional[float] = None
    frame_path: Optional[str] = None
    video_path: Optional[str] = None
    plate_crop_path: Optional[str] = None

class VehicleEvent(VehicleEventBase):
    id: str
    camera_name: Optional[str] = None
    camera_location: Optional[str] = None
    created_at: Optional[datetime] = None

class TrajectoryPoint(BaseModel):
    sequence: int
    camera_id: str
    camera_name: str
    camera_location: str
    latitude: float
    longitude: float
    timestamp: datetime
    speed_estimate_kmh: Optional[float] = None
    frame_path: Optional[str] = None
    video_path: Optional[str] = None

class VehicleTrajectory(BaseModel):
    vehicle: Vehicle
    events: List[TrajectoryPoint]
    total_cameras: int
    time_span_minutes: float

class PersonEventBase(BaseModel):
    detection_id: Optional[str] = None
    camera_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    clothing_color: str
    color_confidence: float = 0.0
    lower_clothing_color: Optional[str] = None
    has_bag: bool = False
    frame_path: Optional[str] = None
    video_path: Optional[str] = None

class PersonEvent(PersonEventBase):
    id: str
    camera_name: Optional[str] = None
    camera_location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at: Optional[datetime] = None

class UniversalSearchQuery(BaseModel):
    query: str
    camera_id: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    limit: int = 50

class UniversalSearchResponse(BaseModel):
    query_type: str # 'plate', 'vehicle_attribute', 'person_attribute', 'unknown'
    parsed_filters: Dict[str, Any]
    total_results: int
    vehicles: List[VehicleTrajectory] = []
    persons: List[PersonEvent] = []

class AnalyticsSummary(BaseModel):
    total_detections: int
    active_cameras: int
    anpr_reads: int
    detected_vehicles: int
    detected_persons: int
    vehicle_type_breakdown: Dict[str, int]
    color_distribution: Dict[str, int]
    hourly_traffic: List[Dict[str, Any]]
    camera_activity: List[Dict[str, Any]]

class VideoProcessRequest(BaseModel):
    video_path: str
    camera_id: str
    frame_skip: int = 3
    sample_preset: Optional[str] = None

class VideoProcessResponse(BaseModel):
    status: str
    video_path: str
    camera_id: str
    frames_processed: int
    detections_created: int
    vehicles_identified: int
    persons_identified: int
    sample_detections: List[Dict[str, Any]]
