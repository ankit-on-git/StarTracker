# StarTracker System Architecture (SIH26127)

```
                       +---------------------------------------+
                       |    City Municipal CCTV Camera Network |
                       |  (CAM-01, CAM-02, CAM-03, CAM-04...)  |
                       +-------------------+-------------------+
                                           |
                                           v
                       +---------------------------------------+
                       |   Video Ingestion & Frame Extraction  |
                       |      (OpenCV with FRAME_SKIP = 3)     |
                       +-------------------+-------------------+
                                           |
                                           v
                       +---------------------------------------+
                       |       YOLOv8 Object Detection         |
                       |    - Vehicles (car, bus, truck, bike) |
                       |    - Persons (pedestrians)            |
                       +---------+-------------------+---------+
                                 |                   |
               +-----------------+                   +-----------------+
               v                                                       v
+-----------------------------+                         +-----------------------------+
|    Vehicle CV Sub-Pipeline  |                         |   Person Attribute Pipeline |
|  - HSV Vehicle Color        |                         |  - Torso Upper-Body Crop    |
|  - HSRP Plate Bounding Box  |                         |  - HSV Dominant Color       |
|  - CLAHE + Otsu Binarize    |                         |  - Bag / Accessory Flag     |
|  - PaddleOCR Engine         |                         |  - (NO FACIAL RECOGNITION)  |
|  - Indian Plate Syntax Norm |                         +--------------+--------------+
|  - RapidFuzz Correction     |                                        |
+--------------+--------------+                                        |
               |                                                       |
               +-----------------------+-------------------------------+
                                       |
                                       v
                       +---------------------------------------+
                       |      Database Event Persister         |
                       |    Supabase / PostgreSQL Schema       |
                       |  - cameras, detections, vehicles      |
                       |  - vehicle_events, person_events      |
                       +-------------------+-------------------+
                                           |
                                           v
                       +---------------------------------------+
                       |       FastAPI Backend Services        |
                       |  - RESTful Endpoints (/api/...)       |
                       |  - Universal Search Engine            |
                       |  - Multi-Camera Trajectory Rebuilder  |
                       +-------------------+-------------------+
                                           |
                                           v
                       +---------------------------------------+
                       |  StarTracker Command Center Frontend  |
                       |  - Dark Command-Center Aesthetic      |
                       |  - Universal Multi-Modal Search Bar   |
                       |  - Leaflet Multi-Camera Trajectory Map|
                       |  - Recharts Urban Traffic Analytics   |
                       +---------------------------------------+
```

## Security & Ethics
1. **Attribute Search Only**: Persons are classified exclusively by dominant clothing hue (e.g. blue, red, black). No facial recognition is performed.
2. **Local Processing**: AI inference runs entirely on the local device without sending raw camera video to commercial third-party APIs.
3. **Database Performance**: Indexes on `plate_number`, `camera_id`, `timestamp`, `vehicle_color`, and `clothing_color` guarantee sub-50ms queries even with tens of thousands of detection records.
