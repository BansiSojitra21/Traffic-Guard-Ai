"""
TrafficGuard AI - Vehicle Detection Module
Wraps Ultralytics YOLO with COCO class filtering, NMS thresholding,
and standardized bounding box conversion.
"""

from typing import List, Dict, Any, Optional
import numpy as np

# Supported COCO class indices for traffic monitoring
# 2: car, 3: motorcycle, 5: bus, 7: truck, 1: bicycle
VEHICLE_CLASS_MAP = {
    2: "car",
    3: "motorcycle",
    5: "bus",
    7: "truck",
    1: "bicycle"
}

class VehicleDetector:
    def __init__(
        self,
        model_path: str = "weights/yolov8l.pt",
        confidence_threshold: float = 0.55,
        iou_threshold: float = 0.45,
        device: str = "cpu"
    ):
        self.model_path = model_path
        self.confidence_threshold = confidence_threshold
        self.iou_threshold = iou_threshold
        self.device = device
        self.model = None
        self._load_model()

    def _load_model(self):
        try:
            from ultralytics import YOLO
            self.model = YOLO(self.model_path)
        except Exception as e:
            # Documented fallback if weights are not yet downloaded in local testing
            print(f"[VehicleDetector] Model weights not found at {self.model_path}. Initialized in stub/mock mode. Error: {e}")
            self.model = None

    def detect(self, frame: np.ndarray) -> List[Dict[str, Any]]:
        """
        Executes forward inference on a BGR video frame.
        Returns a list of detected vehicle objects:
        [
            {
                "bbox": [x1, y1, x2, y2],
                "confidence": 0.94,
                "class_id": 2,
                "class_name": "car"
            }
        ]
        """
        if self.model is None or frame is None:
            return []

        results = self.model.predict(
            source=frame,
            conf=self.confidence_threshold,
            iou=self.iou_threshold,
            classes=list(VEHICLE_CLASS_MAP.keys()),
            device=self.device,
            verbose=False
        )

        detections = []
        if len(results) > 0:
            boxes = results[0].boxes
            for box in boxes:
                cls_id = int(box.cls[0].item())
                conf = float(box.conf[0].item())
                xyxy = box.xyxy[0].cpu().numpy().tolist()

                detections.append({
                    "bbox": [round(c, 1) for c in xyxy],
                    "confidence": round(conf, 4),
                    "class_id": cls_id,
                    "class_name": VEHICLE_CLASS_MAP.get(cls_id, "vehicle")
                })

        return detections
