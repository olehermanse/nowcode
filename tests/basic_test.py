import sys
import os

if os.path.exists("./server.py"):
    sys.path.insert(0, "./")
elif os.path.exists("../server.py"):
    sys.path.insert(0, "../")

import server

def test_import():
    """Passes if the import above succeeded"""
    pass
