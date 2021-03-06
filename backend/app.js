const express = require("express");
const app = express();

const LineBuffer = require("../libbuf/libbuf.js").LineBuffer;
const Operation = require("../libbuf/libbuf.js").Operation;

const buffers = {};

function randomID() {
  return "" + Math.floor(Math.random() * 10000000);
}

app.get("/", (req, res) => {
  const new_id = randomID();
  console.log(`Redirecting '/' -> '/${new_id}' (302)`);
  res.redirect(302, "/" + new_id);
});

app.use(express.static("frontend/dist"));

app.get("/:id/", (req, res) => {
  res.sendFile("./index.html", { root: "frontend/dist" });
});

app.use(express.json());

app.get("/api/buffers/:id", (req, res) => {
  const id = req.params.id;
  if (!(id in buffers)) {
    buffers[id] = new LineBuffer();
    buffers[id].insert("Hello, world!", 0, 0);
  }
  res.send(buffers[id]);
});

app.post("/api/buffers/:id", (req, res) => {
  const id = req.params.id;
  if (!(id in buffers)) {
    buffers[id] = new LineBuffer();
  }
  const operation = Operation.from(req.body);
  buffers[id].maybeAddOperation(operation);
  res.send("POST response");
});

module.exports = {
  app,
};
