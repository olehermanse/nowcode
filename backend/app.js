const express = require("express");
const app = express();

const LineBuffer = require("../libbuf/libbuf.js").LineBuffer;

let buffer = new LineBuffer();
buffer.insert("hello, world!");

function randomID(){
  return "" + Math.floor(Math.random() * 10000000);
}

app.get("/", (req, res) => res.redirect(301, "/" + randomID()));

app.get("/:id/", (req, res) => {
    res.sendFile('./index.html', { root: "frontend/dist" });
});

app.use(express.static("frontend/dist"));

app.get("/api/buffers", (req, res) => res.send(buffer));

module.exports = {
  app
};
