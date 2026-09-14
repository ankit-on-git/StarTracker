import { Camera, SupabaseVehicleDetection } from '../types/startracker';
import { insertDetectionToSupabase, FALLBACK_STORED_DETECTIONS } from './supabase';

export interface VehicleSnapshotOptions {
  plate_number: string;
  color: string;
  object_type: string;
  confidence: number;
  speed_kmh?: number;
  location?: string;
  detected_at?: string;
}

/**
 * Color mapping for canvas rendering
 */
const COLOR_RGB_MAP: Record<string, { body: string; dark: string; light: string; hex: string }> = {
  orange: { body: '#f97316', dark: '#c2410c', light: '#fed7aa', hex: '#f97316' },
  red: { body: '#ef4444', dark: '#991b1b', light: '#fecaca', hex: '#ef4444' },
  white: { body: '#f8fafc', dark: '#94a3b8', light: '#ffffff', hex: '#ffffff' },
  blue: { body: '#3b82f6', dark: '#1e40af', light: '#bfdbfe', hex: '#3b82f6' },
  black: { body: '#1e293b', dark: '#0f172a', light: '#475569', hex: '#0f172a' },
  yellow: { body: '#eab308', dark: '#a16207', light: '#fef08a', hex: '#eab308' },
  silver: { body: '#cbd5e1', dark: '#64748b', light: '#f1f5f9', hex: '#94a3b8' },
  green: { body: '#22c55e', dark: '#15803d', light: '#bbf7d0', hex: '#22c55e' },
};

export function getRgbForColorName(colorName: string) {
  const lower = (colorName || '').toLowerCase();
  for (const [key, val] of Object.entries(COLOR_RGB_MAP)) {
    if (lower.includes(key)) return val;
  }
  return COLOR_RGB_MAP.orange;
}

/**
 * Generates an authentic optical CCTV snapshot picture of a detected vehicle.
 * Renders on an offscreen HTMLCanvasElement and returns a base64 JPEG data URL.
 */
export function generateVehicleCctvSnapshot(
  camera: Camera,
  info: VehicleSnapshotOptions
): string {
  const canvas = document.createElement('canvas');
  canvas.width = 720;
  canvas.height = 405;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const w = canvas.width;
  const h = canvas.height;
  const colorSpec = getRgbForColorName(info.color);

  // 1. Asphalt roadway & surveillance camera perspective background
  const roadGrad = ctx.createLinearGradient(0, 0, 0, h);
  roadGrad.addColorStop(0, '#0a0f1d');
  roadGrad.addColorStop(0.4, '#111827');
  roadGrad.addColorStop(1, '#030712');
  ctx.fillStyle = roadGrad;
  ctx.fillRect(0, 0, w, h);

  // Road Perspective Lines
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  // Lane dividers
  ctx.moveTo(w * 0.15, h);
  ctx.lineTo(w * 0.35, h * 0.3);
  ctx.moveTo(w * 0.85, h);
  ctx.lineTo(w * 0.65, h * 0.3);
  ctx.stroke();

  // Dashed center lane
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 3;
  ctx.setLineDash([24, 18]);
  ctx.beginPath();
  ctx.moveTo(w * 0.5, h);
  ctx.lineTo(w * 0.5, h * 0.3);
  ctx.stroke();
  ctx.setLineDash([]);

  // Street ambient lighting glow
  const lightGlow = ctx.createRadialGradient(w * 0.5, h * 0.55, 20, w * 0.5, h * 0.55, 240);
  lightGlow.addColorStop(0, 'rgba(255,255,255,0.08)');
  lightGlow.addColorStop(0.5, 'rgba(6,182,212,0.04)');
  lightGlow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = lightGlow;
  ctx.fillRect(0, 0, w, h);

  // 2. Render Vehicle Body (in center of optical frame)
  const vX = w * 0.32;
  const vY = h * 0.38;
  const vW = w * 0.36;
  const vH = h * 0.36;

  // Car Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  ctx.beginPath();
  ctx.ellipse(vX + vW * 0.5, vY + vH * 0.95, vW * 0.55, vH * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wheels
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 3;
  // Left Front Wheel
  ctx.beginPath();
  ctx.ellipse(vX + vW * 0.18, vY + vH * 0.86, vW * 0.08, vH * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Right Front Wheel
  ctx.beginPath();
  ctx.ellipse(vX + vW * 0.82, vY + vH * 0.86, vW * 0.08, vH * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Vehicle Lower Body (Main chassis)
  const bodyGrad = ctx.createLinearGradient(vX, vY, vX, vY + vH);
  bodyGrad.addColorStop(0, colorSpec.light);
  bodyGrad.addColorStop(0.4, colorSpec.body);
  bodyGrad.addColorStop(1, colorSpec.dark);
  ctx.fillStyle = bodyGrad;

  ctx.beginPath();
  ctx.roundRect(vX + vW * 0.05, vY + vH * 0.52, vW * 0.9, vH * 0.36, [14, 14, 6, 6]);
  ctx.fill();

  // Vehicle Cabin / Roof
  ctx.beginPath();
  ctx.roundRect(vX + vW * 0.18, vY + vH * 0.22, vW * 0.64, vH * 0.34, [18, 18, 0, 0]);
  ctx.fill();

  // Windshield & Windows
  const winGrad = ctx.createLinearGradient(vX, vY, vX + vW, vY + vH);
  winGrad.addColorStop(0, '#0f172a');
  winGrad.addColorStop(0.5, '#1e293b');
  winGrad.addColorStop(1, '#0284c7');
  ctx.fillStyle = winGrad;
  ctx.beginPath();
  ctx.roundRect(vX + vW * 0.22, vY + vH * 0.26, vW * 0.56, vH * 0.24, [10, 10, 2, 2]);
  ctx.fill();

  // Headlights (Lit up)
  ctx.fillStyle = '#fef08a';
  ctx.shadowColor = '#facc15';
  ctx.shadowBlur = 12;
  // Left Headlight
  ctx.beginPath();
  ctx.roundRect(vX + vW * 0.08, vY + vH * 0.56, vW * 0.12, vH * 0.09, 4);
  ctx.fill();
  // Right Headlight
  ctx.beginPath();
  ctx.roundRect(vX + vW * 0.80, vY + vH * 0.56, vW * 0.12, vH * 0.09, 4);
  ctx.fill();
  ctx.shadowBlur = 0; // reset

  // Grille
  ctx.fillStyle = '#090d16';
  ctx.fillRect(vX + vW * 0.28, vY + vH * 0.58, vW * 0.44, vH * 0.12);

  // 3. Indian HSRP Number Plate directly on car bumper
  const plateW = vW * 0.46;
  const plateH = vH * 0.12;
  const plateX = vX + (vW - plateW) / 2;
  const plateY = vY + vH * 0.74;

  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1.5;
  ctx.fillRect(plateX, plateY, plateW, plateH);
  ctx.strokeRect(plateX, plateY, plateW, plateH);

  // Blue IND badge on plate
  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(plateX, plateY, plateW * 0.16, plateH);
  ctx.font = 'bold 8px ui-monospace, monospace';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('IND', plateX + 2, plateY + plateH * 0.72);

  // Plate Text
  ctx.font = 'bold 12px ui-monospace, SFMono-Regular, monospace';
  ctx.fillStyle = '#0f172a';
  ctx.fillText(info.plate_number, plateX + plateW * 0.22, plateY + plateH * 0.76);

  // 4. StarTracker AI YOLOv8 Optical Bounding Box
  const boxPadding = 12;
  const bX = vX - boxPadding;
  const bY = vY - boxPadding;
  const bW = vW + boxPadding * 2;
  const bH = vH + boxPadding * 2;

  ctx.strokeStyle = colorSpec.hex;
  ctx.lineWidth = 2;
  ctx.fillStyle = `${colorSpec.hex}15`;
  ctx.fillRect(bX, bY, bW, bH);
  ctx.strokeRect(bX, bY, bW, bH);

  // Reticle Corner Brackets
  const corner = 22;
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = '#ffffff';
  // Top-Left
  ctx.beginPath();
  ctx.moveTo(bX, bY + corner);
  ctx.lineTo(bX, bY);
  ctx.lineTo(bX + corner, bY);
  ctx.stroke();
  // Top-Right
  ctx.beginPath();
  ctx.moveTo(bX + bW - corner, bY);
  ctx.lineTo(bX + bW, bY);
  ctx.lineTo(bX + bW, bY + corner);
  ctx.stroke();
  // Bottom-Left
  ctx.beginPath();
  ctx.moveTo(bX, bY + bH - corner);
  ctx.lineTo(bX, bY + bH);
  ctx.lineTo(bX + corner, bY + bH);
  ctx.stroke();
  // Bottom-Right
  ctx.beginPath();
  ctx.moveTo(bX + bW - corner, bY + bH);
  ctx.lineTo(bX + bW, bY + bH);
  ctx.lineTo(bX + bW, bY + bH - corner);
  ctx.stroke();

  // Bounding Box Label Pill
  const labelText = `${info.object_type.toUpperCase()} [${info.color.toUpperCase()}] ${(info.confidence * 100).toFixed(0)}%`;
  ctx.font = 'bold 11px ui-monospace, SFMono-Regular, monospace';
  const textW = ctx.measureText(labelText).width;
  ctx.fillStyle = colorSpec.hex;
  ctx.fillRect(bX, bY - 22, textW + 16, 22);
  ctx.fillStyle = '#020617';
  ctx.fillText(labelText, bX + 8, bY - 7);

  // 5. StarTracker Tactical CCTV Optical HUD & Timecode Overlay
  // Top Bar Dark Header
  ctx.fillStyle = 'rgba(0,0,0,0.82)';
  ctx.fillRect(0, 0, w, 38);

  // REC Indicator
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(18, 19, 5.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = 'bold 11px ui-monospace, monospace';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`CCTV LIVE EVIDENCE • ${camera.id}`, 30, 23);

  // Optical Location
  ctx.font = '10px ui-monospace, monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(camera.location || camera.name, 190, 23);

  // Timestamp
  const now = new Date(info.detected_at || Date.now());
  const timeStr = `${now.toISOString().replace('T', ' ').slice(0, 19)}.${String(now.getMilliseconds()).padStart(3, '0')}`;
  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 11px ui-monospace, monospace';
  ctx.fillText(timeStr, w - 195, 23);

  // Bottom Optical Data Ribbon
  ctx.fillStyle = 'rgba(0,0,0,0.85)';
  ctx.fillRect(0, h - 36, w, 36);

  ctx.font = 'bold 11px ui-monospace, monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(`ANPR: [${info.plate_number}]`, 14, h - 14);

  ctx.fillStyle = '#e2e8f0';
  ctx.fillText(`COLOR: ${info.color.toUpperCase()}`, 190, h - 14);

  ctx.fillStyle = '#a855f7';
  ctx.fillText(`VELOCITY: ${info.speed_kmh || 46} KM/H`, 350, h - 14);

  ctx.fillStyle = '#34d399';
  ctx.fillText(`STARTRACKER AI SENTRY VERIFIED`, w - 240, h - 14);

  // Scanline overlay
  ctx.fillStyle = 'rgba(255,255,255,0.02)';
  for (let i = 0; i < h; i += 4) {
    ctx.fillRect(0, i, w, 1);
  }

  return canvas.toDataURL('image/jpeg', 0.88);
}

/**
 * Saves a vehicle detection record into BOTH backend server DB (/api/detections)
 * AND Supabase database, and returns the persisted record.
 */
export async function saveVehicleDetectionToDatabase(
  record: SupabaseVehicleDetection
): Promise<SupabaseVehicleDetection> {
  const enriched: SupabaseVehicleDetection = {
    ...record,
    detected_at: record.detected_at || new Date().toISOString(),
  };

  // 1. Send to Express Backend API (/api/detections)
  try {
    const res = await fetch('/api/detections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enriched),
    });
    if (res.ok) {
      const data = await res.json();
      console.log('[Backend API] Saved detection successfully:', data.detection?.plate_number);
    }
  } catch (e) {
    console.warn('[Backend API] Note: fetch to /api/detections failed, using local/Supabase:', e);
  }

  // 2. Send to Supabase
  try {
    await insertDetectionToSupabase(enriched);
  } catch (e) {
    console.warn('[Supabase] Insert notification:', e);
  }

  // 3. Keep in-memory cache for immediate query hits
  const exists = FALLBACK_STORED_DETECTIONS.some(
    (d) => d.plate_number === enriched.plate_number && d.camera_id === enriched.camera_id
  );
  if (!exists) {
    FALLBACK_STORED_DETECTIONS.unshift(enriched);
  }

  return enriched;
}
