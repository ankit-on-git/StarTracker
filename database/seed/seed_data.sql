-- =====================================================================
-- StarTracker: Realistic Demo Seed Data
-- SIH26127: Multi-Camera ANPR Trajectory Tracking
-- Synthetic Indian City CCTV Network (Ludhiana Smart City Corridor)
-- =====================================================================

-- 1. Insert Cameras
INSERT INTO cameras (id, name, location, latitude, longitude, status, stream_url, fps, resolution) VALUES
('CAM-01', 'Clock Tower Junction - North Gate', 'Old City Roundabout, Ludhiana', 30.9125, 75.8530, 'active', 'rtsp://mock-cam01/live', 30, '1920x1080'),
('CAM-02', 'Ferozepur Road - Flyover Ingress', 'Opp. PAU Gate 1, Ferozepur Rd', 30.9018, 75.8152, 'active', 'rtsp://mock-cam02/live', 30, '1920x1080'),
('CAM-03', 'Aarti Chowk Intersection', 'Main Commercial Corridor, Mall Rd', 30.8984, 75.8285, 'active', 'rtsp://mock-cam03/live', 25, '1920x1080'),
('CAM-04', 'Model Town Central Square', 'Market Crossing, Model Town', 30.8872, 75.8360, 'active', 'rtsp://mock-cam04/live', 30, '1920x1080'),
('CAM-05', 'Gill Road Industrial Corridor', 'Near Canal Bridge, Gill Rd', 30.8710, 75.8621, 'active', 'rtsp://mock-cam05/live', 25, '1920x1080'),
('CAM-06', 'Bus Stand Terminal Junction', 'GT Road Terminal Ingress', 30.9051, 75.8584, 'active', 'rtsp://mock-cam06/live', 30, '1920x1080'),
('CAM-07', 'Bharat Nagar Chowk', 'Civil Lines Access Arterial', 30.9042, 75.8431, 'maintenance', 'rtsp://mock-cam07/live', 20, '1280x720')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    location = EXCLUDED.location,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    status = EXCLUDED.status;

-- 2. Insert Vehicles
INSERT INTO vehicles (id, plate_number, plate_confidence, vehicle_type, vehicle_color, color_confidence, total_sightings, first_seen_at, last_seen_at) VALUES
('e1a11111-1111-4111-a111-111111111111', 'PB10AB1234', 0.96, 'car', 'red', 0.92, 4, NOW() - INTERVAL '35 minutes', NOW() - INTERVAL '4 minutes'),
('e2a22222-2222-4222-a222-222222222222', 'PB10CZ8899', 0.94, 'car', 'white', 0.95, 3, NOW() - INTERVAL '50 minutes', NOW() - INTERVAL '12 minutes'),
('e3a33333-3333-4333-a333-333333333333', 'PB08DE4521', 0.91, 'car', 'silver', 0.88, 3, NOW() - INTERVAL '70 minutes', NOW() - INTERVAL '25 minutes'),
('e4a44444-4444-4444-a444-444444444444', 'CH01AA9000', 0.97, 'bus', 'blue', 0.94, 2, NOW() - INTERVAL '90 minutes', NOW() - INTERVAL '15 minutes'),
('e5a55555-5555-4555-a555-555555555555', 'DL3C8721', 0.89, 'motorcycle', 'black', 0.93, 2, NOW() - INTERVAL '40 minutes', NOW() - INTERVAL '18 minutes'),
('e6a66666-6666-4666-a666-666666666666', 'HR26BR4020', 0.95, 'truck', 'yellow', 0.89, 2, NOW() - INTERVAL '110 minutes', NOW() - INTERVAL '45 minutes')
ON CONFLICT (plate_number) DO NOTHING;

-- 3. Insert Detections for Vehicles & Persons
INSERT INTO detections (id, camera_id, timestamp, object_type, confidence, frame_path, video_path, bbox_x, bbox_y, bbox_width, bbox_height) VALUES
-- PB10AB1234 Detections across corridor
('d1111111-1111-4111-b111-111111111111', 'CAM-01', NOW() - INTERVAL '35 minutes', 'car', 0.94, '/sample_data/images/det_cam01_car_red.jpg', '/sample_data/videos/cam01_clip.mp4', 0.22, 0.45, 0.28, 0.32),
('d1111111-1111-4111-b111-222222222222', 'CAM-03', NOW() - INTERVAL '22 minutes', 'car', 0.96, '/sample_data/images/det_cam03_car_red.jpg', '/sample_data/videos/cam03_clip.mp4', 0.35, 0.40, 0.30, 0.34),
('d1111111-1111-4111-b111-333333333333', 'CAM-02', NOW() - INTERVAL '12 minutes', 'car', 0.92, '/sample_data/images/det_cam02_car_red.jpg', '/sample_data/videos/cam02_clip.mp4', 0.15, 0.50, 0.25, 0.29),
('d1111111-1111-4111-b111-444444444444', 'CAM-04', NOW() - INTERVAL '4 minutes', 'car', 0.97, '/sample_data/images/det_cam04_car_red.jpg', '/sample_data/videos/cam04_clip.mp4', 0.42, 0.38, 0.31, 0.35),

-- Other vehicle detections
('d2222222-2222-4222-b222-111111111111', 'CAM-02', NOW() - INTERVAL '50 minutes', 'car', 0.93, '/sample_data/images/det_cam02_car_white.jpg', NULL, 0.30, 0.42, 0.29, 0.31),
('d2222222-2222-4222-b222-222222222222', 'CAM-03', NOW() - INTERVAL '30 minutes', 'car', 0.95, '/sample_data/images/det_cam03_car_white.jpg', NULL, 0.25, 0.48, 0.28, 0.30),
('d2222222-2222-4222-b222-333333333333', 'CAM-05', NOW() - INTERVAL '12 minutes', 'car', 0.94, '/sample_data/images/det_cam05_car_white.jpg', NULL, 0.40, 0.39, 0.32, 0.33),

-- Person Detections (Attribute based)
('dp111111-1111-4111-c111-111111111111', 'CAM-01', NOW() - INTERVAL '15 minutes', 'person', 0.91, '/sample_data/images/det_cam01_person_blue.jpg', '/sample_data/videos/cam01_p1.mp4', 0.65, 0.40, 0.08, 0.25),
('dp222222-2222-4222-c222-222222222222', 'CAM-04', NOW() - INTERVAL '8 minutes', 'person', 0.88, '/sample_data/images/det_cam04_person_blue.jpg', '/sample_data/videos/cam04_p2.mp4', 0.72, 0.38, 0.09, 0.28),
('dp333333-3333-4333-c333-333333333333', 'CAM-03', NOW() - INTERVAL '25 minutes', 'person', 0.93, '/sample_data/images/det_cam03_person_red.jpg', NULL, 0.55, 0.42, 0.07, 0.24),
('dp444444-4444-4444-c444-444444444444', 'CAM-06', NOW() - INTERVAL '5 minutes', 'person', 0.89, '/sample_data/images/det_cam06_person_black.jpg', NULL, 0.38, 0.46, 0.08, 0.26)
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Vehicle Events (Trajectory chain for PB10AB1234)
INSERT INTO vehicle_events (vehicle_id, detection_id, camera_id, timestamp, latitude, longitude, speed_estimate_kmh, heading_degrees, frame_path, video_path, plate_crop_path) VALUES
('e1a11111-1111-4111-a111-111111111111', 'd1111111-1111-4111-b111-111111111111', 'CAM-01', NOW() - INTERVAL '35 minutes', 30.9125, 75.8530, 42.5, 210, '/sample_data/images/det_cam01_car_red.jpg', '/sample_data/videos/cam01_clip.mp4', '/sample_data/images/plate_pb10ab1234_c1.jpg'),
('e1a11111-1111-4111-a111-111111111111', 'd1111111-1111-4111-b111-222222222222', 'CAM-03', NOW() - INTERVAL '22 minutes', 30.8984, 75.8285, 38.0, 195, '/sample_data/images/det_cam03_car_red.jpg', '/sample_data/videos/cam03_clip.mp4', '/sample_data/images/plate_pb10ab1234_c3.jpg'),
('e1a11111-1111-4111-a111-111111111111', 'd1111111-1111-4111-b111-333333333333', 'CAM-02', NOW() - INTERVAL '12 minutes', 30.9018, 75.8152, 45.2, 260, '/sample_data/images/det_cam02_car_red.jpg', '/sample_data/videos/cam02_clip.mp4', '/sample_data/images/plate_pb10ab1234_c2.jpg'),
('e1a11111-1111-4111-a111-111111111111', 'd1111111-1111-4111-b111-444444444444', 'CAM-04', NOW() - INTERVAL '4 minutes', 30.8872, 75.8360, 32.1, 140, '/sample_data/images/det_cam04_car_red.jpg', '/sample_data/videos/cam04_clip.mp4', '/sample_data/images/plate_pb10ab1234_c4.jpg'),

-- PB10CZ8899 events
('e2a22222-2222-4222-a222-222222222222', 'd2222222-2222-4222-b222-111111111111', 'CAM-02', NOW() - INTERVAL '50 minutes', 30.9018, 75.8152, 40.0, 110, '/sample_data/images/det_cam02_car_white.jpg', NULL, '/sample_data/images/plate_pb10cz8899_c2.jpg'),
('e2a22222-2222-4222-a222-222222222222', 'd2222222-2222-4222-b222-222222222222', 'CAM-03', NOW() - INTERVAL '30 minutes', 30.8984, 75.8285, 36.5, 125, '/sample_data/images/det_cam03_car_white.jpg', NULL, '/sample_data/images/plate_pb10cz8899_c3.jpg'),
('e2a22222-2222-4222-a222-222222222222', 'd2222222-2222-4222-b222-333333333333', 'CAM-05', NOW() - INTERVAL '12 minutes', 30.8710, 75.8621, 48.0, 150, '/sample_data/images/det_cam05_car_white.jpg', NULL, '/sample_data/images/plate_pb10cz8899_c5.jpg');

-- 5. Insert Person Events (Attribute-only: Clothing color, no face recognition)
INSERT INTO person_events (detection_id, camera_id, timestamp, clothing_color, color_confidence, lower_clothing_color, has_bag, frame_path, video_path) VALUES
('dp111111-1111-4111-c111-111111111111', 'CAM-01', NOW() - INTERVAL '15 minutes', 'blue', 0.92, 'black', true, '/sample_data/images/det_cam01_person_blue.jpg', '/sample_data/videos/cam01_p1.mp4'),
('dp222222-2222-4222-c222-222222222222', 'CAM-04', NOW() - INTERVAL '8 minutes', 'blue', 0.89, 'blue', false, '/sample_data/images/det_cam04_person_blue.jpg', '/sample_data/videos/cam04_p2.mp4'),
('dp333333-3333-4333-c333-333333333333', 'CAM-03', NOW() - INTERVAL '25 minutes', 'red', 0.94, 'gray', false, '/sample_data/images/det_cam03_person_red.jpg', NULL),
('dp444444-4444-4444-c444-444444444444', 'CAM-06', NOW() - INTERVAL '5 minutes', 'black', 0.87, 'blue', true, '/sample_data/images/det_cam06_person_black.jpg', NULL);
