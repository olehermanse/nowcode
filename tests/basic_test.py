import sys
import os

if os.path.exists("./nowcode_server/__init__.py"):
    sys.path.insert(0, "./")
elif os.path.exists("../nowcode_server/__init__.py"):
    sys.path.insert(0, "../")

import nowcode_server

def test_import():
    """Passes if the import above succeeded"""
    pass
