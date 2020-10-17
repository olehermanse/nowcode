const LineBuffer = require("../libbuf/libbuf.js").LineBuffer;

var assert = require("assert");
describe("LineBuffer", function () {
  it("Can be rendered after JSON conversion", function () {
    let buf = new LineBuffer().insert("cd", 0, 0).insert("ab", 0, 0);
    let string = JSON.stringify(buf);
    let data = JSON.parse(string);
    let newBuffer = LineBuffer.from(data);
    assert.strictEqual(newBuffer.render(), "abcd");
  });
  it("Can be merged with another buffer", function () {
    let start = JSON.stringify(new LineBuffer());
    let one = new LineBuffer(JSON.parse(start)).insert("cd", 0, 0);
    assert.strictEqual(one.render(), "cd");
    let two = new LineBuffer(JSON.parse(start)).insert("ab", 0, 0);
    assert.strictEqual(two.render(), "ab");
    one = one.merge(two);
    assert.strictEqual(one.render(), "abcd");
  });
  describe("#render()", function () {
    it("Renders a new empty buffer", function () {
      assert.strictEqual(new LineBuffer().render(), "");
    });
  });
  describe("#insert()", function () {
    it("Allows you to insert a character", function () {
      assert.strictEqual(new LineBuffer().insert("a", 0, 0).render(), "a");
    });
    it("Allows you to insert a word", function () {
      assert.strictEqual(new LineBuffer().insert("hello", 0, 0).render(), "hello");
    });
    it("Allows you to insert multiple times", function () {
      assert.strictEqual(
        new LineBuffer().insert("a", 0).insert("b", 0, 1).insert("c", 0, 2).render(),
        "abc"
      );
    });
    it("Allows you to insert a newline at beginning of buffer", function () {
      assert.strictEqual(
        new LineBuffer()
          .insert("hello, world\n", 0, 0)
          .insert("abc\ndef", 0, 0)
          .render(),
        "abc\ndefhello, world\n"
      );
    });
    it("Correctly splits lines when you insert newlines", function () {
      assert.deepStrictEqual(
        new LineBuffer()
          .insert("a\ndef", 0, 0)
          .insert("b\nc\n\n", 0, 1)
          .lines(),
        ["ab", "c", "", "", "def"]
      );
    });
  });
  describe("#remove()", function () {
    it("Allows you to remove a character", function () {
      assert.strictEqual(new LineBuffer().insert("a", 0, 0).remove("a", 0, 0).render(), "");
    });
    it("Allows you to remove a word", function () {
      assert.strictEqual(
        new LineBuffer().insert("hello world", 0, 0).remove("hello ", 0, 0).render(),
        "world"
      );
    });
    it("Allows you to remove a multi line buffer", function () {
      assert.strictEqual(
        new LineBuffer()
          .insert("hello\nworld\n", 0, 0)
          .remove("hello\nworld\n", 0, 0)
          .render(),
        ""
      );
    });
    it("Allows you to remove a newline", function () {
      assert.strictEqual(
        new LineBuffer().insert("\n", 0, 0).remove("\n", 0, 0).render(),
        ""
      );
    });
  });
});
