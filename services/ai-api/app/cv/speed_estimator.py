"""
TrafficGuard AI - Metric Speed Estimation Module
Calculates metric vehicle velocity by projecting pixel bounding box centroids
onto a calibrated ground plane via a 4-point homography matrix H.
"""

from typing import Dict, Any, Optional, List, Tuple
import numpy as np

class SpeedEstimator:
    def __init__(
        self,
        fps: float = 30.0,
        homography_matrix: Optional[np.ndarray] = None,
        speed_limit_kmh: float = 50.0,
        speed_tolerance_kmh: float = 5.0
    ):
        self.fps = fps
        self.homography_matrix = homography_matrix
        self.speed_limit_kmh = speed_limit_kmh
        self.speed_tolerance_kmh = speed_tolerance_kmh
        self.is_calibrated = homography_matrix is not None

    def set_calibration(self, src_points: List[List[float]], dst_points_meters: List[List[float]]):
        """
        Calibrates perspective projection using 4 known image points
        and their real-world ground distances in meters.
        """
        try:
            import cv2
            src = np.array(src_points, dtype=np.float32)
            dst = np.array(dst_points_meters, dtype=np.float32)
            self.homography_matrix, _ = cv2.findHomography(src, dst)
            self.is_calibrated = True
        except Exception as e:
            self.is_calibrated = False
            print(f"[SpeedEstimator] Calibration failed: {e}")

    def project_point(self, pixel_x: float, pixel_y: float) -> Optional[Tuple[float, float]]:
        """
        Projects an image pixel point (x, y) to real-world ground meters (X, Y).
        """
        if not self.is_calibrated or self.homography_matrix is None:
            return None

        pt = np.array([pixel_x, pixel_y, 1.0], dtype=np.float32)
        projected = np.dot(self.homography_matrix, pt)
        if abs(projected[2]) < 1e-6:
            return None
        return (float(projected[0] / projected[2]), float(projected[1] / projected[2]))

    def estimate_speed(
        self,
        trajectory: List[Tuple[float, float]],
        start_frame: int,
        end_frame: int
    ) -> Dict[str, Any]:
        """
        Estimates velocity across trajectory points.
        Returns:
            {
                "speed_kmh": float or None,
                "is_speeding": bool,
                "is_calibrated": bool,
                "confidence": float
            }
        """
        if not self.is_calibrated:
            return {
                "speed_kmh": None,
                "is_speeding": False,
                "is_calibrated": False,
                "confidence": 0.0,
                "error": "Speed estimation unavailable: Camera geometry uncalibrated."
            }

        if len(trajectory) < 2 or end_frame <= start_frame:
            return {
                "speed_kmh": 0.0,
                "is_speeding": False,
                "is_calibrated": True,
                "confidence": 0.5
            }

        p1_real = self.project_point(trajectory[0][0], trajectory[0][1])
        p2_real = self.project_point(trajectory[-1][0], trajectory[-1][1])

        if p1_real is None or p2_real is None:
            return {
                "speed_kmh": None,
                "is_speeding": False,
                "is_calibrated": False,
                "confidence": 0.0
            }

        # Distance in meters
        distance_meters = np.hypot(p2_real[0] - p1_real[0], p2_real[1] - p1_real[1])
        time_seconds = (end_frame - start_frame) / self.fps

        if time_seconds <= 0:
            return {"speed_kmh": 0.0, "is_speeding": False, "is_calibrated": True, "confidence": 0.0}

        speed_mps = distance_meters / time_seconds
        speed_kmh = round(speed_mps * 3.6, 1)

        is_speeding = speed_kmh > (self.speed_limit_kmh + self.speed_tolerance_kmh)

        return {
            "speed_kmh": speed_kmh,
            "speed_limit_kmh": self.speed_limit_kmh,
            "is_speeding": is_speeding,
            "is_calibrated": True,
            "confidence": 0.95
        }
