#!/usr/bin/env python3
"""Nowcode server sessions"""

__copyright__ = "Ole Herman Schumacher Elgesem"
__license__ = "MIT"

from nowcode_server.core import Buffer

class Core:
    def __init__(self):
        self.buffers = {}

    def push(self, key, operation):
        if not self.exists(key):
            self.buffers[key] = Buffer(key)
        return self.buffers[key].push(operation)

    def exists(self, key):
        return key in self.buffers
