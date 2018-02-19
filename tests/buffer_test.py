from nowcode_server.core import Buffer, Operation

def test_buffer():
    b = Buffer()
    assert b.render() == ""
    b.push(Operation(seq=0, op="buffer", data="Hello"))
    b.push(Operation(seq=1, op="remove", index=0, data="H"))
    b.push(Operation(seq=2, op="remove", index=0, data="H"))
    b.push(Operation(seq=3, op="insert", index=0, data="J"))
    assert b.render() == "Jello"
    b.push(Operation(seq=4, op="remove", index=4, data="o"))
    b.push(Operation(seq=5, op="insert", index=4, data="y"))
    assert b.render() == "Jelly"
    b.push(Operation(seq=6, op="buffer",  data="New buffer\n;! "))
    assert b.render() == "New buffer\n;! "
    assert b.render(3) == "Jello"
    popped = b.pop()
    assert popped.op == "buffer"
    assert b.render() == "Jelly"
    assert b.render(3) == "Jello"

    b = b.to_json()
    assert type(b) is str
    b = Buffer.from_json(b)
    assert popped.op == "buffer"
    assert b.render() == "Jelly"
    assert b.render(3) == "Jello"

def test_buffer_json():
    b = Buffer()
    assert b.render() == ""
    b.push(Operation(seq=0, op="buffer", data="Hello").to_json())
    b.push(Operation(seq=1, op="remove", index=0, data="H").to_dict())
    b.push(Operation(seq=2, op="insert", index=0, data="J").to_dict())
    assert b.render() == "Jello"
    b.push(Operation(seq=3, op="remove", index=4, data="o"))
    b.push(Operation(seq=4, op="insert", index=4, data="y"))
    assert b.render() == "Jelly"
    b.push(Operation(seq=5, op="buffer",  data="New buffer\n;! "))
    assert b.render() == "New buffer\n;! "
    assert b.render(2) == "Jello"
    popped = b.pop()
    assert popped.op == "buffer"
    assert b.render() == "Jelly"
    assert b.render(2) == "Jello"

    b = b.to_json()
    assert type(b) is str
    b = Buffer.from_json(b)
    assert popped.op == "buffer"
    assert b.render() == "Jelly"
    assert b.render(2) == "Jello"

def test_buffer_seq():
    b = Buffer()
    l = b.push(Operation(seq=10, op="buffer", data="Malicious"))
    assert not l
    assert l == []
    assert b.render() == ""
    assert len(b.push(Operation(seq=0, op="buffer", data="Hello"))) == 1
    assert len(b.push(Operation(seq=1, op="remove", index=0, data="H"))) == 1
    assert len(b.push(Operation(seq=2, op="remove", index=0, data="H"))) == 1
    assert len(b.push(Operation(seq=3, op="insert", index=0, data="J"))) == 1
    assert len(b.push(Operation(seq=3, op="buffer", data="Overwrite"))) == 2

def test_operation():
    weird_buffer = "Weird \n File !\"#$%&/()=;:_"
    o = Operation(seq=0, op="buffer", data=weird_buffer)
    s = o.to_json()
    assert type(s) is str
    p = Operation.from_json(s)
    assert p.seq == 0
    assert p.op == "buffer"
    assert p.data == weird_buffer
