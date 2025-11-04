// @deno-types="npm:@types/express@4.17.15"
import express from "npm:express@4.18.2";

import { LineBuffer, Operation } from "../libbuf/libbuf.ts";

const buffers = {};

function randomID() {
  return "" + Math.floor(Math.random() * 10000000);
}

const app = express();

app.get("/", (req, res) => {
  const new_id = randomID();
  console.log(`Redirecting '/' -> '/${new_id}' (302)`);
  res.redirect(302, "/" + new_id);
});

app.use(express.static("dist"));

app.get("/:id/", (req, res) => {
  res.sendFile("./index.html", { root: "dist" });
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

// Start server on port 3000:
const port = 3000;
app.listen(port, function () {
  console.log("nowcode server running: http://127.0.0.1:" + port);
});
