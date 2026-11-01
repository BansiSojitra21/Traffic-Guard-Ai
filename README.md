# TrafficGuard AI — Intelligent Traffic Rule Violation Detection System

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11-yellow.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green.svg)](https://fastapi.tiangolo.com/)
[![YOLOv11](https://img.shields.io/badge/YOLO-v11-orange.svg)](https://github.com/ultralytics/ultralytics)
[![ByteTrack](https://img.shields.io/badge/ByteTrack-MOT-brightgreen.svg)](https://github.com/ifzhang/ByteTrack)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

TrafficGuard AI is a complete, full-stack computer vision and traffic safety monitoring platform. It detects vehicles, tracks trajectories across surveillance feeds, identifies traffic rule infractions (speed violations, helmet non-compliance on two-wheelers, red light stop-line breaches, and wrong-way travel), recognizes license plates via OCR, and provides an audited enforcement dashboard for municipal operators.

Built specifically as a portfolio centerpiece for an **AI/ML Engineer / Computer Vision Engineer** role.

---

## CV-Ready Project Summary

> **TrafficGuard AI: End-to-End Traffic Rule Violation Detection & Vision Surveillance System**
> * Designed and built a modular computer vision system utilizing Ultralytics YOLOv11 for multi-class vehicle detection (cars, motorcycles, buses, trucks, bicycles) and ByteTrack for robust multi-object tracking under occlusion.
> * Implemented an automated motorcycle helmet detection pipeline with head-region ROI proposals and a secondary classifier, reducing false alarms by introducing confidence uncertainty thresholds (`needs_manual_verification`).
> * Developed a 4-point perspective homography ground-plane projection module estimating metric vehicle velocity ($v = \frac{\Delta d}{\Delta t}$) with calibrated error safeguards preventing uncalibrated estimations.
> * Built an automated license plate recognition (ALPR) pipeline using bilateral filtering, adaptive Otsu thresholding, EasyOCR, and context-aware alphanumeric syntax normalization.
> * Engineered an asynchronous FastAPI video processing worker and an interactive Next.js/React 19 dashboard with synchronized canvas bounding box overlays, timeline seeking, RBAC review auditing, and RFC-4180 CSV export with formula injection sanitization.

---

## System Architecture

```
+-----------------------------------------------------------------------------------+
|                              TRAFFICGUARD AI ECOSYSTEM                            |
+-----------------------------------------------------------------------------------+
|  [ Surveillance Cameras / Video Uploads ]                                          |
|       |                                                                           |
|       v                                                                           |
|  +-----------------------------------------------------------------------------+  |
|  | Python FastAPI Computer Vision Backend (Render / Cloud Run)                 |  |
|  |   - Frame Extraction & Codec Ingress                                        |  |
|  |   - YOLOv11 Multi-Class Vehicle Localization                                |  |
|  |   - ByteTrack Multi-Object Tracking (Kalman Filter + Hungarian Algorithm)   |  |
|  |   - Two-Wheeler Head ROI Cropping & Helmet Classifier                       |  |
|  |   - Ground-Plane Homography (4-Point Perspective Speed Estimation)          |  |
|  |   - Plate Region Localization & EasyOCR Text Normalization                  |  |
|  |   - Deduplication Engine (8s Temporal Window)                               |  |
|  +-----------------------------------------------------------------------------+  |
|       |                                                                           |
|       v                                                                           |
|  +-------------------------------------+    +----------------------------------+  |
|  | Supabase PostgreSQL (Structured DB) |    | Supabase Object Storage (S3 API) |  |
|  |   - violations & incident metadata  |    |   - raw video captures           |  |
|  |   - audit history logs (RBAC)       |    |   - cropped vehicle snapshots    |  |
|  |   - camera sensor calibration       |    |   - license plate crops          |  |
|  +-------------------------------------+    +----------------------------------+  |
|       ^                                                                           |
|       | REST & WebSocket                                                          |
|       v                                                                           |
|  +-----------------------------------------------------------------------------+  |
|  | Next.js / React 19 Frontend Web Application (Vercel)                         |  |
|  |   - Two-Column Monitoring Workspace with Canvas Bounding Box Overlays       |  |
|  |   - Real-Time Incident Feed & Timeline Seeking                              |  |
|  |   - Incident Audit Drawer (Evidence, OCR confidence, Review Determination)   |  |
|  |   - Analytics Dashboard (Recharts Traffic Volume & Violation Trends)        |  |
|  |   - Sensor Calibration & Rule Toggles                                       |  |
|  |   - CSV & Formula-Sanitized Excel Exports                                   |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## Key Features

1. **Two-Column Real-Time Video Workspace**
   - Video player with play, pause, restart, and 0.5x / 1x / 2x speed controls.
   - Synchronized dynamic canvas bounding boxes displaying vehicle class, tracking ID (`#104`), vehicle speed (`74 km/h`), and violation tags (`NO HELMET`, `EXCEED SPEED: 74 km/h`).
   - Support for custom traffic video upload with simulated real-time CV pipeline execution.
2. **Dedicated Helmet Violation Detection**
   - Head-region proposal isolating the top 35% bounding box of two-wheeler tracks.
   - Rejection of uncertain readings (`0.40 - 0.65`) into a `"Needs Manual Verification"` state.
3. **Calibrated Speed Estimation**
   - Perspective homography projection ($p_{\text{ground}} = H \cdot p_{\text{image}}$) mapping pixel displacement to ground-truth meters.
   - Refuses to compute or display ungrounded speeds when geometry is uncalibrated.
4. **License Plate Recognition & OCR**
   - Edge-preserving bilateral filter and adaptive thresholding.
   - Disambiguation normalization (`0` vs `O`, `1` vs `I`, `8` vs `B`) with regex pattern checking.
5. **Audited Incident Review Drawer**
   - Cropped vehicle snapshot, license plate crop with character confidence score.
   - Four review states: `Pending Review`, `Confirmed Citation`, `Dismissed / False Positive`, and `Needs Manual Verification`.
   - Immutable audit trail recording reviewer name, previous status, timestamp, and technical justification.
6. **Analytics & Spreadsheets Export**
   - Recharts visual charts for hourly traffic volume, violation breakdown, vehicle distributions, and camera hotspot density.
   - Export filtered incidents to CSV and Excel with spreadsheet formula injection protection (`=`, `+`, `-`, `@`).

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19 / Next.js, Vite |
| **Styling & Design** | Tailwind CSS v4, Lucide Icons, Clean Light-Theme Palette |
| **Data Visualization** | Recharts |
| **Computer Vision Engine** | Python 3.11, OpenCV 4.10, Ultralytics YOLOv11 |
| **Object Tracking** | ByteTrack, Kalman Filter state estimators |
| **Text Recognition (OCR)** | EasyOCR / CRNN with bilateral contrast enhancement |
| **API Backend** | FastAPI, Uvicorn, Pydantic v2 |
| **Database & Auth** | Supabase PostgreSQL with Row Level Security (RLS) |
| **Object Storage** | Supabase Storage (S3 API compatible) |

---

## Local Development Setup

### 1. Web Application (Frontend)
```bash
# Clone the repository
git clone https://github.com/your-username/trafficguard-ai.git
cd trafficguard-ai

# Install dependencies
npm install

# Run Vite development server
npm run dev
# -> Opens on http://localhost:3000
```

### 2. Python Computer Vision API (Backend)
```bash
cd services/ai-api

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
# -> API running at http://localhost:8000
# -> Swagger docs at http://localhost:8000/docs
```

### 3. Run Backend Test Suite
```bash
cd services/ai-api
pytest tests/ -v
```

---

## Database Migrations (Supabase)

To set up the Supabase database schema and RLS policies:
1. Navigate to your Supabase project SQL Editor.
2. Run `supabase/migrations/20261030000000_trafficguard_schema.sql`.
3. Run `supabase/seed.sql` to seed cameras and baseline model metadata.

---

## Deployment Architecture

- **Frontend**: Deployed on Vercel (`NEXT_PUBLIC_API_BASE_URL` pointing to the backend).
- **Computer Vision API**: Packaged via Docker (`services/ai-api/Dockerfile`) and deployed on Render or Google Cloud Run with GPU/CPU auto-scaling.
- **Database & Storage**: Supabase managed PostgreSQL with Row Level Security and S3-compatible evidence storage.

---

## Known Limitations & Ethical Safeguards

- Automated model detections are strictly preliminary incident flags, not legally conclusive evidence. Human review is mandated before citation issuance.
- Metric speed calculation requires calibrated 4-point homography; speed calculations are disabled automatically on uncalibrated camera feeds.
- Adverse weather (dense fog, blizzard, direct camera glare) reduces bounding box IoU stability and flags ambiguous incidents for human verification.

---

## License

Distributed under the Apache 2.0 License.
