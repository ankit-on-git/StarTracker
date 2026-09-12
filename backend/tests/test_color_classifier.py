import unittest
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.cv.color_classifier import color_classifier

try:
    import numpy as np
except ImportError:
    np = None


class TestColorClassifier(unittest.TestCase):
    def test_classify_red_image(self):
        if np is not None:
            red_patch = np.zeros((64, 64, 3), dtype=np.uint8)
            red_patch[:, :, 2] = 240
            color, conf = color_classifier.classify_vehicle_color(red_patch)
            self.assertEqual(color, "red")
            self.assertGreater(conf, 0.5)
        else:
            self.assertIsNotNone(color_classifier)

    def test_classify_blue_image(self):
        if np is not None:
            blue_patch = np.zeros((64, 64, 3), dtype=np.uint8)
            blue_patch[:, :, 0] = 240
            color, conf = color_classifier.classify_vehicle_color(blue_patch)
            self.assertEqual(color, "blue")
            self.assertGreater(conf, 0.5)

    def test_classify_white_image(self):
        if np is not None:
            white_patch = np.ones((64, 64, 3), dtype=np.uint8) * 250
            color, conf = color_classifier.classify_vehicle_color(white_patch)
            self.assertEqual(color, "white")
            self.assertGreater(conf, 0.5)

    def test_person_upper_body_clothing(self):
        if np is not None:
            person_img = np.zeros((100, 50, 3), dtype=np.uint8)
            person_img[20:55, :] = [240, 0, 0]
            color, conf = color_classifier.classify_clothing_color(person_img)
            self.assertEqual(color, "blue")
            self.assertGreater(conf, 0.5)


if __name__ == "__main__":
    unittest.main()


