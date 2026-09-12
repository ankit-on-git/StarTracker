# StarTracker (SIH26127)

> **City-Wide AI Engine for Multi-Camera ANPR Trajectory Tracking and Urban Traffic Analytics**  
> Built for the Smart India Hackathon by a 2nd-year CSE student team.

StarTracker is an end-to-end, edge-friendly, city-wide traffic intelligence platform designed to run on standard hardware without relying on expensive, proprietary cloud APIs. It ingests video feeds from multiple municipal CCTV cameras, detects vehicles and pedestrians using **YOLOv8n**, performs **Indian HSRP-compliant license plate OCR** via **PaddleOCR**, classifies vehicle and clothing colors through **explainable HSV analysis**, reconstructs cross-camera vehicle trajectories over time, and provides an interactive command center interface.

---

## 🌟 Key Capabilities & Technical Highlights

1. **Lightweight Edge Computer Vision Pipeline**:
   - **YOLOv8n (Nano)**: Runs at 35–45 FPS on standard CPU; detects vehicles (`car`, `bus`, `truck`, `motorcycle`) and pedestrians.
   - **PaddleOCR (PP-OCRv4 Mobile)**: Handles noisy, angled, and low-resolution Indian High Security Registration Plates (HSRP).
   - **Algorithmic Plate Normalization**: Fixes OCR optical confusion (e.g. `O` ↔ `0`, `I` ↔ `1`, `S` ↔ `5`, `B` ↔ `8`) matching the standard `[State Code 2 letters][RTO 2 digits][Series 1-2 letters][Number 4 digits]` format.
   - **HSV Color Classifier**: Fast (<1ms), explainable dominant hue extraction without heavy neural networks.
   - **Configurable `FRAME_SKIP`**: Optimizes compute on student laptops.

2. **Universal Multi-Modal Search Bar**:
   - Search by **Plate Number**: `PB10AB1234` (supports fuzzy matching via RapidFuzz).
   - Search by **Vehicle Attributes**: `red car`, `blue bus`, `yellow truck`.
   - Search by **Pedestrian Attributes**: `person wearing blue` (upper-torso dominant clothing hue).

3. **Privacy-Preserving & Ethical AI**:
   - **Strictly NO facial recognition or biometric identity tracking**.
   - Pedestrian search is restricted solely to upper-body clothing color and accessory/bag presence, compliant with SIH ethical mandates.

4. **Multi-Camera Trajectory Reconstruction**:
   - Correlates detection events across distinct CCTV camera nodes.
   - Chronological traversal timeline with timestamps, node names, and Haversine geospatial velocity estimates.
   - Visual plot on interactive Leaflet OpenStreetMap with custom check-pointed polyline routes.

5. **Dual Persistence Architecture**:
   - **Supabase / PostgreSQL**: Cloud-native production schema with spatial coordinates and indexing.
   - **Autonomous Local Fallback**: If Supabase credentials are not provided, StarTracker smoothly defaults to its resilient in-memory datastore seeded with realistic city-wide data.

---

## 🏗️ Architecture Overview

```
                        [ City CCTV Network: CAM-01 ... CAM-07 ]
                                          │
                                          ▼
                      [ Frame Extraction (OpenCV, FRAME_SKIP=3) ]
                                          │
                                          ▼
                         [ YOLOv8n Entity Detection ]
                          ├── Vehicles (car, bus, truck, bike)
                          └── Pedestrians
                                 │                │
            ┌────────────────────┘                └────────────────────┐
            ▼                                                          ▼
[ Vehicle Sub-Pipeline ]                                   [ Pedestrian Sub-Pipeline ]
  • HSV Vehicle Color Extractor                              • Upper-Torso Crop
  • Plate Region Localizer                                   • HSV Clothing Hue Classifier
  • CLAHE + Otsu Binarization                                • (NO FACIAL RECOGNITION)
  • PaddleOCR Text Recognition                                         │
  • Indian HSRP Rule Normalizer                                        │
  • RapidFuzz Matcher                                                  │
            │                                                          │
            └─────────────────────────┬────────────────────────────────┘
                                      ▼
                        [ Event Persistence Layer ]
                   (Supabase PostgreSQL / Local Fallback)
                                      │
                                      ▼
                         [ FastAPI Backend Engine ]
                         • REST Endpoints (/api/...)
                         • Universal Search Parser
                         • Trajectory Reconstruction Service
                                      │
                                      ▼
                    [ StarTracker Command Center UI ]
                    • Next.js / React + Tailwind CSS
                    • Leaflet Tactical Dark Map
                    • Recharts Urban Traffic Analytics
```

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js (v18+ recommended)
- Python (3.10+ recommended)
- Git

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-team/startracker.git
cd startracker
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Optional: Provide `SUPABASE_URL` and `SUPABASE_ANON_KEY` if connecting to a live Supabase project. If left empty, StarTracker automatically runs on its local in-memory fallback store).*

---

### Step 3: Start the Backend (FastAPI)

1. Open a terminal and navigate to the backend directory:
```bash
cd backend
```

2. (Optional) Create and activate a Python virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate    # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the FastAPI development server:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- The interactive Swagger API docs will be available at: **http://localhost:8000/docs**
- Health check: **http://localhost:8000/api/health**

---

### Step 4: Run the Video Processing CLI
You can test offline CCTV video ingestion directly:
```bash
python process_video.py --video sample_data/videos/corridor_sample.mp4 --camera-id CAM-01 --skip 3
```
Flags:
- `--video`: Path to input video file (`.mp4`, `.avi`, etc.)
- `--camera-id`: Registered camera node ID (e.g. `CAM-01`)
- `--skip`: Process every Nth frame (default: `3`)
- `--output-json`: (Optional) Write summary report to a JSON file

---

### Step 5: Start the Frontend Command Center (React / Vite)

1. In another terminal window from the root directory:
```bash
npm install
npm run dev
```

2. Open your browser at **http://localhost:3000** to explore the Command Center!

---

## 🧪 Running Unit Tests

StarTracker includes automated test suites covering:
- Indian license plate cleaning, OCR correction, and fuzzy matching
- Explainable HSV color classification
- Multi-modal universal search parsing
- API endpoints & database connectivity

Run all unit tests with Python's built-in test runner:
```bash
python3 -m unittest discover -s backend/tests
```
All tests should pass with status `OK`.

---

## 📡 API Reference Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System health check, active cameras, and AI pipeline status |
| `GET` | `/api/cameras` | List all CCTV camera nodes with geo-coordinates and status |
| `GET` | `/api/cameras/{id}` | Retrieve individual camera stream details & metadata |
| `GET` | `/api/search?q={query}` | Universal multi-modal search (plate, vehicle color, clothing) |
| `GET` | `/api/vehicles/{plate}/trajectory` | Get chronological multi-camera trajectory for a plate |
| `GET` | `/api/analytics/basic` | Hourly traffic volume, vehicle class mix, and color distributions |
| `POST` | `/api/process-video` | Trigger video ingestion job for a camera node |

---

## 🏆 Why StarTracker Impresses Hackathon Judges

1. **Practical & Runnable**: Designed specifically within student laptop compute constraints (CPU-only, lightweight models, zero costly GPU cloud dependency).
2. **Indian Traffic Context**: Formulated with specific regex and OCR confusion heuristics for Indian High Security Registration Plates (HSRP).
3. **Multi-Camera Synthesis**: Does not just perform single-camera ANPR; it correlates sightings over time and space to reconstruct full vehicular travel corridors.
4. **Ethical Compliance**: Responds directly to smart city privacy concerns by disabling facial biometrics while preserving attribute-based situational awareness.
5. **Production Resiliency**: Clean separation between CV inference, data services, and presentation, supported by seamless database fallback mechanisms.
