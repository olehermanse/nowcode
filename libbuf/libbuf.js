// This class exists just to pick the correct operation class,
// when receiving operations (JSON) from remote clients/server
// it is a class and not a function for consistency, the API matches
// the other classes; Operation.from({}), Insert.from({}) etc.
class Operation {
  static from(data) {
    switch (data.command) {
      case "content":
        return Content.from(data);
      case "insert":
        return Insert.from(data);
      case "remove":
        return Remove.from(data);
      default:
        throw "Unkown operation: " + data.command;
    }
  }

  copy() {
    return Operation.from(this);
  }

  identical(other) {
    return (
      this.time === other.time &&
      this.command === other.command &&
      this.pos === other.pos &&
      this.string === other.string
    );
  }

  before(other) {
    return new Date(this.time) < new Date(other.time);
  }

  after(other) {
    return new Date(this.time) > new Date(other.time);
  }

  json() {
    return JSON.stringify(this);
  }
}

class Insert extends Operation {
  constructor(string, pos, time = new Date().toISOString()) {
    super();
    this.time = time;
    this.command = "insert";
    this.string = string;
    this.pos = pos;
  }

  static from(data) {
    return new Insert(data.string, data.pos, data.time);
  }

  apply(content) {
    let pos = this.pos;
    if (pos < 0) {
      pos = content.length + 1 + pos;
    }
    return content.slice(0, pos) + this.string + content.slice(pos);
  }
}

class Remove extends Operation {
  constructor(string, pos, time = new Date().toISOString()) {
    super();
    this.string = string;
    this.pos = pos;
    this.time = time;
    this.command = "remove";
  }

  static from(data) {
    return new Remove(data.string, data.pos, data.time);
  }

  apply(content) {
    let pos = this.pos;
    let length = this.string.length;
    if (pos < 0) {
      pos = content.length + pos;
    }

    if (pos + length > content.length) {
      // No-op: attempted to delete something too long
      return content;
    }

    let match_string = content.slice(pos, pos + length);

    if (match_string != this.string) {
      // No-op: attempted to delete string which is not there
      return content;
    }

    return content.slice(0, pos) + content.slice(pos + length);
  }
}

class Content extends Operation {
  constructor(string, time = new Date().toISOString()) {
    super();
    this.time = time;
    this.command = "content";
    this.string = string;
  }

  static from(data) {
    return new Content(data.string, data.time);
  }

  apply(content) {
    return this.string;
  }
}

class LineBuffer {
  constructor(name = null, operations = [new Content("")], string = null) {
    this.name = name;
    this.operations = operations.map(Operation.from);
    if (string != null) {
      this.operations.push(new Content(string));
    }
  }

  static from(data) {
    return new LineBuffer(data.name, data.operations);
  }

  copy() {
    return LineBuffer.from(this);
  }

  json() {
    return JSON.stringify(this);
  }

  lines() {
    let content = "";
    for (let op of this.operations) {
      content = op.apply(content);
    }
    return content.split("\n");
  }

  render() {
    return this.lines().join("\n");
  }

  insert(data, pos) {
    this.operations.push(new Insert(data, pos));
    return this;
  }

  remove(data, pos) {
    this.operations.push(new Remove(data, pos));
    return this;
  }

  maybeAddOperation(op) {
    if (op.command === "content") {
      return;
    }

    for (let check of this.operations) {
      if (op.identical(check)) {
        return;
      }
    }

    const length = this.operations.length;

    // Assume at least one operation in this,
    // all LineBuffers start with one Content operation
    console.assert(length > 0);

    let first = this.operations[0].time;
    if (op.before(first)) {
      return;
    }

    let i = this.operations.length - 1;

    while (i > 0 && op.before(this.operations[i])) {
      --i;
    }

    this.operations.splice(i + 1, 0, op);
  }

  merge(buffer) {
    let duplicate = this.copy();
    for (let op of buffer.operations) {
      duplicate.maybeAddOperation(op.copy());
    }
    return duplicate;
  }
}

module.exports = {
  LineBuffer,
  Operation,
};
