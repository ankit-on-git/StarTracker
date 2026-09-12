# Smart India Hackathon: SIH26127 Problem Statement Mapping

**Problem Title**: City-Wide AI Engine for Multi-Camera ANPR Trajectory Tracking and Urban Traffic Analytics  
**Category**: Software / Smart Cities / AI & Computer Vision  

## Key Deliverables Implemented in Part 1
1. **Multi-Camera Network Management**:
   - Geolocation-indexed cameras across city intersections with status indicators, resolution, and FPS metadata.
2. **Local AI Computer Vision Pipeline**:
   - Lightweight YOLOv8 detector for vehicle classes (`car`, `bus`, `truck`, `motorcycle`) and `person`.
   - Explainable HSV color classifier for vehicles and pedestrian clothing.
3. **Indian ANPR & OCR Normalization**:
   - Contrast enhancement (CLAHE) and Otsu binarization.
   - PaddleOCR engine integration.
   - Context-aware character confusion resolution (`O<->0`, `I<->1`, `S<->5`, `B<->8`) conforming to the Indian High Security Registration Plate (HSRP) format.
   - RapidFuzz fuzzy tolerance matching.
4. **Universal Multi-Modal Search Bar**:
   - Direct plate lookups (e.g. `PB10AB1234`).
   - Vehicle attribute queries (e.g. `red car`, `blue bus`).
   - Pedestrian clothing attribute queries (e.g. `person wearing blue`).
5. **Multi-Camera Trajectory Reconstruction**:
   - Chronological traversal ordering across camera nodes with timestamps, coordinates, and visual evidence.
6. **Command Center Interface**:
   - Tactical dark command-center aesthetic, real database stats, Leaflet map with trajectory rendering, Recharts analytics.
