"""
Unit tests for TrafficGuard AI Rules Engine and Deduplication
"""

import pytest
from app.cv.rules_engine import TrafficRulesEngine

def test_speed_violation_triggers():
    engine = TrafficRulesEngine(dedup_window_seconds=5.0)
    vehicle_track = {"tracking_id": 101, "class_name": "car"}
    speed_result = {
        "speed_kmh": 72.0,
        "speed_limit_kmh": 50.0,
        "is_speeding": True,
        "is_calibrated": True,
        "confidence": 0.95
    }

    violations = engine.evaluate(
        vehicle_track=vehicle_track,
        speed_result=speed_result,
        helmet_result=None,
        current_timestamp=10.0,
        active_rules=["speed_violation"]
    )

    assert len(violations) == 1
    assert violations[0]["rule_type"] == "speed_violation"
    assert violations[0]["severity"] == "high"

def test_deduplication_prevents_duplicate_citation():
    engine = TrafficRulesEngine(dedup_window_seconds=8.0)
    vehicle_track = {"tracking_id": 102, "class_name": "car"}
    speed_result = {
        "speed_kmh": 68.0,
        "speed_limit_kmh": 50.0,
        "is_speeding": True,
        "is_calibrated": True,
        "confidence": 0.95
    }

    # First detection at t = 2.0s
    v1 = engine.evaluate(vehicle_track, speed_result, None, 2.0, ["speed_violation"])
    assert len(v1) == 1

    # Second detection for same vehicle at t = 4.0s (within 8s window) -> should be deduplicated
    v2 = engine.evaluate(vehicle_track, speed_result, None, 4.0, ["speed_violation"])
    assert len(v2) == 0

    # Third detection at t = 11.5s (after 8s window expires) -> can trigger again
    v3 = engine.evaluate(vehicle_track, speed_result, None, 11.5, ["speed_violation"])
    assert len(v3) == 1
