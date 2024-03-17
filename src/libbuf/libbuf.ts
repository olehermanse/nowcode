// This class exists just to pick the correct operation class,
// when receiving operations (JSON) from remote clients/server
// it is a class and not a function for consistency, the API matches
// the other classes; Operation.from({}), Insert.from({}) etc.
export class Operation {
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

function multiline_insert(inserted, affected, column) {
  // Insert an array of 2 or more lines (inserted),
  // into the affected line (a string),
  // at given index, column (0-indexed).
  // Returns the resulting array of lines, at least 2 strings.

  // The first and last lines are a combination of affected and inserted:
  // (What was there before and what we are inserting)
  const first = affected.slice(0, column) + inserted[0];
  const last = inserted[inserted.length - 1] + affected.slice(column);
  // (Both first and last must be strings but can be empty strings)

  // extra has all the lines between first and last, if any:
  const extra = inserted.slice(1, inserted.length - 1);
  console.assert(
    extra.length === inserted.length - 2,
    "Since we have removed first and last elements, extra should be 2 shorter",
  );
  // (Can be empty array)

  // Result is an array of 2 or more strings:
  return [first, ...extra, last];
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
    const inserted = this.string.split("\n"); // Lines to insert into content
    const row = this.row;
    const column = this.column;

    const before = content.slice(0, row);
    const affected = content[row];
    const after = content.slice(row + 1);

    // Combine affected line and lines to insert:
    const edited = [];
    if (inserted.length === 1) {
      // Easy case, we are not inserting any newlines,
      // so we just insert the string somewhere in the affected line:
      edited.push(
        affected.slice(0, column) + inserted[0] + affected.slice(column),
      );
    } else {
      // We are inserting more than 1 line, i.e. at least one newline:
      edited.push(...multiline_insert(inserted, affected, column));
    }

    return [...before, ...edited, ...after];
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
    affected[0] = affected[0].slice(0, column) +
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

export class LineBuffer {
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
