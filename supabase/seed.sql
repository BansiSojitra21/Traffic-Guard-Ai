-- TrafficGuard AI — Seed Initial Data

INSERT INTO public.cameras (id, name, location_label, ip_stream_url, status, fps, resolution, speed_limit_kmh, calibration_status, active_rules)
VALUES 
('CAM-112', 'Camera 112 — Main & Broadway', 'Downtown District 4, Intersection North', 'rtsp://10.24.8.112:554/live/stream1', 'online', 30.0, '3840x2160', 50.0, 'calibrated', ARRAY['speed_violation', 'red_light_stopline', 'no_helmet', 'wrong_way', 'illegal_lane_change']),
('CAM-14B', 'Camera 14-B — Arterial Road South', 'Highway Connector Expressway, Stopline Zone', 'rtsp://10.24.8.142:554/live/stream1', 'online', 25.0, '1920x1080', 60.0, 'calibrated', ARRAY['no_helmet', 'red_light_stopline', 'speed_violation', 'illegal_lane_change']),
('CAM-08A', 'Camera 08-A — West Corridor Overpass', 'Westside Transit Junction', 'rtsp://10.24.8.88:554/live/stream1', 'online', 30.0, '2560x1440', 45.0, 'calibrated', ARRAY['speed_violation', 'wrong_way', 'no_helmet'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.model_versions (model_name, version_tag, task_type, weights_uri, metrics_json, is_active)
VALUES
('YOLOv11l-Traffic', 'v2.4-coco-detrac', 'vehicle_detector', 's3://trafficguard-models/yolov11l_traffic.pt', '{"map_50": 0.938, "latency_ms": 14.2}'::jsonb, TRUE),
('ByteTrack-Kalman', 'v1.1-tuned', 'tracker', 'builtin', '{"mota": 0.884, "idf1": 0.841}'::jsonb, TRUE),
('MobileNetV3-Helmet', 'v1.0-helmet-dataset', 'helmet_classifier', 's3://trafficguard-models/helmet_mobilenetv3.onnx', '{"f1_score": 0.912, "accuracy": 0.924}'::jsonb, TRUE),
('EasyOCR-PlateNet', 'v2.0-crnn', 'plate_ocr', 's3://trafficguard-models/crnn_plate.pth', '{"character_accuracy": 0.944}'::jsonb, TRUE);
