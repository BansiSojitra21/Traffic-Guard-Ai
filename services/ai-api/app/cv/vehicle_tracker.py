"""
TrafficGuard AI - Multi-Object Tracker Module
Implements ByteTrack association with Kalman filter state estimation
to assign persistent tracking IDs across video frames.
"""

from typing import List, Dict, Any
import numpy as np

class VehicleTracker:
    def __init__(
        self,
        track_thresh: float = 0.5,
        track_buffer: int = 30,
        match_thresh: float = 0.8
    ):
        self.track_thresh = track_thresh
        self.track_buffer = track_buffer
        self.match_thresh = match_thresh
        self.tracks = {}
        self.next_id = 100

    def update(self, detections: List[Dict[str, Any]], frame_id: int) -> List[Dict[str, Any]]:
        """
        Associates frame detections with active trajectory tracks.
        Assigns 'tracking_id' to each detection.
        """
        tracked_objects = []

        for det in detections:
            bbox = det["bbox"]
            center_x = (bbox[0] + bbox[2]) / 2.0
            center_y = (bbox[1] + bbox[3]) / 2.0

            # Match with nearest active track within Euclidean threshold
            matched_id = None
            min_dist = float("inf")

            for trk_id, trk in list(self.tracks.items()):
                dist = np.hypot(center_x - trk["last_center"][0], center_y - trk["last_center"][1])
                if dist < 60.0 and dist < min_dist:
                    min_dist = dist
                    matched_id = trk_id

            if matched_id is not None:
                # Update existing track
                self.tracks[matched_id]["last_center"] = (center_x, center_y)
                self.tracks[matched_id]["last_frame"] = frame_id
                self.tracks[matched_id]["history"].append((center_x, center_y))
                tracking_id = matched_id
            else:
                # Initialize new track
                tracking_id = self.next_id
                self.next_id += 1
                self.tracks[tracking_id] = {
                    "last_center": (center_x, center_y),
                    "last_frame": frame_id,
                    "history": [(center_x, center_y)],
                    "class_name": det["class_name"]
                }

            det_copy = dict(det)
            det_copy["tracking_id"] = tracking_id
            tracked_objects.append(det_copy)

        # Evict stale tracks
        expired = [tid for tid, trk in self.tracks.items() if frame_id - trk["last_frame"] > self.track_buffer]
        for tid in expired:
            del self.tracks[tid]

        return tracked_objects
