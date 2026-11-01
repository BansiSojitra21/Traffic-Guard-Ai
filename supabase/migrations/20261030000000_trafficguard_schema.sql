-- ==============================================================================
-- TrafficGuard AI — PostgreSQL Database Schema & Row Level Security (RLS)
-- ==============================================================================

-- 1. Profiles & Reviewer RBAC
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'reviewer' CHECK (role IN ('admin', 'reviewer', 'viewer')),
    department TEXT DEFAULT 'Traffic Operations & AI Safety',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Model Versions & CV Registry
CREATE TABLE IF NOT EXISTS public.model_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name TEXT NOT NULL,
    version_tag TEXT NOT NULL,
    task_type TEXT NOT NULL CHECK (task_type IN ('vehicle_detector', 'tracker', 'helmet_classifier', 'plate_ocr', 'speed_homography')),
    weights_uri TEXT NOT NULL,
    metrics_json JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Cameras & Sensor Hardware
CREATE TABLE IF NOT EXISTS public.cameras (
    id TEXT PRIMARY KEY, -- e.g. 'CAM-112'
    name TEXT NOT NULL,
    location_label TEXT NOT NULL,
    ip_stream_url TEXT, -- Ingress RTSP/HLS stream URL (restricted access)
    status TEXT NOT NULL DEFAULT 'online' CHECK (status IN ('online', 'degraded', 'offline')),
    fps NUMERIC(4, 1) NOT NULL DEFAULT 30.0,
    resolution TEXT NOT NULL DEFAULT '1920x1080',
    speed_limit_kmh NUMERIC(5, 1) NOT NULL DEFAULT 50.0,
    calibration_status TEXT NOT NULL DEFAULT 'calibrated' CHECK (calibration_status IN ('calibrated', 'needs_calibration')),
    homography_matrix JSONB, -- 3x3 perspective transformation matrix
    active_rules TEXT[] NOT NULL DEFAULT ARRAY['speed_violation', 'no_helmet', 'red_light_stopline'],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Uploaded Video Files
CREATE TABLE IF NOT EXISTS public.videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    camera_id TEXT REFERENCES public.cameras(id) ON DELETE SET NULL,
    storage_path TEXT NOT NULL, -- Object storage key (Supabase Storage)
    original_filename TEXT NOT NULL,
    duration_seconds NUMERIC(8, 2),
    file_size_bytes BIGINT,
    mime_type TEXT DEFAULT 'video/mp4',
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Video Processing Jobs
CREATE TABLE IF NOT EXISTS public.processing_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
    progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    status_message TEXT,
    frames_processed INTEGER DEFAULT 0,
    inference_fps NUMERIC(5, 2),
    error_message TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Frame-Level Vehicle Detections
CREATE TABLE IF NOT EXISTS public.detections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
    camera_id TEXT NOT NULL REFERENCES public.cameras(id) ON DELETE CASCADE,
    frame_number INTEGER NOT NULL,
    timestamp_seconds NUMERIC(8, 3) NOT NULL,
    tracking_id INTEGER NOT NULL,
    vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('car', 'motorcycle', 'bus', 'truck', 'bicycle')),
    bbox_x NUMERIC(6, 2) NOT NULL,
    bbox_y NUMERIC(6, 2) NOT NULL,
    bbox_width NUMERIC(6, 2) NOT NULL,
    bbox_height NUMERIC(6, 2) NOT NULL,
    confidence NUMERIC(5, 4) NOT NULL,
    estimated_speed_kmh NUMERIC(5, 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Incident Citations / Violations Table
CREATE TABLE IF NOT EXISTS public.violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_code TEXT UNIQUE NOT NULL, -- e.g. 'INC-2026-1030-01'
    camera_id TEXT NOT NULL REFERENCES public.cameras(id) ON DELETE CASCADE,
    video_id UUID REFERENCES public.videos(id) ON DELETE SET NULL,
    tracking_id INTEGER NOT NULL,
    timestamp_seconds NUMERIC(8, 3) NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('car', 'motorcycle', 'bus', 'truck', 'bicycle')),
    violation_type TEXT NOT NULL CHECK (violation_type IN ('no_helmet', 'speed_violation', 'red_light_stopline', 'wrong_way', 'illegal_lane_change')),
    severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('high', 'medium', 'low')),
    confidence NUMERIC(5, 4) NOT NULL,
    license_plate TEXT,
    plate_confidence NUMERIC(5, 4),
    estimated_speed_kmh NUMERIC(5, 1),
    speed_limit_kmh NUMERIC(5, 1),
    review_status TEXT NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending', 'confirmed', 'dismissed', 'manual_verification')),
    reviewer_notes TEXT,
    ai_explanation TEXT,
    calibration_status TEXT NOT NULL DEFAULT 'calibrated',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Evidence Files (Storage Pointer Links)
CREATE TABLE IF NOT EXISTS public.evidence_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    violation_id UUID NOT NULL REFERENCES public.violations(id) ON DELETE CASCADE,
    evidence_type TEXT NOT NULL CHECK (evidence_type IN ('full_frame', 'vehicle_crop', 'plate_crop', 'trajectory_overlay')),
    storage_path TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Reviewer Audit Trail History
CREATE TABLE IF NOT EXISTS public.review_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    violation_id UUID NOT NULL REFERENCES public.violations(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewer_name TEXT NOT NULL,
    previous_status TEXT NOT NULL,
    new_status TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for high-frequency queries
CREATE INDEX IF NOT EXISTS idx_violations_camera ON public.violations(camera_id);
CREATE INDEX IF NOT EXISTS idx_violations_status ON public.violations(review_status);
CREATE INDEX IF NOT EXISTS idx_violations_type ON public.violations(violation_type);
CREATE INDEX IF NOT EXISTS idx_violations_plate ON public.violations(license_plate);
CREATE INDEX IF NOT EXISTS idx_detections_video_frame ON public.detections(video_id, frame_number);
CREATE INDEX IF NOT EXISTS idx_detections_tracking ON public.detections(tracking_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cameras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Authenticated reviewers can read and inspect evidence
CREATE POLICY "Reviewers can view cameras" ON public.cameras FOR SELECT TO authenticated USING (true);
CREATE POLICY "Reviewers can view violations" ON public.violations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Reviewers can update violations" ON public.violations FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Reviewers can view evidence" ON public.evidence_files FOR SELECT TO authenticated USING (true);
CREATE POLICY "Reviewers can insert review history" ON public.review_history FOR INSERT TO authenticated WITH CHECK (true);
