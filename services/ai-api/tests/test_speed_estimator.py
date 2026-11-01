"""
Unit tests for SpeedEstimator homography and uncalibrated safeguard
"""

import numpy as np
from app.cv.speed_estimator import SpeedEstimator

def test_uncalibrated_speed_safeguard():
    # Estimator with no homography matrix
    estimator = SpeedEstimator(fps=30.0, homography_matrix=None)
    assert not estimator.is_calibrated

    res = estimator.estimate_speed(
        trajectory=[(100, 200), (120, 250)],
        start_frame=0,
        end_frame=30
    )

    # Must refuse to invent or calculate pixel-based speed without calibration
    assert res["is_calibrated"] is False
    assert res["speed_kmh"] is None
    assert "uncalibrated" in res["error"].lower()

def test_calibrated_speed_calculation():
    # Identity ground mapping: 10 pixels = 1 meter
    # Matrix scales pixels by 0.1
    H = np.array([
        [0.1, 0.0, 0.0],
        [0.0, 0.1, 0.0],
        [0.0, 0.0, 1.0]
    ], dtype=np.float32)

    estimator = SpeedEstimator(
        fps=30.0,
        homography_matrix=H,
        speed_limit_kmh=50.0,
        speed_tolerance_kmh=5.0
    )
    assert estimator.is_calibrated

    # Vehicle moves 200 pixels vertically in 1.0 second (30 frames)
    # 200 px * 0.1 m/px = 20 meters in 1.0 s = 20 m/s = 72.0 km/h
    trajectory = [(100.0, 100.0), (100.0, 300.0)]
    res = estimator.estimate_speed(trajectory, start_frame=0, end_frame=30)

    assert res["is_calibrated"] is True
    assert res["speed_kmh"] == 72.0
    assert res["is_speeding"] is True
