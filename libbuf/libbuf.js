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
      this.row === other.row &&
      this.column === other.column &&
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
  constructor(string, row, column, time = new Date().toISOString()) {
    super();
    this.time = time;
    this.command = "insert";
    this.string = string;
    this.row = row;
    this.column = column;
  }

  static from(data) {
    return new Insert(data.string, data.row, data.column, data.time);
  }

  apply(content) {
    const lines = this.string.split("\n");
    const row = this.row;
    const column = this.column;

    const before = content.slice(0, row);
    const affected = content[row];
    const extra = lines.slice(1);
    const after = content.slice(row + 1);

    const edited = affected.slice(0, column) + lines[0] + affected.slice(column);

    const result = before.concat(edited, extra, after);
    return result;
  }
}

class Remove extends Operation {
  constructor(string, row, column, time = new Date().toISOString()) {
    super();
    this.string = string;
    this.row = row;
    this.column = column;
    this.time = time;
    this.command = "remove";
  }

  static from(data) {
    return new Remove(data.string, data.row, data.column, data.time);
  }

  apply(content) {
    let to_remove = this.string.split("\n");
    const number_of_lines = to_remove.length - 1;
    const row = this.row;
    const column = this.column;

    const before = content.slice(0, row);

    let affected = content.slice(row, row + to_remove.length);

    if (affected.length > 2) {
      affected = [affected[0], affected[affected.length - 1]];
      to_remove = [to_remove[0], to_remove[to_remove.length - 1]];
    }
    affected[0] =
      affected[0].slice(0, column) +
      affected[0].slice(column + to_remove[0].length);
    if (affected.length === 2) {
      affected[1] = affected[1].slice(to_remove[1].length);
      affected = [affected[0] + affected[1]];
    }
    const rest = content.slice(row + number_of_lines + 1);

    return before.concat(affected, rest);
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
    return [""];
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
    let content = [""];
    for (const op of this.operations) {
      const before = JSON.stringify(content);
      content = op.apply(content);
    }
    return content;
  }

  render() {
    return this.lines().join("\n");
  }

  insert(data, row, column) {
    this.operations.push(new Insert(data, row, column));
    return this;
  }

  remove(data, row, column) {
    this.operations.push(new Remove(data, row, column));
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

    const first = this.operations[0].time;
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
    const duplicate = this.copy();
    for (const op of buffer.operations) {
      duplicate.maybeAddOperation(op.copy());
    }
    return duplicate;
  }
}

module.exports = {
  LineBuffer,
  Operation,
};
