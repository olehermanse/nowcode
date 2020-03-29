const LineBuffer = require("../libbuf/libbuf.js").LineBuffer;

var assert = require("assert");
describe("LineBuffer", function() {
  it("Can be rendered after JSON conversion", function() {
    let buf = new LineBuffer().insert("cd", 0).insert("ab", -3);
    let string = JSON.stringify(buf);
    let data = JSON.parse(string);
    let newBuffer = LineBuffer.from(data);
    assert.equal(newBuffer.render(), "abcd");
  });
  it("Can be merged with another buffer", function() {
    let start = JSON.stringify(new LineBuffer());
    let one = new LineBuffer(JSON.parse(start)).insert("cd", 0).insert("ab", 0);
    assert.equal(one.render(), "abcd");
    let two = new LineBuffer(JSON.parse(start)).insert("ef", -1);
    assert.equal(two.render(), "ef");
    one = one.merge(two);
    assert.equal(one.render(), "abcdef");
  });
  describe("#render()", function() {
    it("Renders a new empty buffer", function() {
      assert.equal(new LineBuffer().render(), "");
    });
  });
  describe("#insert()", function() {
    it("Allows you to insert a character", function() {
      assert.equal(new LineBuffer().insert("a", 0).render(), "a");
    });
    it("Allows you to insert a word", function() {
      assert.equal(new LineBuffer().insert("hello", 0).render(), "hello");
    });
    it("Allows you to insert multiple times", function() {
      assert.equal(
        new LineBuffer()
          .insert("a", 0)
          .insert("b", 1)
          .insert("c", 2)
          .render(),
        "abc"
      );
    });
    it("Allows you to append using negative index (-1)", function() {
      assert.equal(
        new LineBuffer()
          .insert("hello, ", 0)
          .insert("world", -1)
          .render(),
        "hello, world"
      );
    });
    it("Allows you to insert using negative index (-2)", function() {
      assert.equal(
        new LineBuffer()
          .insert("ad", 0)
          .insert("bc", -2)
          .render(),
        "abcd"
      );
    });
    it("Allows you to prepend using negative index (-3)", function() {
      assert.equal(
        new LineBuffer()
          .insert("cd", 0)
          .insert("ab", -3)
          .render(),
        "abcd"
      );
    });
  });
  describe("#delete()", function() {
    it("Allows you to delete a character", function() {
      assert.equal(
        new LineBuffer()
          .insert("a", 0)
          .delete("a", 0)
          .render(),
        ""
      );
    });
    it("Allows you to delete a word", function() {
      assert.equal(
        new LineBuffer()
          .insert("hello world", 0)
          .delete("hello ", 0)
          .render(),
        "world"
      );
    });
    it("Allows you to delete a multi line buffer", function() {
      assert.equal(
        new LineBuffer()
          .insert("hello\nworld\n", 0)
          .delete("hello\nworld\n", 0)
          .render(),
        ""
      );
    });
    it("Allows you to delete a newline", function() {
      assert.equal(
        new LineBuffer()
          .insert("hello\nworld", 0)
          .delete("\n", 5)
          .render(),
        "helloworld"
      );
    });
    it("Allows you to delete using negative index (-1)", function() {
      assert.equal(
        new LineBuffer()
          .insert("abcd", 0)
          .delete("d", -1)
          .delete("c", -1)
          .render(),
        "ab"
      );
    });
    it("Is skipped if it doesn't apply", function() {
      assert.equal(
        new LineBuffer()
          .insert("aaaa", 0)
          .delete("A", 0)
          .delete("b", 0)
          .render(),
        "aaaa"
      );
    });
    it("Doesn't delete past end", function() {
      assert.equal(
        new LineBuffer()
          .insert("aaaa", 0)
          .delete("aa", -1) // Skip - there is only 1 'a' before end
          .render(),
        "aaaa"
      );
    });
  });
});
