import { Camera, Detection, Vehicle, VehicleTrajectoryResult, UniversalSearchResponse, AnalyticsSummary } from '../types/startracker';

// The 4 Live YouTube Surveillance Cameras requested by the user
export const DEFAULT_4_CAMERAS: Camera[] = [
  {
    id: 'CAM-01',
    name: 'Shinjuku Kabukicho Traffic Junction',
    location: 'Shinjuku Central Optical Sentry',
    latitude: 35.6938,
    longitude: 139.7034,
    status: 'active',
    stream_url: 'https://www.youtube.com/live/yznpQlk0exE?si=NKwEWzLjD70vHskl',
    youtube_id: 'yznpQlk0exE',
    embed_url: 'https://www.youtube.com/embed/yznpQlk0exE?autoplay=1&mute=1&playsinline=1&controls=0&loop=1&playlist=yznpQlk0exE',
    thumbnail_url: 'https://img.youtube.com/vi/yznpQlk0exE/hqdefault.jpg',
    fps: 30,
    resolution: '1920x1080',
    last_detection_time: 'LIVE now',
    total_detections: 342,
    feed_type: 'youtube_live',
    provider: 'Tokyo Metropolitan Live Optical Ingress',
    city: 'Tokyo',
    heading: 315,
  },
  {
    id: 'CAM-02',
    name: 'Shibuya Crossing Pedestrian & Traffic Sentry',
    location: 'Hachiko Square / Shibuya Crossing',
    latitude: 35.6595,
    longitude: 139.7004,
    status: 'active',
    stream_url: 'https://www.youtube.com/live/6dp-bvQ7RWo?si=rJ10wkLELTJxyXxm',
    youtube_id: '6dp-bvQ7RWo',
    embed_url: 'https://www.youtube.com/embed/6dp-bvQ7RWo?autoplay=1&mute=1&playsinline=1&controls=0&loop=1&playlist=6dp-bvQ7RWo',
    thumbnail_url: 'https://img.youtube.com/vi/6dp-bvQ7RWo/hqdefault.jpg',
    fps: 30,
    resolution: '1920x1080',
    last_detection_time: 'LIVE now',
    total_detections: 589,
    feed_type: 'youtube_live',
    provider: 'Shibuya Municipal Optical Network',
    city: 'Tokyo',
    heading: 135,
  },
  {
    id: 'CAM-03',
    name: 'Akihabara Transit & Railway Sentry',
    location: 'Chiyoda Kanda Transit Corridor',
    latitude: 35.6983,
    longitude: 139.7731,
    status: 'active',
    stream_url: 'https://www.youtube.com/live/DSRm7V_bsm8?si=HKlBtsIK4MrdGKtL',
    youtube_id: 'DSRm7V_bsm8',
    embed_url: 'https://www.youtube.com/embed/DSRm7V_bsm8?autoplay=1&mute=1&playsinline=1&controls=0&loop=1&playlist=DSRm7V_bsm8',
    thumbnail_url: 'https://img.youtube.com/vi/DSRm7V_bsm8/hqdefault.jpg',
    fps: 30,
    resolution: '1920x1080',
    last_detection_time: 'LIVE now',
    total_detections: 412,
    feed_type: 'youtube_live',
    provider: 'Tokyo Rail & Highway Transit Ingress',
    city: 'Tokyo',
    heading: 45,
  },
  {
    id: 'CAM-04',
    name: 'Roppongi Expressway & Skyline Sentry',
    location: 'Metropolitan Expressway Route 3 Ingress',
    latitude: 35.6586,
    longitude: 139.7454,
    status: 'active',
    stream_url: 'https://www.youtube.com/live/eYAB0HX8NF8?si=xOmdlPfp_pVgVX-Q',
    youtube_id: 'eYAB0HX8NF8',
    embed_url: 'https://www.youtube.com/embed/eYAB0HX8NF8?autoplay=1&mute=1&playsinline=1&controls=0&loop=1&playlist=eYAB0HX8NF8',
    thumbnail_url: 'https://img.youtube.com/vi/eYAB0HX8NF8/hqdefault.jpg',
    fps: 30,
    resolution: '1920x1080',
    last_detection_time: 'LIVE now',
    total_detections: 380,
    feed_type: 'youtube_live',
    provider: 'Metropolitan Highway Optical Corridor',
    city: 'Tokyo',
    heading: 180,
  },
];

// Helper to extract YouTube ID from varied URL formats
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|live\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

// Local storage management for added CCTV cameras
const STORAGE_KEY_CAMERAS = 'startracker_connected_cameras';

function loadStoredCameras(): Camera[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CAMERAS);
    if (!raw) return DEFAULT_4_CAMERAS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_4_CAMERAS;
  } catch (e) {
    return DEFAULT_4_CAMERAS;
  }
}

function saveStoredCameras(cams: Camera[]) {
  try {
    localStorage.setItem(STORAGE_KEY_CAMERAS, JSON.stringify(cams));
  } catch (e) {
    console.error('Failed to save cameras', e);
  }
}

// Mock Vehicles with Trajectories
const MOCK_TRAJECTORIES: Record<string, VehicleTrajectoryResult> = {
  PB10AB1234: {
    vehicle: {
      id: 'v-1',
      plate_number: 'PB10AB1234',
      plate_confidence: 0.98,
      vehicle_type: 'car',
      vehicle_color: 'red',
      color_confidence: 0.94,
      total_sightings: 4,
      first_seen_at: '14:20:10 IST',
      last_seen_at: '14:46:22 IST',
    },
    total_cameras: 4,
    time_span_minutes: 26,
    events: [
      {
        sequence: 1,
        camera_id: 'CAM-01',
        camera_name: 'Shinjuku Kabukicho Traffic Junction',
        camera_location: 'Shinjuku Central Optical Sentry',
        latitude: 35.6938,
        longitude: 139.7034,
        timestamp: '14:20:10 IST',
        speed_estimate_kmh: 42.5,
        frame_path: 'https://img.youtube.com/vi/yznpQlk0exE/hqdefault.jpg',
      },
      {
        sequence: 2,
        camera_id: 'CAM-02',
        camera_name: 'Shibuya Crossing Pedestrian & Traffic Sentry',
        camera_location: 'Hachiko Square / Shibuya Crossing',
        latitude: 35.6595,
        longitude: 139.7004,
        timestamp: '14:28:40 IST',
        speed_estimate_kmh: 35.0,
        frame_path: 'https://img.youtube.com/vi/6dp-bvQ7RWo/hqdefault.jpg',
      },
      {
        sequence: 3,
        camera_id: 'CAM-03',
        camera_name: 'Akihabara Transit & Railway Sentry',
        camera_location: 'Chiyoda Kanda Transit Corridor',
        latitude: 35.6983,
        longitude: 139.7731,
        timestamp: '14:38:45 IST',
        speed_estimate_kmh: 46.2,
        frame_path: 'https://img.youtube.com/vi/DSRm7V_bsm8/hqdefault.jpg',
      },
      {
        sequence: 4,
        camera_id: 'CAM-04',
        camera_name: 'Roppongi Expressway & Skyline Sentry',
        camera_location: 'Metropolitan Expressway Route 3 Ingress',
        latitude: 35.6586,
        longitude: 139.7454,
        timestamp: '14:46:22 IST',
        speed_estimate_kmh: 68.0,
        frame_path: 'https://img.youtube.com/vi/eYAB0HX8NF8/hqdefault.jpg',
      },
    ],
  },
  PB10CZ8899: {
    vehicle: {
      id: 'v-2',
      plate_number: 'PB10CZ8899',
      plate_confidence: 0.95,
      vehicle_type: 'car',
      vehicle_color: 'white',
      color_confidence: 0.91,
      total_sightings: 2,
      first_seen_at: '14:15:00 IST',
      last_seen_at: '14:38:15 IST',
    },
    total_cameras: 2,
    time_span_minutes: 23,
    events: [
      {
        sequence: 1,
        camera_id: 'CAM-02',
        camera_name: 'Shibuya Crossing Pedestrian & Traffic Sentry',
        camera_location: 'Hachiko Square / Shibuya Crossing',
        latitude: 35.6595,
        longitude: 139.7004,
        timestamp: '14:15:00 IST',
        speed_estimate_kmh: 35.0,
        frame_path: 'https://img.youtube.com/vi/6dp-bvQ7RWo/hqdefault.jpg',
      },
      {
        sequence: 2,
        camera_id: 'CAM-03',
        camera_name: 'Akihabara Transit & Railway Sentry',
        camera_location: 'Chiyoda Kanda Transit Corridor',
        latitude: 35.6983,
        longitude: 139.7731,
        timestamp: '14:38:15 IST',
        speed_estimate_kmh: 44.3,
        frame_path: 'https://img.youtube.com/vi/DSRm7V_bsm8/hqdefault.jpg',
      },
    ],
  },
  DL01XY9999: {
    vehicle: {
      id: 'v-3',
      plate_number: 'DL01XY9999',
      plate_confidence: 0.92,
      vehicle_type: 'truck',
      vehicle_color: 'yellow',
      color_confidence: 0.88,
      total_sightings: 3,
      first_seen_at: '13:50:00 IST',
      last_seen_at: '14:30:10 IST',
    },
    total_cameras: 3,
    time_span_minutes: 40,
    events: [
      {
        sequence: 1,
        camera_id: 'CAM-03',
        camera_name: 'Akihabara Transit & Railway Sentry',
        camera_location: 'Chiyoda Kanda Transit Corridor',
        latitude: 35.6983,
        longitude: 139.7731,
        timestamp: '13:50:00 IST',
        speed_estimate_kmh: 36.1,
        frame_path: 'https://img.youtube.com/vi/DSRm7V_bsm8/hqdefault.jpg',
      },
      {
        sequence: 2,
        camera_id: 'CAM-04',
        camera_name: 'Roppongi Expressway & Skyline Sentry',
        camera_location: 'Metropolitan Expressway Route 3 Ingress',
        latitude: 35.6586,
        longitude: 139.7454,
        timestamp: '14:10:20 IST',
        speed_estimate_kmh: 58.5,
        frame_path: 'https://img.youtube.com/vi/eYAB0HX8NF8/hqdefault.jpg',
      },
      {
        sequence: 3,
        camera_id: 'CAM-01',
        camera_name: 'Shinjuku Kabukicho Traffic Junction',
        camera_location: 'Shinjuku Central Optical Sentry',
        latitude: 35.6938,
        longitude: 139.7034,
        timestamp: '14:30:10 IST',
        speed_estimate_kmh: 34.0,
        frame_path: 'https://img.youtube.com/vi/yznpQlk0exE/hqdefault.jpg',
      },
    ],
  },
};

// Recent Detections with both Person & Vehicle classes
const MOCK_RECENT_DETECTIONS: Detection[] = [
  {
    id: 'det-1',
    camera_id: 'CAM-02',
    camera_name: 'Shibuya Crossing Pedestrian & Traffic Sentry',
    timestamp: 'Just now (LIVE)',
    object_type: 'person',
    category: 'person',
    confidence: 0.97,
    color: 'Grey Overcoat',
    frame_path: 'https://img.youtube.com/vi/6dp-bvQ7RWo/hqdefault.jpg',
    bbox_x: 0.32,
    bbox_y: 0.42,
    bbox_width: 0.06,
    bbox_height: 0.13,
  },
  {
    id: 'det-2',
    camera_id: 'CAM-01',
    camera_name: 'Shinjuku Kabukicho Traffic Junction',
    timestamp: '1m ago (LIVE)',
    object_type: 'car',
    category: 'vehicle',
    confidence: 0.97,
    plate: 'PB10AB1234',
    color: 'Silver Metallic',
    frame_path: 'https://img.youtube.com/vi/yznpQlk0exE/hqdefault.jpg',
    bbox_x: 0.44,
    bbox_y: 0.48,
    bbox_width: 0.22,
    bbox_height: 0.20,
    speed_kmh: 42,
  },
  {
    id: 'det-3',
    camera_id: 'CAM-02',
    camera_name: 'Shibuya Crossing Pedestrian & Traffic Sentry',
    timestamp: '2m ago (LIVE)',
    object_type: 'bus',
    category: 'vehicle',
    confidence: 0.96,
    plate: 'PB10TR4455',
    color: 'Metropolitan Blue',
    frame_path: 'https://img.youtube.com/vi/6dp-bvQ7RWo/hqdefault.jpg',
    bbox_x: 0.68,
    bbox_y: 0.32,
    bbox_width: 0.26,
    bbox_height: 0.28,
    speed_kmh: 28,
  },
  {
    id: 'det-4',
    camera_id: 'CAM-03',
    camera_name: 'Akihabara Transit & Railway Sentry',
    timestamp: '3m ago (LIVE)',
    object_type: 'person',
    category: 'person',
    confidence: 0.92,
    color: 'Dark Jacket',
    frame_path: 'https://img.youtube.com/vi/DSRm7V_bsm8/hqdefault.jpg',
    bbox_x: 0.20,
    bbox_y: 0.52,
    bbox_width: 0.06,
    bbox_height: 0.13,
  },
  {
    id: 'det-5',
    camera_id: 'CAM-04',
    camera_name: 'Roppongi Expressway & Skyline Sentry',
    timestamp: '4m ago (LIVE)',
    object_type: 'truck',
    category: 'vehicle',
    confidence: 0.94,
    plate: 'DL01XY9999',
    color: 'Freight White',
    frame_path: 'https://img.youtube.com/vi/eYAB0HX8NF8/hqdefault.jpg',
    bbox_x: 0.60,
    bbox_y: 0.38,
    bbox_width: 0.27,
    bbox_height: 0.28,
    speed_kmh: 58,
  },
  {
    id: 'det-6',
    camera_id: 'CAM-01',
    camera_name: 'Shinjuku Kabukicho Traffic Junction',
    timestamp: '5m ago (LIVE)',
    object_type: 'motorcycle',
    category: 'vehicle',
    confidence: 0.89,
    plate: 'PB10MC7788',
    color: 'Crimson Red',
    frame_path: 'https://img.youtube.com/vi/yznpQlk0exE/hqdefault.jpg',
    bbox_x: 0.12,
    bbox_y: 0.62,
    bbox_width: 0.09,
    bbox_height: 0.14,
    speed_kmh: 38,
  },
];

export const StarTrackerAPI = {
  async getCameras(): Promise<Camera[]> {
    return loadStoredCameras();
  },

  async addCamera(newCamera: Omit<Camera, 'id'> & { id?: string }): Promise<Camera> {
    const existing = loadStoredCameras();
    const id = newCamera.id || `CAM-0${existing.length + 1}`;
    
    // Auto configure embed and thumbnail if youtube URL
    let ytId = newCamera.youtube_id;
    if (!ytId && newCamera.stream_url) {
      ytId = extractYouTubeId(newCamera.stream_url) || undefined;
    }

    const camera: Camera = {
      ...newCamera,
      id,
      youtube_id: ytId,
      embed_url: ytId 
        ? `https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&playsinline=1&controls=0&loop=1&playlist=${ytId}`
        : newCamera.embed_url,
      thumbnail_url: ytId
        ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
        : newCamera.thumbnail_url || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=80',
      feed_type: ytId ? 'youtube_live' : (newCamera.feed_type || 'rtsp'),
      status: 'active',
      last_detection_time: 'LIVE now',
      total_detections: 0,
      created_at: new Date().toISOString(),
    };

    const updated = [...existing, camera];
    saveStoredCameras(updated);
    return camera;
  },

  async deleteCamera(cameraId: string): Promise<Camera[]> {
    const existing = loadStoredCameras();
    const updated = existing.filter(c => c.id !== cameraId);
    saveStoredCameras(updated);
    return updated;
  },

  async resetCameras(): Promise<Camera[]> {
    saveStoredCameras(DEFAULT_4_CAMERAS);
    return DEFAULT_4_CAMERAS;
  },

  async getRecentDetections(): Promise<Detection[]> {
    return MOCK_RECENT_DETECTIONS;
  },

  async getAnalytics(): Promise<AnalyticsSummary> {
    const cams = loadStoredCameras();
    return {
      total_detections: 2315,
      active_cameras: cams.length,
      anpr_reads: 1140,
      detected_vehicles: 8,
      vehicle_type_breakdown: {
        car: 5,
        motorcycle: 1,
        bus: 1,
        truck: 1,
      },
      color_distribution: {
        red: 2,
        white: 2,
        silver: 1,
        blue: 1,
        black: 1,
        yellow: 1,
      },
      hourly_traffic: [
        { hour: '06:00', vehicles: 140, average_speed: 48 },
        { hour: '08:00', vehicles: 420, average_speed: 34 },
        { hour: '10:00', vehicles: 680, average_speed: 28 },
        { hour: '12:00', vehicles: 510, average_speed: 32 },
        { hour: '14:00', vehicles: 460, average_speed: 36 },
        { hour: '16:00', vehicles: 720, average_speed: 26 },
        { hour: '18:00', vehicles: 890, average_speed: 22 },
        { hour: '20:00', vehicles: 580, average_speed: 35 },
        { hour: '22:00', vehicles: 230, average_speed: 45 },
      ],
      camera_activity: cams.map((c, i) => ({
        camera_id: c.id,
        name: c.name,
        detections: c.total_detections || Math.round(300 + i * 80),
        speed_avg: 38 + (i % 3) * 6,
      })),
    };
  },

  async universalSearch(rawQuery: string): Promise<UniversalSearchResponse> {
    const q = rawQuery.trim().toLowerCase();
    const cleanPlate = rawQuery.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

    // 1. Vehicle attribute search (e.g. 'red car', 'white vehicle', 'yellow truck')
    const colors = ['red', 'blue', 'green', 'white', 'black', 'silver', 'yellow', 'orange', 'gray'];
    const matchedColor = colors.find(c => q.includes(c));
    const vehicleTypes = ['car', 'bus', 'truck', 'motorcycle', 'bike', 'suv', 'van'];
    const matchedType = vehicleTypes.find(t => q.includes(t));

    if (matchedColor && (matchedType || q.includes('vehicle'))) {
      const targetType = matchedType === 'bike' ? 'motorcycle' : matchedType;
      const matchedVehicles: VehicleTrajectoryResult[] = [];

      for (const [plate, traj] of Object.entries(MOCK_TRAJECTORIES)) {
        const v = traj.vehicle;
        const colorMatch = v.vehicle_color === matchedColor;
        const typeMatch = !targetType || v.vehicle_type === targetType;
        if (colorMatch && typeMatch) {
          matchedVehicles.push(traj);
        }
      }

      return {
        query_type: 'vehicle_attribute',
        parsed_filters: { color: matchedColor, vehicle_type: targetType || 'any' },
        total_results: matchedVehicles.length,
        vehicles: matchedVehicles,
      };
    }

    // 2. License plate search (Exact, Partial, or Normalized)
    const matchedVehicles: VehicleTrajectoryResult[] = [];
    for (const [plate, traj] of Object.entries(MOCK_TRAJECTORIES)) {
      if (plate.includes(cleanPlate) || cleanPlate.includes(plate) || cleanPlate === 'PB10AB1234') {
        matchedVehicles.push(traj);
      }
    }

    if (matchedVehicles.length > 0) {
      return {
        query_type: 'plate',
        parsed_filters: { plate_number: cleanPlate },
        total_results: matchedVehicles.length,
        vehicles: matchedVehicles,
      };
    }

    // Fallback: Default to demo vehicle hit
    const defaultHit = MOCK_TRAJECTORIES.PB10AB1234;
    return {
      query_type: 'plate',
      parsed_filters: { plate_number: cleanPlate },
      total_results: 1,
      vehicles: [defaultHit],
    };
  },

  async processVideoSimulation(cameraId: string, frameSkip: number): Promise<any> {
    return {
      status: 'completed',
      camera_id: cameraId,
      frame_skip: frameSkip,
      frames_processed: 30,
      detections_created: 3,
      vehicles_identified: 3,
      results: [
        {
          timestamp: '14:50:01 IST',
          object_type: 'car',
          plate: 'PB10AB1234',
          color: 'red',
          confidence: 0.96,
          bbox: { x: 0.22, y: 0.45, width: 0.28, height: 0.32 },
        },
        {
          timestamp: '14:50:03 IST',
          object_type: 'truck',
          plate: 'DL01XY9999',
          color: 'yellow',
          confidence: 0.93,
          bbox: { x: 0.45, y: 0.38, width: 0.34, height: 0.40 },
        },
        {
          timestamp: '14:50:05 IST',
          object_type: 'car',
          plate: 'PB10CZ8899',
          color: 'white',
          confidence: 0.94,
          bbox: { x: 0.30, y: 0.42, width: 0.29, height: 0.31 },
        },
      ],
    };
  },
};
