#!/usr/bin/env python3
"""Buffers and operations on buffers"""

__copyright__ = "Ole Herman Schumacher Elgesem"
__license__ = "MIT"

import json

class Operation:
    def __init__(self, seq, op, index=None, data=None, key=None):
        assert seq >= 0
        assert op in ["buffer", "insert", "remove"]
        assert index is None or index >= 0
        assert data is None or isinstance(data, str)

        self.seq = seq
        self.op = op
        self.index = index
        self.data = data
        self.key = key

    def apply(self, buf):
        seq, op, index, data = self.seq, self.op, self.index, self.data
        if op == "buffer":
            return data
        if op == "insert":
            return buf[0:index] + data + buf[index:]
        if (op == "remove"
            and buf[index:index + len(data)] == data):
            return buf[0:index] + buf[index + len(data):]
        return buf

    def to_dict(self):
        r = {}
        r["seq"] = self.seq
        r["op"] = self.op
        if self.index is not None:
            r["index"] = self.index
        if self.data is not None:
            r["data"] = self.data
        return r

    def to_json(self):
        return json.dumps(self.to_dict())

    @classmethod
    def from_dict(cls, container):
        seq = container["seq"]
        op = container["op"]
        index = container["index"] if "index" in container else None
        data = container["data"] if "data" in container else None
        return Operation(seq=seq, op=op, index=index, data=data)

    @classmethod
    def from_json(cls, json_string):
        return cls.from_dict(json.loads(json_string))

class Buffer:
    def __init__(self, key=""):
        self.history = []
        self.key = key

    def push(self, op):
        if isinstance(op, dict):
            op = Operation.from_dict(op)

        if isinstance(op, str):
            op = Operation.from_json(op)

        assert not isinstance(op, dict)
        assert not isinstance(op, str)
        assert type(op) is Operation
        attempted_seq = op.seq
        next_seq = self.history[-1].seq + 1 if self.history else 0
        if attempted_seq > next_seq:
            print("Client-side programming error - seq too high:")
            print("{}".format(op))
            return []
        op.seq = next_seq
        r = []
        send_back = 1
        for check in self.history[::-1]:
            if check.seq >= attempted_seq:
                send_back += 1
            else:
                break
        self.history.append(op)
        return self.history[-send_back:]

    def pop(self):
        return self.history.pop()

    def render(self, index=None):
        history = self.history
        if index is not None:
            history = history[0:index+1]
        content = ""
        for operation in history:
            content = operation.apply(content)
        return content

    def to_dict(self):
        r = {}
        r["key"] = self.key
        r["history"] = []
        for op in self.history:
            r["history"].append(op.to_dict())
        return r

    def to_json(self):
        return json.dumps(self.to_dict())

    @classmethod
    def from_dict(cls, container):
        buf = Buffer(container["key"])
        for op in container["history"]:
            buf.push(Operation.from_dict(op))
        return buf

    @classmethod
    def from_json(cls, json_string):
        return cls.from_dict(json.loads(json_string))
