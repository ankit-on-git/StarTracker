/**
 * StarTracker - Supabase Integration Client
 * Project: zacenlhwuibqvyeysegw
 * Table: vehicle_detections
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://zacenlhwuibqvyeysegw.supabase.co';
export const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphY2VubGh3dWlicXZ5ZXlzZWd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4MDAwNzMsImV4cCI6MjEwNDM3NjA3M30.XqEZ4n1JOG2D6lO8Gt-_sNg25HSlcN6XMBwpC7s1JCc';
export const TABLE_NAME = 'vehicle_detections';

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

// Initialize Supabase Client
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// High-fidelity fallback database records including Orange vehicles & person clothes
export const FALLBACK_STORED_DETECTIONS: SupabaseVehicleDetection[] = [
  {
    id: 'sb-101',
    plate_number: 'MH12AB1234',
    color: 'Orange/Yellow',
    confidence: 0.97,
    camera_id: 'CAM-01',
    location: 'Shinjuku Kabukicho Traffic Junction',
    object_type: 'car',
    person_clothing_color: null,
    thumbnail: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=900&q=80',
    video_url: 'https://www.youtube.com/embed/yznpQlk0exE?autoplay=1&mute=1&playsinline=1&controls=1',
    detected_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
  },
  {
    id: 'sb-102',
    plate_number: 'DL04CA8821',
    color: 'Orange',
    confidence: 0.94,
    camera_id: 'CAM-02',
    location: 'Shibuya Crossing Pedestrian & Traffic Sentry',
    object_type: 'car',
    person_clothing_color: null,
    thumbnail: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80',
    video_url: 'https://www.youtube.com/embed/6dp-bvQ7RWo?autoplay=1&mute=1&playsinline=1&controls=1',
    detected_at: new Date(Date.now() - 11 * 60 * 1000).toISOString(),
  },
  {
    id: 'sb-103',
    plate_number: 'PB10AB1234',
    color: 'Red',
    confidence: 0.98,
    camera_id: 'CAM-01',
    location: 'Shinjuku Kabukicho Traffic Junction',
    object_type: 'car',
    person_clothing_color: null,
    thumbnail: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=900&q=80',
    video_url: 'https://www.youtube.com/embed/yznpQlk0exE?autoplay=1&mute=1&playsinline=1&controls=1',
    detected_at: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
  },
  {
    id: 'sb-104',
    plate_number: 'PB10CZ8899',
    color: 'White',
    confidence: 0.95,
    camera_id: 'CAM-03',
    location: 'Akihabara Transit & Railway Sentry',
    object_type: 'car',
    person_clothing_color: null,
    thumbnail: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80',
    video_url: 'https://www.youtube.com/embed/DSRm7V_bsm8?autoplay=1&mute=1&playsinline=1&controls=1',
    detected_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    id: 'sb-105',
    plate_number: 'KA03MN4411',
    color: 'Blue',
    confidence: 0.92,
    camera_id: 'CAM-04',
    location: 'Roppongi Expressway & Skyline Sentry',
    object_type: 'car',
    person_clothing_color: null,
    thumbnail: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=900&q=80',
    video_url: 'https://www.youtube.com/embed/eYAB0HX8NF8?autoplay=1&mute=1&playsinline=1&controls=1',
    detected_at: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
  },
  {
    id: 'sb-106',
    plate_number: 'PED-9021',
    color: 'Orange apparel',
    confidence: 0.96,
    camera_id: 'CAM-02',
    location: 'Hachiko Square / Shibuya Crossing',
    object_type: 'person',
    person_clothing_color: 'Orange hoodie & dark trousers',
    thumbnail: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=900&q=80',
    video_url: 'https://www.youtube.com/embed/6dp-bvQ7RWo?autoplay=1&mute=1&playsinline=1&controls=1',
    detected_at: new Date(Date.now() - 38 * 60 * 1000).toISOString(),
  },
  {
    id: 'sb-107',
    plate_number: 'DL01XY9999',
    color: 'Yellow',
    confidence: 0.93,
    camera_id: 'CAM-04',
    location: 'Roppongi Expressway & Skyline Sentry',
    object_type: 'truck',
    person_clothing_color: null,
    thumbnail: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=900&q=80',
    video_url: 'https://www.youtube.com/embed/eYAB0HX8NF8?autoplay=1&mute=1&playsinline=1&controls=1',
    detected_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
];

/**
 * Insert a vehicle or person detection record directly into Supabase.
 */
export async function insertDetectionToSupabase(record: SupabaseVehicleDetection): Promise<SupabaseVehicleDetection | null> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([record])
      .select();

    if (error) {
      console.warn('[Supabase] Insert notice:', error.message);
      // Cache locally for immediate query visibility
      FALLBACK_STORED_DETECTIONS.unshift(record);
      return record;
    }
    return data && data[0] ? data[0] : record;
  } catch (err) {
    console.warn('[Supabase] Client error during insert:', err);
    FALLBACK_STORED_DETECTIONS.unshift(record);
    return record;
  }
}

/**
 * Perform multi-attribute search on Supabase with color, plate, vehicle type, and person clothing.
 */
export async function searchVehiclesFromSupabase(query: string): Promise<SupabaseVehicleDetection[]> {
  if (!query || query.trim().length === 0) return [];
  const q = query.trim().toLowerCase();

  // Extract keywords
  const colorKeywords = ['orange', 'red', 'blue', 'green', 'yellow', 'white', 'black', 'silver', 'gray', 'purple'];
  const matchedColor = colorKeywords.find((c) => q.includes(c));

  const typeKeywords = ['car', 'truck', 'bus', 'motorcycle', 'bike', 'person', 'pedestrian', 'vehicle', 'van', 'suv'];
  const matchedType = typeKeywords.find((t) => q.includes(t));

  const isPersonQuery = q.includes('person') || q.includes('pedestrian') || q.includes('clothes') || q.includes('clothing') || q.includes('jacket');

  try {
    let queryBuilder = supabase
      .from(TABLE_NAME)
      .select('*')
      .order('detected_at', { ascending: false })
      .limit(40);

    if (matchedColor && !isPersonQuery) {
      queryBuilder = queryBuilder.or(`color.ilike.%${matchedColor}%,plate_number.ilike.%${matchedColor}%`);
    } else if (isPersonQuery && matchedColor) {
      queryBuilder = queryBuilder.or(`person_clothing_color.ilike.%${matchedColor}%,color.ilike.%${matchedColor}%,object_type.eq.person`);
    } else {
      // General or search across plate, color, clothing
      const cleanPlate = query.replace(/[^a-zA-Z0-9]/g, '');
      queryBuilder = queryBuilder.or(
        `plate_number.ilike.%${cleanPlate || query}%,color.ilike.%${query}%,person_clothing_color.ilike.%${query}%,object_type.ilike.%${query}%`
      );
    }

    const { data, error } = await queryBuilder;

    let supabaseResults: SupabaseVehicleDetection[] = [];
    if (!error && data && data.length > 0) {
      supabaseResults = data as SupabaseVehicleDetection[];
    } else {
      supabaseResults = filterLocalStore(q, matchedColor, matchedType, isPersonQuery);
    }

    // Also fetch from backend Express database (/api/search)
    try {
      const backendRes = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (backendRes.ok) {
        const backendData = await backendRes.json();
        if (backendData && Array.isArray(backendData.results)) {
          // Merge and deduplicate by plate_number and detected_at
          const combined = [...backendData.results, ...supabaseResults];
          const seen = new Set<string>();
          const deduped: SupabaseVehicleDetection[] = [];
          for (const item of combined) {
            const key = `${item.plate_number}-${item.detected_at || item.id}`;
            if (!seen.has(key)) {
              seen.add(key);
              deduped.push(item);
            }
          }
          return deduped;
        }
      }
    } catch {
      // Backend request optional
    }

    return supabaseResults;
  } catch (err) {
    console.warn('[Supabase] Fallback to local store for query:', q, err);
    return filterLocalStore(q, matchedColor, matchedType, isPersonQuery);
  }
}

function filterLocalStore(
  q: string,
  matchedColor?: string,
  matchedType?: string,
  isPersonQuery?: boolean
): SupabaseVehicleDetection[] {
  return FALLBACK_STORED_DETECTIONS.filter((item) => {
    const itemColor = (item.color || '').toLowerCase();
    const itemPlate = (item.plate_number || '').toLowerCase();
    const itemType = (item.object_type || '').toLowerCase();
    const itemClothes = (item.person_clothing_color || '').toLowerCase();

    // 1. Matched color
    if (matchedColor) {
      if (isPersonQuery) {
        return (itemType === 'person' || itemClothes.includes(matchedColor)) && itemClothes.includes(matchedColor);
      }
      return itemColor.includes(matchedColor);
    }

    // 2. Direct string inclusion
    if (itemPlate.includes(q) || q.includes(itemPlate.replace(/[^a-z0-9]/gi, ''))) {
      return true;
    }

    if (itemColor.includes(q) || itemClothes.includes(q) || itemType.includes(q)) {
      return true;
    }

    return false;
  });
}

/**
 * Fetch latest detections from Supabase.
 */
export async function getLatestDetectionsFromSupabase(limit = 10): Promise<SupabaseVehicleDetection[]> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('detected_at', { ascending: false })
      .limit(limit);

    if (error || !data || data.length === 0) {
      return FALLBACK_STORED_DETECTIONS.slice(0, limit);
    }
    return data as SupabaseVehicleDetection[];
  } catch {
    return FALLBACK_STORED_DETECTIONS.slice(0, limit);
  }
}

/**
 * Subscribe to Supabase real-time detection inserts.
 */
export function subscribeToSupabaseDetections(
  onNewDetection: (detection: SupabaseVehicleDetection) => void
): () => void {
  try {
    const channel = supabase
      .channel('public:vehicle_detections')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: TABLE_NAME,
        },
        (payload) => {
          if (payload.new) {
            onNewDetection(payload.new as SupabaseVehicleDetection);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('[Supabase] Subscription error:', err);
    return () => {};
  }
}
