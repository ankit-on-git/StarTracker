import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/server/database';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support JSON payloads including base64 image pictures
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // API Routes

  // 1. Health & Status
  app.get('/api/health', (req, res) => {
    const dets = db.getDetections();
    const cams = db.getCameras();
    res.json({
      status: 'ok',
      time: new Date().toISOString(),
      camerasCount: cams.length,
      detectionsCount: dets.length,
      engine: 'Persistent Relational DB',
      ultralytics: {
        repo: 'https://github.com/ultralytics/ultralytics.git',
        modelsSupported: ['YOLO11n', 'YOLO11s', 'YOLOv8n', 'YOLOv8m', 'YOLOv9c'],
        tracker: 'ByteTrack',
      },
    });
  });

  // 2. Formal Relational Database Schema metadata
  app.get('/api/schema', (req, res) => {
    res.json({
      success: true,
      schema: db.getSchema(),
    });
  });

  // 3. Realtime Cameras Endpoints
  app.get('/api/cameras', (req, res) => {
    const cameras = db.getCameras();
    res.json({
      success: true,
      total: cameras.length,
      data: cameras,
    });
  });

  app.post('/api/cameras', (req, res) => {
    const newCam = db.addCamera(req.body);
    res.status(201).json({ success: true, camera: newCam });
  });

  app.delete('/api/cameras/:id', (req, res) => {
    const deleted = db.deleteCamera(req.params.id);
    res.json({ success: deleted });
  });

  app.post('/api/cameras/reset', (req, res) => {
    const resetCams = db.resetCameras();
    res.json({ success: true, data: resetCams });
  });

  // 4. Realtime Detections Endpoints (Optical Sentry & YOLO Realtime Persistence)
  app.get('/api/detections', (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const cameraId = req.query.camera_id as string;
    const plateNumber = req.query.plate as string;
    const color = req.query.color as string;
    const objectType = req.query.type as string;

    const data = db.getDetections({
      limit,
      cameraId,
      plateNumber,
      color,
      objectType,
    });

    res.json({
      success: true,
      total: data.length,
      data,
    });
  });

  app.post('/api/detections', (req, res) => {
    const body = req.body;
    if (!body || !body.plate_number) {
      return res.status(400).json({ success: false, error: 'plate_number is required' });
    }

    const saved = db.insertDetection(body);
    console.log(`[Database] Inserted real-time detection ${saved.plate_number} (${saved.color} ${saved.object_type}) from ${saved.camera_id} via ${saved.ultralytics_model}`);
    res.status(201).json({ success: true, detection: saved });
  });

  // 5. Reconstructed Vehicle Trajectories dynamically computed from database records
  app.get('/api/trajectories', (req, res) => {
    const trajectories = db.getTrajectories();
    res.json({
      success: true,
      total: Object.keys(trajectories).length,
      data: trajectories,
    });
  });

  app.get('/api/trajectories/:plate', (req, res) => {
    const plate = req.params.plate.toUpperCase().trim();
    const trajectories = db.getTrajectories();
    const hit = trajectories[plate];
    if (!hit) {
      return res.status(404).json({ success: false, error: `Trajectory for plate ${plate} not found in database` });
    }
    res.json({ success: true, data: hit });
  });

  // 6. Dynamic Traffic Analytics generated in real time from database
  app.get('/api/analytics', (req, res) => {
    const analytics = db.getAnalytics();
    res.json({
      success: true,
      data: analytics,
    });
  });

  // 7. Backend Search Endpoint querying database with multi-attribute filtering
  app.get('/api/search', (req, res) => {
    const rawQ = (req.query.q as string || '').trim();
    const result = db.search(rawQ);
    const trajectories = db.getTrajectories();

    // Map matched plates to vehicle trajectory objects
    const matchedVehicles: any[] = [];
    const seenPlates = new Set<string>();

    for (const r of result.results) {
      if (r.plate_number && !seenPlates.has(r.plate_number) && trajectories[r.plate_number]) {
        seenPlates.add(r.plate_number);
        matchedVehicles.push(trajectories[r.plate_number]);
      }
    }

    res.json({
      success: true,
      query: rawQ,
      total: result.total,
      results: result.results,
      vehicles: matchedVehicles,
    });
  });

  // Vite middleware for development or Static files for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[StarTracker Sentry Backend] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
