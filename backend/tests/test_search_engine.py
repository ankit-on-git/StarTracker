import unittest
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.search_engine import search_engine


class TestSearchEngine(unittest.TestCase):
    def test_parse_plate_query(self):
        query = "PB10AB1234"
        parsed = search_engine.parse_query(query)
        self.assertEqual(parsed["type"], "plate")
        self.assertEqual(parsed["plate_candidate"], "PB10AB1234")

    def test_parse_vehicle_attribute_query(self):
        query = "red car"
        parsed = search_engine.parse_query(query)
        self.assertEqual(parsed["type"], "vehicle_attribute")
        self.assertEqual(parsed["color"], "red")
        self.assertEqual(parsed["vehicle_type"], "car")

    def test_parse_person_attribute_query(self):
        query = "person wearing blue"
        parsed = search_engine.parse_query(query)
        self.assertEqual(parsed["type"], "person_attribute")
        self.assertEqual(parsed["color"], "blue")

    def test_execute_plate_search(self):
        results = search_engine.execute_search("PB10AB1234")
        self.assertEqual(results["query_type"], "plate")
        self.assertGreaterEqual(results["total_results"], 1)
        self.assertEqual(results["vehicles"][0]["vehicle"]["plate_number"], "PB10AB1234")
        self.assertGreaterEqual(len(results["vehicles"][0]["events"]), 1)

    def test_execute_clothing_search(self):
        results = search_engine.execute_search("person wearing blue")
        self.assertEqual(results["query_type"], "person_attribute")
        self.assertGreaterEqual(results["total_results"], 1)
        self.assertEqual(results["persons"][0]["clothing_color"], "blue")


if __name__ == "__main__":
    unittest.main()

