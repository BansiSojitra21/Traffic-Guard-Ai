# Model Weights Setup & Datasets Reference

This document guides computer vision engineers on obtaining model weights and training datasets for reproducing TrafficGuard AI.

## 1. Model Weights Configuration

TrafficGuard AI reads weights from local filesystem paths or remote S3/GCS buckets defined in `.env`:

```bash
# Model Paths
YOLO_MODEL_PATH="weights/yolov8l.pt"
HELMET_MODEL_PATH="weights/helmet_mobilenetv3.onnx"
PLATE_DETECTOR_PATH="weights/wpod_net.pt"
```

### Download Pre-trained Weights:
```bash
mkdir -p services/ai-api/weights

# 1. Download Ultralytics YOLOv8/v11
curl -L -o services/ai-api/weights/yolov8l.pt https://github.com/ultralytics/assets/releases/download/v8.2.0/yolov8l.pt

# 2. Download Safety Helmet MobileNetV3 ONNX weights
# Exported from PyTorch training run on HardHat / Helmet Benchmark
# (See training instructions in src/training/train_helmet.py)
```

## 2. Benchmark Datasets Used

1. **UA-DETRAC (University at Albany DETRAC Benchmark)**
   - Used for multi-vehicle detection and tracking under heavy occlusion and rain.
   - Reference: http://detrac-db.rit.albany.edu/
2. **BDD100K (Berkeley DeepDrive)**
   - Used for varied weather conditions and night-time roadway camera evaluation.
   - Reference: https://bdd-data.berkeley.edu/
3. **Safety Helmet Dataset (Kaggle / Roboflow ITS)**
   - Two-wheeler rider and helmet annotations.
4. **UFPR-AMPR Dataset**
   - High-resolution license plate detection and OCR character benchmark.
