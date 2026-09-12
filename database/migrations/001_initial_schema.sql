-- =====================================================================
-- StarTracker: City-Wide AI Engine for Multi-Camera ANPR Trajectory
-- Tracking and Urban Traffic Analytics (SIH26127)
-- Database Migration 001: Initial Schema
-- Target: Supabase / PostgreSQL
-- =====================================================================

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------
-- 1. CAMERAS
-- Represents municipal/traffic CCTV cameras deployed across the city
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cameras (
    id TEXT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    location VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance', 'offline')),
    stream_url TEXT,
    fps INTEGER DEFAULT 25,
    resolution VARCHAR(50) DEFAULT '1920x1080',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 2. DETECTIONS
-- Raw detection events from the local YOLO pipeline for each frame
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS detections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    camera_id TEXT NOT NULL REFERENCES cameras(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    object_type VARCHAR(50) NOT NULL, -- 'vehicle', 'car', 'motorcycle', 'bus', 'truck', 'person'
    confidence REAL NOT NULL CHECK (confidence >= 0.0 AND confidence <= 1.0),
    frame_path TEXT,
    video_path TEXT,
    bbox_x REAL NOT NULL,
    bbox_y REAL NOT NULL,
    bbox_width REAL NOT NULL,
    bbox_height REAL NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 3. VEHICLES
-- Master catalog of unique detected vehicles identified via ANPR
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plate_number VARCHAR(32) NOT NULL UNIQUE,
    plate_confidence REAL DEFAULT 0.0,
    vehicle_type VARCHAR(50) DEFAULT 'car', -- 'car', 'motorcycle', 'bus', 'truck', 'van'
    vehicle_color VARCHAR(50) DEFAULT 'unknown',
    color_confidence REAL DEFAULT 0.0,
    first_seen_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    total_sightings INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 4. VEHICLE_EVENTS
-- Chronological camera sightings used for multi-camera trajectory tracking
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicle_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    detection_id UUID REFERENCES detections(id) ON DELETE SET NULL,
    camera_id TEXT NOT NULL REFERENCES cameras(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    speed_estimate_kmh REAL,
    heading_degrees REAL,
    frame_path TEXT,
    video_path TEXT,
    plate_crop_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 5. PERSON_EVENTS
-- Attribute-based sightings for person detections (clothing color only,
-- strictly privacy-compliant, no facial recognition)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS person_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    detection_id UUID REFERENCES detections(id) ON DELETE CASCADE,
    camera_id TEXT NOT NULL REFERENCES cameras(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    clothing_color VARCHAR(50) NOT NULL, -- dominant upper-body color
    color_confidence REAL NOT NULL DEFAULT 0.0,
    lower_clothing_color VARCHAR(50),
    has_bag BOOLEAN DEFAULT FALSE,
    frame_path TEXT,
    video_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- INDEXES FOR HIGH-SPEED ANPR AND ATTRIBUTE SEARCH
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_detections_camera_id ON detections(camera_id);
CREATE INDEX IF NOT EXISTS idx_detections_timestamp ON detections(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_detections_object_type ON detections(object_type);

CREATE INDEX IF NOT EXISTS idx_vehicles_plate_number ON vehicles(plate_number);
CREATE INDEX IF NOT EXISTS idx_vehicles_vehicle_color ON vehicles(vehicle_color);
CREATE INDEX IF NOT EXISTS idx_vehicles_vehicle_type ON vehicles(vehicle_type);

CREATE INDEX IF NOT EXISTS idx_vehicle_events_vehicle_id ON vehicle_events(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_events_camera_id ON vehicle_events(camera_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_events_timestamp ON vehicle_events(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_person_events_camera_id ON person_events(camera_id);
CREATE INDEX IF NOT EXISTS idx_person_events_clothing_color ON person_events(clothing_color);
CREATE INDEX IF NOT EXISTS idx_person_events_timestamp ON person_events(timestamp DESC);

-- ---------------------------------------------------------------------
-- VIEW: Multi-Camera Vehicle Trajectory Reconstructor
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW vehicle_trajectories AS
SELECT 
    v.plate_number,
    v.vehicle_type,
    v.vehicle_color,
    ve.id AS event_id,
    ve.camera_id,
    c.name AS camera_name,
    c.location AS camera_location,
    ve.latitude,
    ve.longitude,
    ve.timestamp,
    ve.frame_path,
    ve.video_path,
    ROW_NUMBER() OVER (PARTITION BY v.id ORDER BY ve.timestamp ASC) AS traversal_sequence
FROM vehicle_events ve
JOIN vehicles v ON ve.vehicle_id = v.id
JOIN cameras c ON ve.camera_id = c.id
ORDER BY v.plate_number, ve.timestamp ASC;
