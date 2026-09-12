# StarTracker AI Models

This directory holds the lightweight local weights and configurations for StarTracker's Computer Vision pipeline.

## Model Selection Rationale for SIH (Student Laptop Compatible)

1. **YOLOv8n (Nano)**:
   - File: `yolov8n.pt` (~6.2 MB)
   - Reason: Standard COCO-trained model capable of 35-45 FPS on standard Intel Core i5/i7 laptop CPU without dedicated GPU.
   - Detects: Vehicles (`car`, `motorcycle`, `bus`, `truck`) and `person`.

2. **PaddleOCR (PP-OCRv4 Mobile)**:
   - Language: English (`lang='en'`)
   - Detection model: `ch_PP-OCRv4_det_infer` (~4.7 MB)
   - Recognition model: `ch_PP-OCRv4_rec_infer` (~12 MB)
   - Direction Classifier: `ch_ppocr_mobile_v2.0_cls_infer` (~1.5 MB)
   - Reason: State-of-the-art accuracy on low-resolution, slanted, and partially occluded Indian High Security Registration Plates (HSRP).

3. **Lightweight HSV Color Classifier**:
   - Algorithmic, explainable rule engine.
   - Zero memory footprint, 120+ FPS throughput.
