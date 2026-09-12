"""
StarTracker - Standalone ANPR & Attribute Pipeline Reference
SIH26127: Core Computer Vision Execution Logic
"""

import os
import sys

# Reference to the production backend CV pipeline
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../backend")))

from app.cv.pipeline import cv_pipeline
from app.cv.plate_processor import plate_processor
from app.cv.color_classifier import color_classifier
from app.cv.detector import detector

__all__ = ["cv_pipeline", "plate_processor", "color_classifier", "detector"]
