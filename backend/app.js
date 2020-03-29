const express = require("express");
const app = express();

const LineBuffer = require("../libbuf/libbuf.js").LineBuffer;

let buffers = {};

buffers.one = new LineBuffer();
buffers.one.insert("Buffer one");
buffers.two = new LineBuffer();
buffers.two.insert("Buffer two");

function randomID(){
  return "" + Math.floor(Math.random() * 10000000);
}

app.get("/", (req, res) => res.redirect(301, "/" + randomID()));

app.get("/:id/", (req, res) => {
    res.sendFile('./index.html', { root: "frontend/dist" });
});

app.use(express.static("frontend/dist"));

app.get("/api/buffers/:id", (req, res) => {
  let id = req.params.id;
  if (!(id in buffers))
  {
    buffers[id] = new LineBuffer();
    buffers[id].insert("Hello, world!");
  }
  res.send(buffers[id]);
});

module.exports = {
  app
};
