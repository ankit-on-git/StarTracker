export type CameraStatus = 'active' | 'inactive' | 'maintenance' | 'offline';
export type CctvProtocol = 'rtsp' | 'onvif' | 'hls' | 'http' | 'youtube_live';

export interface Camera {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  status: CameraStatus;
  stream_url?: string;
  youtube_id?: string;
  embed_url?: string;
  thumbnail_url?: string;
  fps: number;
  resolution: string;
  created_at?: string;
  last_detection_time?: string;
  total_detections?: number;
  feed_type?: 'youtube_live' | 'video' | 'cctv_snapshot' | 'rtsp' | 'hls';
  provider?: string;
  source_repo?: string;
  city?: string;
  heading?: number;
  fov?: number;
  ip_address?: string;
  port?: number;
  protocol?: 'rtsp' | 'hls' | 'youtube' | 'onvif' | 'mjpeg';
  auth_user?: string;
  detection_profile?: string;
}

export interface Detection {
  id: string;
  camera_id: string;
  camera_name?: string;
  timestamp: string;
  object_type: 'person' | 'car' | 'motorcycle' | 'bus' | 'truck' | 'bicycle' | 'vehicle' | 'suv';
  category?: 'person' | 'vehicle';
  confidence: number;
  plate?: string;
  color?: string;
  frame_path?: string;
  video_path?: string;
  bbox_x: number;
  bbox_y: number;
  bbox_width: number;
  bbox_height: number;
  speed_kmh?: number;
}

export interface Vehicle {
  id: string;
  plate_number: string;
  plate_confidence: number;
  vehicle_type: 'car' | 'motorcycle' | 'bus' | 'truck' | 'van';
  vehicle_color: string;
  color_confidence: number;
  total_sightings: number;
  first_seen_at?: string;
  last_seen_at?: string;
}

export interface TrajectoryPoint {
  sequence: number;
  camera_id: string;
  camera_name: string;
  camera_location: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  speed_estimate_kmh?: number;
  frame_path?: string;
  video_path?: string;
  plate_crop_path?: string;
}

export interface VehicleTrajectoryResult {
  vehicle: Vehicle;
  events: TrajectoryPoint[];
  total_cameras: number;
  time_span_minutes: number;
}

export interface PersonEvent {
  id: string;
  detection_id?: string;
  camera_id: string;
  camera_name?: string;
  camera_location?: string;
  latitude?: number;
  longitude?: number;
  timestamp: string;
  clothing_color: string;
  color_confidence: number;
  lower_clothing_color?: string;
  has_bag?: boolean;
  frame_path?: string;
  video_path?: string;
}

export interface SupabaseVehicleDetection {
  id?: string | number;
  plate_number: string;
  color: string;
  confidence: number;
  camera_id: string;
  thumbnail?: string;
  video_url?: string;
  location?: string;
  object_type?: string;
  person_clothing_color?: string | null;
  detected_at?: string;
}

export interface UniversalSearchResponse {
  query_type: 'plate' | 'vehicle_attribute' | 'clothing' | 'unknown';
  parsed_filters: Record<string, any>;
  total_results: number;
  disclaimer?: string;
  vehicles: VehicleTrajectoryResult[];
  supabase_detections?: SupabaseVehicleDetection[];
}

export interface AnalyticsSummary {
  total_detections: number;
  active_cameras: number;
  anpr_reads: number;
  detected_vehicles: number;
  vehicle_type_breakdown: Record<string, number>;
  color_distribution: Record<string, number>;
  hourly_traffic: { hour: string; vehicles: number; average_speed: number }[];
  camera_activity: { camera_id: string; name: string; detections: number; speed_avg: number }[];
}
