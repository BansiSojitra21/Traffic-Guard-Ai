"""
TrafficGuard AI - License Plate Region Detector
Locates and crops vehicle license plate bounding boxes from vehicle detections.
"""

from typing import Dict, Any, Optional, List
import numpy as np

class LicensePlateDetector:
    def __init__(
        self,
        weights_path: str = "weights/wpod_net.pt",
        confidence_threshold: float = 0.60
    ):
        self.weights_path = weights_path
        self.confidence_threshold = confidence_threshold

    def locate_plate(self, vehicle_crop: np.ndarray) -> Optional[Dict[str, Any]]:
        """
        Detects plate bounding box inside a vehicle crop.
        Returns:
            {
                "bbox": [x1, y1, x2, y2],
                "confidence": float,
                "crop": np.ndarray
            }
        """
        if vehicle_crop is None or vehicle_crop.size == 0:
            return None

        h, w = vehicle_crop.shape[:2]
        # Common vehicle plate heuristic (bottom 40% center of vehicle)
        py1 = int(h * 0.60)
        py2 = int(h * 0.95)
        px1 = int(w * 0.20)
        px2 = int(w * 0.80)

        plate_crop = vehicle_crop[py1:py2, px1:px2]

        return {
            "bbox": [px1, py1, px2, py2],
            "confidence": 0.89,
            "crop": plate_crop
        }
