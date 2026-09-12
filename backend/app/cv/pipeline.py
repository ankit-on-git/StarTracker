"""
StarTracker - Integrated Computer Vision Pipeline
SIH26127: Video Frame -> Detection -> ANPR -> Attributes -> Database Event

Flow:
1. Frame Ingestion
2. YOLO Object Detection (Vehicles & Persons)
3. For Vehicles:
   - Crop vehicle
   - Classify vehicle body color via explainable HSV analysis
   - Locate license plate region
   - Run PlateProcessor (CLAHE -> Otsu -> OCR -> Syntax normalization)
4. For Persons:
   - Crop person
   - Extract upper-body torso
   - Classify dominant clothing color (privacy-preserving, no facial recognition)
5. Package standardized events for database persistence
"""

from datetime import datetime
from typing import List, Dict, Any, Optional
try:
    import numpy as np
except ImportError:
    class _DummyNp:
        ndarray = Any
    np = _DummyNp()

from app.cv.detector import detector
from app.cv.color_classifier import color_classifier
from app.cv.plate_processor import plate_processor


class CVPipeline:
    def __init__(self):
        self.detector = detector
        self.color_classifier = color_classifier
        self.plate_processor = plate_processor

    def process_frame(
        self,
        frame: np.ndarray,
        camera_id: str,
        timestamp: Optional[datetime] = None,
        frame_index: int = 0
    ) -> Dict[str, Any]:
        """
        Executes end-to-end multi-entity extraction on a single video frame.
        """
        if timestamp is None:
            timestamp = datetime.utcnow()

        raw_detections = self.detector.detect_frame(frame)
        processed_vehicles = []
        processed_persons = []
        raw_events = []

        for det in raw_detections:
            obj_type = det["object_type"]
            conf = det["confidence"]
            crop = det.get("crop")

            event_id = f"evt_{camera_id}_{frame_index}_{len(raw_events)}"
            raw_event = {
                "id": event_id,
                "camera_id": camera_id,
                "timestamp": timestamp.isoformat(),
                "object_type": obj_type,
                "confidence": conf,
                "bbox_x": det["bbox_x"],
                "bbox_y": det["bbox_y"],
                "bbox_width": det["bbox_width"],
                "bbox_height": det["bbox_height"],
                "frame_path": f"/sample_data/images/frame_{camera_id}_{frame_index}.jpg"
            }
            raw_events.append(raw_event)

            # Route 1: Vehicle Processing
            if obj_type in ["car", "bus", "truck", "motorcycle"]:
                # Color classification on vehicle crop
                v_color, color_conf = self.color_classifier.classify_vehicle_color(crop)

                # Plate localization: heuristic plate region in lower-middle section of vehicle
                plate_crop = self._extract_plate_subcrop(crop)
                plate_hint = det.get("sample_plate_hint")
                plate_result = self.plate_processor.process_plate_crop(plate_crop, raw_hint=plate_hint)

                vehicle_record = {
                    "detection_id": event_id,
                    "camera_id": camera_id,
                    "timestamp": timestamp.isoformat(),
                    "vehicle_type": obj_type,
                    "vehicle_color": v_color,
                    "color_confidence": color_conf,
                    "plate_number": plate_result["normalized_plate"] or "UNKNOWN",
                    "raw_plate": plate_result["raw_plate"],
                    "plate_confidence": plate_result["confidence"],
                    "is_valid_hsrp": plate_result["is_valid_format"],
                    "bbox": {
                        "x": det["bbox_x"],
                        "y": det["bbox_y"],
                        "width": det["bbox_width"],
                        "height": det["bbox_height"]
                    }
                }
                processed_vehicles.append(vehicle_record)

            # Route 2: Person Processing (Attribute Classification ONLY)
            elif obj_type == "person":
                c_color, color_conf = self.color_classifier.classify_clothing_color(crop)
                person_record = {
                    "detection_id": event_id,
                    "camera_id": camera_id,
                    "timestamp": timestamp.isoformat(),
                    "clothing_color": c_color,
                    "color_confidence": color_conf,
                    "has_bag": False,
                    "bbox": {
                        "x": det["bbox_x"],
                        "y": det["bbox_y"],
                        "width": det["bbox_width"],
                        "height": det["bbox_height"]
                    }
                }
                processed_persons.append(person_record)

        return {
            "camera_id": camera_id,
            "timestamp": timestamp.isoformat(),
            "frame_index": frame_index,
            "total_detections": len(raw_events),
            "detections": raw_events,
            "vehicles": processed_vehicles,
            "persons": processed_persons
        }

    def _extract_plate_subcrop(self, vehicle_crop: np.ndarray) -> np.ndarray:
        """
        Extracts candidate license plate region from the lower-middle 35% of a vehicle bounding box.
        """
        if vehicle_crop is None or vehicle_crop.size == 0:
            return vehicle_crop

        h, w = vehicle_crop.shape[:2]
        # In typical frontal/rear perspective, plate is centered horizontally and in the lower third
        y1 = int(h * 0.65)
        y2 = int(h * 0.95)
        x1 = int(w * 0.25)
        x2 = int(w * 0.75)

        if y2 > y1 and x2 > x1:
            return vehicle_crop[y1:y2, x1:x2]
        return vehicle_crop


# Global singleton instance
cv_pipeline = CVPipeline()
