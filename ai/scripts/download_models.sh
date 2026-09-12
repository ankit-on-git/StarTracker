#!/usr/bin/env bash
# StarTracker: Model Download Script for Student Workstations

set -e

MODELS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../models" && pwd)"
mkdir -p "$MODELS_DIR"

echo "=== StarTracker AI Model Downloader ==="
echo "Target directory: $MODELS_DIR"

# 1. Download YOLOv8 Nano model (~6MB)
if [ ! -f "$MODELS_DIR/yolov8n.pt" ]; then
    echo "[*] Downloading YOLOv8n weights..."
    curl -L -o "$MODELS_DIR/yolov8n.pt" "https://github.com/ultralytics/assets/releases/download/v8.1.0/yolov8n.pt" || echo "Note: Ultralytics will auto-download on first run if curl is restricted."
else
    echo "[✓] yolov8n.pt already present."
fi

echo "=== Model preparation complete ==="
