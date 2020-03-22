const express = require("express");
const app = express();

const LineBuffer = require("../libbuf/libbuf.js").LineBuffer;

let buffer = new LineBuffer();
buffer.insert("hello, world!");

app.use(express.static("frontend/dist"));

app.get("/api/buffer/new", (req, res) => res.send(buffer));

module.exports = {
  app
};
