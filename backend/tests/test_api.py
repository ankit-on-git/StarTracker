import unittest
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.supabase_client import db
from app.services.search_engine import search_engine

try:
    from app.api.routes import health_check, list_cameras, universal_search, get_basic_analytics
    HAS_FASTAPI = True
except ImportError:
    HAS_FASTAPI = False


class TestAPI(unittest.TestCase):
    def test_health_check_endpoint(self):
        if HAS_FASTAPI:
            res = health_check()
            self.assertEqual(res["status"], "healthy")
            self.assertGreater(res["active_cameras"], 0)
        else:
            self.assertGreater(len(db.get_cameras()), 0)

    def test_list_cameras_endpoint(self):
        if HAS_FASTAPI:
            cams = list_cameras()
            self.assertGreaterEqual(len(cams), 5)
            self.assertEqual(cams[0]["id"], "CAM-01")
        else:
            cams = db.get_cameras()
            self.assertGreaterEqual(len(cams), 5)
            self.assertEqual(cams[0]["id"], "CAM-01")

    def test_universal_search_endpoint(self):
        if HAS_FASTAPI:
            res = universal_search("PB10AB1234")
            self.assertEqual(res["query_type"], "plate")
            self.assertGreaterEqual(len(res["vehicles"]), 1)
        else:
            res = search_engine.execute_search("PB10AB1234")
            self.assertEqual(res["query_type"], "plate")
            self.assertGreaterEqual(len(res["vehicles"]), 1)

    def test_analytics_basic_endpoint(self):
        if HAS_FASTAPI:
            res = get_basic_analytics()
            self.assertGreater(res["active_cameras"], 0)
            self.assertGreater(len(res["hourly_traffic"]), 0)
        else:
            self.assertGreater(len(db.get_cameras()), 0)


if __name__ == "__main__":
    unittest.main()


