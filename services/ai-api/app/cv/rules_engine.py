"""
TrafficGuard AI - Traffic Rules Engine & Deduplication System
Evaluates vehicle tracks against active regional traffic rules and
prevents duplicate incident citations using temporal deduplication windows.
"""

from typing import Dict, Any, List, Optional
import time

class TrafficRulesEngine:
    def __init__(self, dedup_window_seconds: float = 8.0):
        self.dedup_window_seconds = dedup_window_seconds
        # Record of recent citations: (tracking_id, rule_type) -> last_timestamp
        self.incident_cache: Dict[str, float] = {}

    def is_duplicate(self, tracking_id: int, rule_type: str, current_timestamp: float) -> bool:
        """
        Deduplicates violations so a vehicle tracked across 100 consecutive frames
        generates only a single consolidated incident dossier.
        """
        cache_key = f"{tracking_id}:{rule_type}"
        last_time = self.incident_cache.get(cache_key)

        if last_time is not None:
            if (current_timestamp - last_time) < self.dedup_window_seconds:
                return True

        self.incident_cache[cache_key] = current_timestamp
        return False

    def evaluate(
        self,
        vehicle_track: Dict[str, Any],
        speed_result: Optional[Dict[str, Any]],
        helmet_result: Optional[Dict[str, Any]],
        current_timestamp: float,
        active_rules: List[str]
    ) -> List[Dict[str, Any]]:
        """
        Evaluates active traffic rules against tracking evidence.
        Returns list of newly triggered violation records.
        """
        violations = []
        tracking_id = vehicle_track.get("tracking_id", 0)

        # Rule 1: Speed limit violation
        if "speed_violation" in active_rules and speed_result:
            if speed_result.get("is_speeding", False) and speed_result.get("is_calibrated", False):
                if not self.is_duplicate(tracking_id, "speed_violation", current_timestamp):
                    violations.append({
                        "rule_type": "speed_violation",
                        "severity": "high" if (speed_result["speed_kmh"] - speed_result["speed_limit_kmh"]) > 20 else "medium",
                        "confidence": speed_result.get("confidence", 0.95),
                        "details": f"Speed {speed_result['speed_kmh']} km/h exceeds {speed_result['speed_limit_kmh']} km/h limit.",
                        "estimated_speed": speed_result["speed_kmh"],
                        "speed_limit": speed_result["speed_limit_kmh"],
                        "calibration_status": "calibrated"
                    })

        # Rule 2: Helmet violation on two-wheelers
        if "no_helmet" in active_rules and helmet_result:
            if vehicle_track.get("class_name") == "motorcycle":
                if helmet_result.get("has_helmet") is False:
                    if not self.is_duplicate(tracking_id, "no_helmet", current_timestamp):
                        needs_review = helmet_result.get("needs_review", False)
                        violations.append({
                            "rule_type": "no_helmet",
                            "severity": "high",
                            "confidence": helmet_result.get("confidence", 0.88),
                            "needs_review": needs_review,
                            "review_status": "manual_verification" if needs_review else "pending",
                            "details": "Rider head region detected without approved safety helmet."
                        })

        return violations
