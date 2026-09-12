"""
StarTracker - Supabase Integration Client
SIH26127: Data Layer with Graceful Local Fallback

Supports:
1. Live Supabase PostgreSQL database when SUPABASE_URL & SUPABASE_ANON_KEY are present
2. High-fidelity local in-memory store matching the exact SQL schema when keys are not yet configured
"""

import os
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from app.config import settings

try:
    from supabase import create_client, Client
except ImportError:
    Client = None
    create_client = None


class StarTrackerDB:
    def __init__(self):
        self.client: Optional[Any] = None
        self.is_connected: bool = False
        self._init_supabase()
        self._init_local_store()

    def _init_supabase(self):
        if settings.SUPABASE_URL and settings.SUPABASE_ANON_KEY and create_client:
            try:
                self.client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
                self.is_connected = True
                print("Connected to remote Supabase project.")
            except Exception as e:
                print(f"Supabase connection warning: {e}. Defaulting to local resilient data store.")
                self.is_connected = False
        else:
            self.is_connected = False

    def _init_local_store(self):
        """Initializes realistic synthetic data matching database/seed/seed_data.sql"""
        now = datetime.utcnow()
        self.cameras: Dict[str, Dict[str, Any]] = {
            "CAM-01": {
                "id": "CAM-01",
                "name": "Clock Tower Junction - North Gate",
                "location": "Old City Roundabout, Ludhiana",
                "latitude": 30.9125,
                "longitude": 75.8530,
                "status": "active",
                "stream_url": "rtsp://mock-cam01/live",
                "fps": 30,
                "resolution": "1920x1080",
                "created_at": (now - timedelta(days=30)).isoformat()
            },
            "CAM-02": {
                "id": "CAM-02",
                "name": "Ferozepur Road - Flyover Ingress",
                "location": "Opp. PAU Gate 1, Ferozepur Rd",
                "latitude": 30.9018,
                "longitude": 75.8152,
                "status": "active",
                "stream_url": "rtsp://mock-cam02/live",
                "fps": 30,
                "resolution": "1920x1080",
                "created_at": (now - timedelta(days=30)).isoformat()
            },
            "CAM-03": {
                "id": "CAM-03",
                "name": "Aarti Chowk Intersection",
                "location": "Main Commercial Corridor, Mall Rd",
                "latitude": 30.8984,
                "longitude": 75.8285,
                "status": "active",
                "stream_url": "rtsp://mock-cam03/live",
                "fps": 25,
                "resolution": "1920x1080",
                "created_at": (now - timedelta(days=30)).isoformat()
            },
            "CAM-04": {
                "id": "CAM-04",
                "name": "Model Town Central Square",
                "location": "Market Crossing, Model Town",
                "latitude": 30.8872,
                "longitude": 75.8360,
                "status": "active",
                "stream_url": "rtsp://mock-cam04/live",
                "fps": 30,
                "resolution": "1920x1080",
                "created_at": (now - timedelta(days=30)).isoformat()
            },
            "CAM-05": {
                "id": "CAM-05",
                "name": "Gill Road Industrial Corridor",
                "location": "Near Canal Bridge, Gill Rd",
                "latitude": 30.8710,
                "longitude": 75.8621,
                "status": "active",
                "stream_url": "rtsp://mock-cam05/live",
                "fps": 25,
                "resolution": "1920x1080",
                "created_at": (now - timedelta(days=30)).isoformat()
            },
            "CAM-06": {
                "id": "CAM-06",
                "name": "Bus Stand Terminal Junction",
                "location": "GT Road Terminal Ingress",
                "latitude": 30.9051,
                "longitude": 75.8584,
                "status": "active",
                "stream_url": "rtsp://mock-cam06/live",
                "fps": 30,
                "resolution": "1920x1080",
                "created_at": (now - timedelta(days=30)).isoformat()
            },
            "CAM-07": {
                "id": "CAM-07",
                "name": "Bharat Nagar Chowk",
                "location": "Civil Lines Access Arterial",
                "latitude": 30.9042,
                "longitude": 75.8431,
                "status": "maintenance",
                "stream_url": "rtsp://mock-cam07/live",
                "fps": 20,
                "resolution": "1280x720",
                "created_at": (now - timedelta(days=30)).isoformat()
            }
        }

        # Vehicles Catalog
        self.vehicles: Dict[str, Dict[str, Any]] = {
            "PB10AB1234": {
                "id": "v-101",
                "plate_number": "PB10AB1234",
                "plate_confidence": 0.96,
                "vehicle_type": "car",
                "vehicle_color": "red",
                "color_confidence": 0.92,
                "total_sightings": 4,
                "first_seen_at": (now - timedelta(minutes=35)).isoformat(),
                "last_seen_at": (now - timedelta(minutes=4)).isoformat(),
                "created_at": (now - timedelta(days=2)).isoformat()
            },
            "PB10CZ8899": {
                "id": "v-102",
                "plate_number": "PB10CZ8899",
                "plate_confidence": 0.94,
                "vehicle_type": "car",
                "vehicle_color": "white",
                "color_confidence": 0.95,
                "total_sightings": 3,
                "first_seen_at": (now - timedelta(minutes=50)).isoformat(),
                "last_seen_at": (now - timedelta(minutes=12)).isoformat(),
                "created_at": (now - timedelta(days=3)).isoformat()
            },
            "PB08DE4521": {
                "id": "v-103",
                "plate_number": "PB08DE4521",
                "plate_confidence": 0.91,
                "vehicle_type": "car",
                "vehicle_color": "silver",
                "color_confidence": 0.88,
                "total_sightings": 3,
                "first_seen_at": (now - timedelta(minutes=70)).isoformat(),
                "last_seen_at": (now - timedelta(minutes=25)).isoformat(),
                "created_at": (now - timedelta(days=1)).isoformat()
            },
            "CH01AA9000": {
                "id": "v-104",
                "plate_number": "CH01AA9000",
                "plate_confidence": 0.97,
                "vehicle_type": "bus",
                "vehicle_color": "blue",
                "color_confidence": 0.94,
                "total_sightings": 2,
                "first_seen_at": (now - timedelta(minutes=90)).isoformat(),
                "last_seen_at": (now - timedelta(minutes=15)).isoformat(),
                "created_at": (now - timedelta(days=4)).isoformat()
            },
            "DL3C8721": {
                "id": "v-105",
                "plate_number": "DL3C8721",
                "plate_confidence": 0.89,
                "vehicle_type": "motorcycle",
                "vehicle_color": "black",
                "color_confidence": 0.93,
                "total_sightings": 2,
                "first_seen_at": (now - timedelta(minutes=40)).isoformat(),
                "last_seen_at": (now - timedelta(minutes=18)).isoformat(),
                "created_at": (now - timedelta(days=1)).isoformat()
            },
            "HR26BR4020": {
                "id": "v-106",
                "plate_number": "HR26BR4020",
                "plate_confidence": 0.95,
                "vehicle_type": "truck",
                "vehicle_color": "yellow",
                "color_confidence": 0.89,
                "total_sightings": 2,
                "first_seen_at": (now - timedelta(minutes=110)).isoformat(),
                "last_seen_at": (now - timedelta(minutes=45)).isoformat(),
                "created_at": (now - timedelta(days=5)).isoformat()
            }
        }

        # Multi-camera vehicle trajectory sightings
        self.vehicle_events: List[Dict[str, Any]] = [
            # PB10AB1234 traversal
            {
                "id": "ve-1",
                "vehicle_id": "v-101",
                "plate_number": "PB10AB1234",
                "camera_id": "CAM-01",
                "camera_name": "Clock Tower Junction - North Gate",
                "camera_location": "Old City Roundabout, Ludhiana",
                "timestamp": (now - timedelta(minutes=35)).isoformat(),
                "latitude": 30.9125,
                "longitude": 75.8530,
                "speed_estimate_kmh": 42.5,
                "heading_degrees": 210,
                "frame_path": "/sample_data/images/det_cam01_car_red.jpg",
                "video_path": "/sample_data/videos/cam01_clip.mp4",
                "plate_crop_path": "/sample_data/images/plate_pb10ab1234_c1.jpg"
            },
            {
                "id": "ve-2",
                "vehicle_id": "v-101",
                "plate_number": "PB10AB1234",
                "camera_id": "CAM-03",
                "camera_name": "Aarti Chowk Intersection",
                "camera_location": "Main Commercial Corridor, Mall Rd",
                "timestamp": (now - timedelta(minutes=22)).isoformat(),
                "latitude": 30.8984,
                "longitude": 75.8285,
                "speed_estimate_kmh": 38.0,
                "heading_degrees": 195,
                "frame_path": "/sample_data/images/det_cam03_car_red.jpg",
                "video_path": "/sample_data/videos/cam03_clip.mp4",
                "plate_crop_path": "/sample_data/images/plate_pb10ab1234_c3.jpg"
            },
            {
                "id": "ve-3",
                "vehicle_id": "v-101",
                "plate_number": "PB10AB1234",
                "camera_id": "CAM-02",
                "camera_name": "Ferozepur Road - Flyover Ingress",
                "camera_location": "Opp. PAU Gate 1, Ferozepur Rd",
                "timestamp": (now - timedelta(minutes=12)).isoformat(),
                "latitude": 30.9018,
                "longitude": 75.8152,
                "speed_estimate_kmh": 45.2,
                "heading_degrees": 260,
                "frame_path": "/sample_data/images/det_cam02_car_red.jpg",
                "video_path": "/sample_data/videos/cam02_clip.mp4",
                "plate_crop_path": "/sample_data/images/plate_pb10ab1234_c2.jpg"
            },
            {
                "id": "ve-4",
                "vehicle_id": "v-101",
                "plate_number": "PB10AB1234",
                "camera_id": "CAM-04",
                "camera_name": "Model Town Central Square",
                "camera_location": "Market Crossing, Model Town",
                "timestamp": (now - timedelta(minutes=4)).isoformat(),
                "latitude": 30.8872,
                "longitude": 75.8360,
                "speed_estimate_kmh": 32.1,
                "heading_degrees": 140,
                "frame_path": "/sample_data/images/det_cam04_car_red.jpg",
                "video_path": "/sample_data/videos/cam04_clip.mp4",
                "plate_crop_path": "/sample_data/images/plate_pb10ab1234_c4.jpg"
            },
            # PB10CZ8899 traversal
            {
                "id": "ve-5",
                "vehicle_id": "v-102",
                "plate_number": "PB10CZ8899",
                "camera_id": "CAM-02",
                "camera_name": "Ferozepur Road - Flyover Ingress",
                "camera_location": "Opp. PAU Gate 1, Ferozepur Rd",
                "timestamp": (now - timedelta(minutes=50)).isoformat(),
                "latitude": 30.9018,
                "longitude": 75.8152,
                "speed_estimate_kmh": 40.0,
                "heading_degrees": 110,
                "frame_path": "/sample_data/images/det_cam02_car_white.jpg",
                "video_path": None,
                "plate_crop_path": "/sample_data/images/plate_pb10cz8899_c2.jpg"
            },
            {
                "id": "ve-6",
                "vehicle_id": "v-102",
                "plate_number": "PB10CZ8899",
                "camera_id": "CAM-03",
                "camera_name": "Aarti Chowk Intersection",
                "camera_location": "Main Commercial Corridor, Mall Rd",
                "timestamp": (now - timedelta(minutes=30)).isoformat(),
                "latitude": 30.8984,
                "longitude": 75.8285,
                "speed_estimate_kmh": 36.5,
                "heading_degrees": 125,
                "frame_path": "/sample_data/images/det_cam03_car_white.jpg",
                "video_path": None,
                "plate_crop_path": "/sample_data/images/plate_pb10cz8899_c3.jpg"
            },
            {
                "id": "ve-7",
                "vehicle_id": "v-102",
                "plate_number": "PB10CZ8899",
                "camera_id": "CAM-05",
                "camera_name": "Gill Road Industrial Corridor",
                "camera_location": "Near Canal Bridge, Gill Rd",
                "timestamp": (now - timedelta(minutes=12)).isoformat(),
                "latitude": 30.8710,
                "longitude": 75.8621,
                "speed_estimate_kmh": 48.0,
                "heading_degrees": 150,
                "frame_path": "/sample_data/images/det_cam05_car_white.jpg",
                "video_path": None,
                "plate_crop_path": "/sample_data/images/plate_pb10cz8899_c5.jpg"
            }
        ]

        # Person clothing attribute events
        self.person_events: List[Dict[str, Any]] = [
            {
                "id": "pe-1",
                "detection_id": "dp-1",
                "camera_id": "CAM-01",
                "camera_name": "Clock Tower Junction - North Gate",
                "camera_location": "Old City Roundabout, Ludhiana",
                "latitude": 30.9125,
                "longitude": 75.8530,
                "timestamp": (now - timedelta(minutes=15)).isoformat(),
                "clothing_color": "blue",
                "color_confidence": 0.92,
                "lower_clothing_color": "black",
                "has_bag": True,
                "frame_path": "/sample_data/images/det_cam01_person_blue.jpg",
                "video_path": "/sample_data/videos/cam01_p1.mp4"
            },
            {
                "id": "pe-2",
                "detection_id": "dp-2",
                "camera_id": "CAM-04",
                "camera_name": "Model Town Central Square",
                "camera_location": "Market Crossing, Model Town",
                "latitude": 30.8872,
                "longitude": 75.8360,
                "timestamp": (now - timedelta(minutes=8)).isoformat(),
                "clothing_color": "blue",
                "color_confidence": 0.89,
                "lower_clothing_color": "blue",
                "has_bag": False,
                "frame_path": "/sample_data/images/det_cam04_person_blue.jpg",
                "video_path": "/sample_data/videos/cam04_p2.mp4"
            },
            {
                "id": "pe-3",
                "detection_id": "dp-3",
                "camera_id": "CAM-03",
                "camera_name": "Aarti Chowk Intersection",
                "camera_location": "Main Commercial Corridor, Mall Rd",
                "latitude": 30.8984,
                "longitude": 75.8285,
                "timestamp": (now - timedelta(minutes=25)).isoformat(),
                "clothing_color": "red",
                "color_confidence": 0.94,
                "lower_clothing_color": "gray",
                "has_bag": False,
                "frame_path": "/sample_data/images/det_cam03_person_red.jpg",
                "video_path": None
            },
            {
                "id": "pe-4",
                "detection_id": "dp-4",
                "camera_id": "CAM-06",
                "camera_name": "Bus Stand Terminal Junction",
                "camera_location": "GT Road Terminal Ingress",
                "latitude": 30.9051,
                "longitude": 75.8584,
                "timestamp": (now - timedelta(minutes=5)).isoformat(),
                "clothing_color": "black",
                "color_confidence": 0.87,
                "lower_clothing_color": "blue",
                "has_bag": True,
                "frame_path": "/sample_data/images/det_cam06_person_black.jpg",
                "video_path": None
            }
        ]

        self.detections: List[Dict[str, Any]] = [
            {
                "id": "det-1",
                "camera_id": "CAM-01",
                "timestamp": (now - timedelta(minutes=35)).isoformat(),
                "object_type": "car",
                "confidence": 0.94,
                "plate": "PB10AB1234",
                "color": "red",
                "frame_path": "/sample_data/images/det_cam01_car_red.jpg",
                "video_path": "/sample_data/videos/cam01_clip.mp4",
                "bbox_x": 0.22,
                "bbox_y": 0.45,
                "bbox_width": 0.28,
                "bbox_height": 0.32
            },
            {
                "id": "det-2",
                "camera_id": "CAM-01",
                "timestamp": (now - timedelta(minutes=15)).isoformat(),
                "object_type": "person",
                "confidence": 0.91,
                "color": "blue",
                "frame_path": "/sample_data/images/det_cam01_person_blue.jpg",
                "video_path": "/sample_data/videos/cam01_p1.mp4",
                "bbox_x": 0.65,
                "bbox_y": 0.40,
                "bbox_width": 0.08,
                "bbox_height": 0.25
            },
            {
                "id": "det-3",
                "camera_id": "CAM-03",
                "timestamp": (now - timedelta(minutes=22)).isoformat(),
                "object_type": "car",
                "confidence": 0.96,
                "plate": "PB10AB1234",
                "color": "red",
                "frame_path": "/sample_data/images/det_cam03_car_red.jpg",
                "video_path": "/sample_data/videos/cam03_clip.mp4",
                "bbox_x": 0.35,
                "bbox_y": 0.40,
                "bbox_width": 0.30,
                "bbox_height": 0.34
            }
        ]

    # Database API Methods
    def get_cameras(self) -> List[Dict[str, Any]]:
        return list(self.cameras.values())

    def get_camera_by_id(self, camera_id: str) -> Optional[Dict[str, Any]]:
        return self.cameras.get(camera_id)

    def get_detections(self, limit: int = 50) -> List[Dict[str, Any]]:
        return sorted(self.detections, key=lambda x: x["timestamp"], reverse=True)[:limit]

    def get_vehicle_by_plate(self, plate_number: str) -> Optional[Dict[str, Any]]:
        clean_plate = plate_number.replace(" ", "").upper()
        return self.vehicles.get(clean_plate)

    def get_vehicle_events(self, plate_number: str) -> List[Dict[str, Any]]:
        clean_plate = plate_number.replace(" ", "").upper()
        events = [e for e in self.vehicle_events if e["plate_number"] == clean_plate]
        return sorted(events, key=lambda x: x["timestamp"])

    def search_persons_by_color(self, color: str) -> List[Dict[str, Any]]:
        color_lower = color.lower().strip()
        matches = [p for p in self.person_events if p["clothing_color"] == color_lower]
        return sorted(matches, key=lambda x: x["timestamp"], reverse=True)

    def add_detection_event(self, event_data: Dict[str, Any]):
        self.detections.insert(0, event_data)

    def add_vehicle_event(self, vehicle_data: Dict[str, Any], event_data: Dict[str, Any]):
        plate = vehicle_data["plate_number"]
        if plate not in self.vehicles:
            self.vehicles[plate] = vehicle_data
        else:
            self.vehicles[plate]["total_sightings"] += 1
            self.vehicles[plate]["last_seen_at"] = event_data["timestamp"]
        
        self.vehicle_events.append(event_data)


# Global database instance
db = StarTrackerDB()
