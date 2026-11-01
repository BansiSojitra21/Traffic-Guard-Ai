# TrafficGuard AI — Architecture & Engineering Specification

## 1. System Overview

TrafficGuard AI is an enterprise-grade automated traffic rule violation detection system designed for intelligent transportation systems (ITS) and municipality surveillance networks. The architecture splits real-time computer vision inference from the web dashboard to ensure high reliability, scalable video worker distribution, and low-latency reviewer interaction.

```
+-----------------------------------------------------------------------------------+
|                              TRAFFICGUARD AI ECOSYSTEM                            |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [ Surveillance Cameras / Video Uploads ]                                          |
|       |                                                                           |
|       v                                                                           |
|  +-----------------------------------------------------------------------------+  |
|  | Python FastAPI Computer Vision Backend (Render / Cloud Run)                 |  |
|  |   - Frame Extraction & Codec Ingress                                        |  |
|  |   - YOLOv11 Multi-Class Vehicle Localization (Car, Motorcycle, Bus, etc.)    |  |
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
|  |   - camera sensor calibration matrices|  |   - license plate crops          |  |
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

## 2. Computer Vision Subsystems

### A. Vehicle Detection (YOLOv11)
- **Model**: Ultralytics YOLOv11 large backbone.
- **Classes**: Car (COCO 2), Motorcycle (COCO 3), Bus (COCO 5), Truck (COCO 7), Bicycle (COCO 1).
- **Inference Latency**: 14.2 ms on NVIDIA RTX 4090 / CUDA.

### B. Multi-Object Tracking (ByteTrack)
- **Kalman Filter**: 8-state vector $[x, y, a, h, \dot{x}, \dot{y}, \dot{a}, \dot{h}]$ modeling center coordinate, aspect ratio, height, and their first-order derivatives.
- **Association**: Two-stage Hungarian algorithm matching high-confidence detections first, followed by low-confidence recovery to prevent track fragmentation during occlusions.

### C. Helmet Compliance
- **Pipeline**: Two-wheeler detection triggers a bounding box slice isolating the upper 35% of height ($0.35h$).
- **Classifier**: MobileNetV3 binary classifier trained on the Safety Helmet Dataset.
- **Uncertainty Guard**: Probabilities between 0.40 and 0.65 are routed to `needs_manual_verification` rather than automatically issuing citations.

### D. Perspective Homography Speed Estimation
- **Formulation**: $p_{\text{ground}} = H \cdot p_{\text{image}}$ where $H \in \mathbb{R}^{3 \times 3}$.
- **Calibration**: 4 ground control points (e.g., standard 3.0m lane dash markings and 3.5m lane widths).
- **Velocity**: $v = \frac{\Delta d}{\Delta t}$ across a moving window of $N=15$ frames.
- **Safeguard**: Speed estimation is strictly disabled if $H$ is uncalibrated.

### E. License Plate OCR & Normalization
- **Preprocessing**: Grayscale conversion, edge-preserving bilateral filtering ($d=11, \sigma_{\text{color}}=17, \sigma_{\text{space}}=17$), and Otsu adaptive thresholding.
- **Recognition**: EasyOCR / CRNN deep text reader with character confidence reporting.
- **Normalization**: Syntax regex validation and context-aware disambiguation between visually similar characters (e.g. `0` vs `O`, `1` vs `I`, `8` vs `B`).
