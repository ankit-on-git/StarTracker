#!/usr/bin/env python3
"""
StarTracker - Video Processing CLI Utility
SIH26127: Offline CCTV Video Ingestion & Event Extraction

Usage:
    python process_video.py --video sample_data/videos/corridor_sample.mp4 --camera-id CAM-01 --skip 3
"""

import sys
import os
import argparse
import json

# Add parent directory to Python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.services.video_processor import video_processor


def main():
    parser = argparse.ArgumentParser(
        description="StarTracker: Process CCTV video for vehicle/person detection, ANPR, and event generation."
    )
    parser.add_argument("--video", type=str, required=True, help="Path to the video file (.mp4, .avi, etc.)")
    parser.add_argument("--camera-id", type=str, required=True, help="Registered Camera ID (e.g., CAM-01)")
    parser.add_argument("--skip", type=int, default=3, help="Process every Nth frame (default: 3)")
    parser.add_argument("--output-json", type=str, default=None, help="Optional path to save JSON extraction summary")

    args = parser.parse_args()

    print("===================================================================")
    print("  StarTracker AI Engine - Video Ingestion Pipeline (SIH26127)")
    print("===================================================================")
    print(f"[*] Target Video : {args.video}")
    print(f"[*] Camera ID    : {args.camera_id}")
    print(f"[*] Frame Skip   : {args.skip} (1 frame per {args.skip})")
    print("-------------------------------------------------------------------")
    print("[*] Starting OpenCV frame extraction & CV pipeline...")

    result = video_processor.process_video_file(
        video_path=args.video,
        camera_id=args.camera_id,
        frame_skip=args.skip
    )

    print("\n[+] Processing Completed Successfully!")
    print(f"    - Frames Analyzed      : {result.get('frames_processed', 0)}")
    print(f"    - Detections Generated : {result.get('detections_created', 0)}")
    print(f"    - Vehicles Cataloged   : {result.get('vehicles_identified', 0)}")
    print(f"    - Persons Cataloged    : {result.get('persons_identified', 0)}")
    print("-------------------------------------------------------------------")

    if args.output_json:
        with open(args.output_json, "w") as f:
            json.dump(result, f, indent=2)
        print(f"[+] Output report written to: {args.output_json}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
