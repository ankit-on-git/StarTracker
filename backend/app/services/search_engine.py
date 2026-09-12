"""
StarTracker - Universal Traffic Attribute & ANPR Search Engine
SIH26127: Multi-Modal Query Parsing (Plates, Vehicle Attributes, Clothing Attributes)

Dispatches:
1. License Plate Search: 'PB10AB1234', 'PB 10 AB 1234', '1234', fuzzy matching
2. Vehicle Attribute Search: 'red car', 'white vehicle', 'blue bus', 'black motorcycle'
3. Person Attribute Search: 'person wearing blue', 'clothing blue', 'red jacket'
   (Strictly attribute-based, no facial recognition)
"""

import re
from typing import Dict, Any, List
from app.services.supabase_client import db
from app.cv.color_classifier import SUPPORTED_COLORS
from app.cv.plate_processor import plate_processor

VEHICLE_KEYWORDS = ["car", "motorcycle", "bike", "bus", "truck", "van", "auto", "vehicle"]
PERSON_KEYWORDS = ["person", "people", "man", "woman", "pedestrian", "wearing", "clothing", "shirt", "jacket"]


class SearchEngine:
    def __init__(self):
        self.db = db
        self.plate_processor = plate_processor

    def parse_query(self, raw_query: str) -> Dict[str, Any]:
        """
        Extracts semantic intent and structured attributes from natural language search query.
        """
        q = raw_query.strip()
        q_lower = q.lower()

        # 1. Check for Person Clothing Query
        is_person = any(w in q_lower for w in PERSON_KEYWORDS)
        detected_colors = [c for c in SUPPORTED_COLORS if re.search(r'\b' + c + r'\b', q_lower)]

        if is_person or (detected_colors and any(w in q_lower for w in ["wear", "cloth", "dress", "jacket"])):
            target_color = detected_colors[0] if detected_colors else "blue"
            return {
                "type": "person_attribute",
                "color": target_color,
                "raw_query": q
            }

        # 2. Check for Vehicle Attribute Query (e.g. 'red car', 'white truck')
        detected_vehicle_types = [v for v in VEHICLE_KEYWORDS if re.search(r'\b' + v + r'\b', q_lower)]
        if detected_colors and detected_vehicle_types:
            v_type = detected_vehicle_types[0]
            if v_type in ["bike", "motorcycle"]:
                v_type = "motorcycle"
            elif v_type == "vehicle":
                v_type = None  # Match any vehicle type

            return {
                "type": "vehicle_attribute",
                "color": detected_colors[0],
                "vehicle_type": v_type,
                "raw_query": q
            }

        if detected_colors and any(w in q_lower for w in ["car", "vehicle", "truck", "bus"]):
            return {
                "type": "vehicle_attribute",
                "color": detected_colors[0],
                "vehicle_type": None,
                "raw_query": q
            }

        # 3. Default: Assume License Plate Query (Exact, Normalized, or Fuzzy)
        clean_plate = self.plate_processor.clean_raw_text(q)
        return {
            "type": "plate",
            "plate_candidate": clean_plate,
            "raw_query": q
        }

    def execute_search(self, raw_query: str) -> Dict[str, Any]:
        """
        Executes unified search and returns standardized response conforming
        to the universal search bar specification.
        """
        parsed = self.parse_query(raw_query)
        q_type = parsed["type"]

        if q_type == "plate":
            return self._search_by_plate(parsed["plate_candidate"], raw_query)
        elif q_type == "vehicle_attribute":
            return self._search_by_vehicle_attributes(parsed["color"], parsed.get("vehicle_type"), raw_query)
        elif q_type == "person_attribute":
            return self._search_by_person_attributes(parsed["color"], raw_query)

        return {
            "query_type": "unknown",
            "parsed_filters": parsed,
            "total_results": 0,
            "vehicles": [],
            "persons": []
        }

    def _search_by_plate(self, plate_candidate: str, raw_query: str) -> Dict[str, Any]:
        matched_vehicles = []
        all_vehicles = list(self.db.vehicles.values())

        for v in all_vehicles:
            is_match, score = self.plate_processor.match_plate_fuzzy(plate_candidate, v["plate_number"])
            if is_match or plate_candidate in v["plate_number"]:
                events = self.db.get_vehicle_events(v["plate_number"])
                trajectory_points = []
                for idx, ev in enumerate(events, 1):
                    trajectory_points.append({
                        "sequence": idx,
                        "camera_id": ev["camera_id"],
                        "camera_name": ev.get("camera_name", ev["camera_id"]),
                        "camera_location": ev.get("camera_location", "Urban Node"),
                        "latitude": ev["latitude"],
                        "longitude": ev["longitude"],
                        "timestamp": ev["timestamp"],
                        "speed_estimate_kmh": ev.get("speed_estimate_kmh"),
                        "frame_path": ev.get("frame_path"),
                        "video_path": ev.get("video_path"),
                        "plate_crop_path": ev.get("plate_crop_path")
                    })

                matched_vehicles.append({
                    "vehicle": v,
                    "events": trajectory_points,
                    "total_cameras": len(set(p["camera_id"] for p in trajectory_points)),
                    "time_span_minutes": self._calculate_time_span(trajectory_points)
                })

        return {
            "query_type": "plate",
            "parsed_filters": {"plate_number": plate_candidate},
            "total_results": len(matched_vehicles),
            "vehicles": matched_vehicles,
            "persons": []
        }

    def _search_by_vehicle_attributes(self, color: str, v_type: str = None, raw_query: str = "") -> Dict[str, Any]:
        matched_vehicles = []
        all_vehicles = list(self.db.vehicles.values())

        for v in all_vehicles:
            color_match = (v["vehicle_color"].lower() == color.lower())
            type_match = True
            if v_type:
                type_match = (v["vehicle_type"].lower() == v_type.lower())

            if color_match and type_match:
                events = self.db.get_vehicle_events(v["plate_number"])
                trajectory_points = []
                for idx, ev in enumerate(events, 1):
                    trajectory_points.append({
                        "sequence": idx,
                        "camera_id": ev["camera_id"],
                        "camera_name": ev.get("camera_name", ev["camera_id"]),
                        "camera_location": ev.get("camera_location", "Urban Node"),
                        "latitude": ev["latitude"],
                        "longitude": ev["longitude"],
                        "timestamp": ev["timestamp"],
                        "speed_estimate_kmh": ev.get("speed_estimate_kmh"),
                        "frame_path": ev.get("frame_path"),
                        "video_path": ev.get("video_path"),
                        "plate_crop_path": ev.get("plate_crop_path")
                    })

                matched_vehicles.append({
                    "vehicle": v,
                    "events": trajectory_points,
                    "total_cameras": len(set(p["camera_id"] for p in trajectory_points)),
                    "time_span_minutes": self._calculate_time_span(trajectory_points)
                })

        return {
            "query_type": "vehicle_attribute",
            "parsed_filters": {"color": color, "vehicle_type": v_type},
            "total_results": len(matched_vehicles),
            "vehicles": matched_vehicles,
            "persons": []
        }

    def _search_by_person_attributes(self, color: str, raw_query: str) -> Dict[str, Any]:
        matched_persons = self.db.search_persons_by_color(color)
        return {
            "query_type": "person_attribute",
            "parsed_filters": {"clothing_color": color},
            "disclaimer": "Strictly attribute-based visual search (upper-body clothing color). No facial recognition.",
            "total_results": len(matched_persons),
            "vehicles": [],
            "persons": matched_persons
        }

    def _calculate_time_span(self, points: List[Dict[str, Any]]) -> float:
        if len(points) < 2:
            return 0.0
        try:
            from datetime import datetime
            t_first = datetime.fromisoformat(points[0]["timestamp"].replace("Z", "+00:00"))
            t_last = datetime.fromisoformat(points[-1]["timestamp"].replace("Z", "+00:00"))
            return round(abs((t_last - t_first).total_seconds()) / 60.0, 1)
        except Exception:
            return 0.0


# Global singleton instance
search_engine = SearchEngine()
