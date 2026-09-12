import unittest
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.cv.plate_processor import plate_processor


class TestPlateProcessor(unittest.TestCase):
    def test_plate_cleaning(self):
        raw = "PB 10 - AB - 1234 "
        cleaned = plate_processor.clean_raw_text(raw)
        self.assertEqual(cleaned, "PB10AB1234")

    def test_plate_normalization_standard(self):
        raw = "PB10AB1234"
        normalized, conf = plate_processor.normalize_indian_plate(raw)
        self.assertEqual(normalized, "PB10AB1234")
        self.assertGreaterEqual(conf, 0.85)

    def test_plate_normalization_ocr_confusion(self):
        raw_with_errors = "P81OAB1234"
        normalized, conf = plate_processor.normalize_indian_plate(raw_with_errors)
        self.assertTrue(normalized.startswith("PB10"))

    def test_fuzzy_matching(self):
        target = "PB10AB1234"
        matched, score = plate_processor.match_plate_fuzzy("PB10AB1234", target)
        self.assertTrue(matched)
        self.assertEqual(score, 100.0)

        matched, score = plate_processor.match_plate_fuzzy("1234", target)
        self.assertTrue(matched)

        matched, score = plate_processor.match_plate_fuzzy("PB10AB1235", target, threshold=70.0)
        self.assertTrue(matched)


if __name__ == "__main__":
    unittest.main()

