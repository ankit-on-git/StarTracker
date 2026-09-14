-- =====================================================================
-- StarTracker: City-Wide AI Engine for Multi-Camera ANPR Trajectory Tracking
-- Database Migration 002: Vehicle & Pedestrian Detections Schema
-- Project: zacenlhwuibqvyeysegw (Supabase PostgreSQL)
-- =====================================================================

-- 1. Enable UUID & pgcrypto if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create vehicle_detections table
CREATE TABLE IF NOT EXISTS vehicle_detections (
    id BIGSERIAL PRIMARY KEY,
    plate_number TEXT NOT NULL DEFAULT 'UNKNOWN',
    color TEXT NOT NULL DEFAULT 'Unknown',
    confidence REAL NOT NULL DEFAULT 0.85,
    camera_id TEXT NOT NULL DEFAULT 'CAM-01',
    thumbnail TEXT, -- base64 data URL or remote footage snapshot URL
    video_url TEXT, -- live stream or recorded video clip URL
    location TEXT DEFAULT 'City Surveillance Corridor',
    object_type TEXT DEFAULT 'car', -- 'car', 'bus', 'truck', 'motorcycle', 'person'
    person_clothing_color TEXT, -- 'orange jacket', 'black coat', 'blue hoodie'
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. High-performance indexes for lightning-fast plate, color, and clothing searches
CREATE INDEX IF NOT EXISTS idx_vd_plate ON vehicle_detections (plate_number);
CREATE INDEX IF NOT EXISTS idx_vd_color ON vehicle_detections (color);
CREATE INDEX IF NOT EXISTS idx_vd_object_type ON vehicle_detections (object_type);
CREATE INDEX IF NOT EXISTS idx_vd_person_clothing ON vehicle_detections (person_clothing_color);
CREATE INDEX IF NOT EXISTS idx_vd_detected_at ON vehicle_detections (detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_vd_camera ON vehicle_detections (camera_id);

-- 4. Enable Row Level Security (RLS) and grant open anonymous read/write for demo/edge devices
ALTER TABLE vehicle_detections ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access
DROP POLICY IF EXISTS "Allow anonymous read access" ON vehicle_detections;
CREATE POLICY "Allow anonymous read access"
    ON vehicle_detections
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Allow anonymous insert access from Python YOLO workers
DROP POLICY IF EXISTS "Allow anonymous insert access" ON vehicle_detections;
CREATE POLICY "Allow anonymous insert access"
    ON vehicle_detections
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Allow anonymous update access
DROP POLICY IF EXISTS "Allow anonymous update access" ON vehicle_detections;
CREATE POLICY "Allow anonymous update access"
    ON vehicle_detections
    FOR UPDATE
    TO anon, authenticated
    USING (true);

-- 5. Seed initial multi-color vehicles, including Orange cars and person clothing
INSERT INTO vehicle_detections (plate_number, color, confidence, camera_id, location, object_type, person_clothing_color, video_url, thumbnail, detected_at)
VALUES 
    (
        'MH12AB1234',
        'Orange/Yellow',
        0.96,
        'CAM-01',
        'Shinjuku Kabukicho Traffic Junction',
        'car',
        NULL,
        'https://www.youtube.com/embed/yznpQlk0exE?autoplay=1&mute=1',
        'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=800&q=80',
        NOW() - INTERVAL '4 minutes'
    ),
    (
        'DL04CA8821',
        'Orange',
        0.94,
        'CAM-02',
        'Shibuya Crossing Pedestrian & Traffic Sentry',
        'car',
        NULL,
        'https://www.youtube.com/embed/6dp-bvQ7RWo?autoplay=1&mute=1',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
        NOW() - INTERVAL '12 minutes'
    ),
    (
        'PB10AB1234',
        'Red',
        0.98,
        'CAM-01',
        'Shinjuku Kabukicho Traffic Junction',
        'car',
        NULL,
        'https://www.youtube.com/embed/yznpQlk0exE?autoplay=1&mute=1',
        'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80',
        NOW() - INTERVAL '18 minutes'
    ),
    (
        'PB10CZ8899',
        'White',
        0.95,
        'CAM-03',
        'Akihabara Transit & Railway Sentry',
        'car',
        NULL,
        'https://www.youtube.com/embed/DSRm7V_bsm8?autoplay=1&mute=1',
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
        NOW() - INTERVAL '25 minutes'
    ),
    (
        'KA03MN4411',
        'Blue',
        0.92,
        'CAM-04',
        'Roppongi Expressway & Skyline Sentry',
        'car',
        NULL,
        'https://www.youtube.com/embed/eYAB0HX8NF8?autoplay=1&mute=1',
        'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
        NOW() - INTERVAL '31 minutes'
    ),
    (
        'PED-9021',
        'Unknown',
        0.97,
        'CAM-02',
        'Hachiko Square / Shibuya Crossing',
        'person',
        'Orange jacket',
        'https://www.youtube.com/embed/6dp-bvQ7RWo?autoplay=1&mute=1',
        'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
        NOW() - INTERVAL '35 minutes'
    ),
    (
        'DL01XY9999',
        'Yellow',
        0.93,
        'CAM-04',
        'Roppongi Expressway & Skyline Sentry',
        'truck',
        NULL,
        'https://www.youtube.com/embed/eYAB0HX8NF8?autoplay=1&mute=1',
        'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=800&q=80',
        NOW() - INTERVAL '42 minutes'
    );
