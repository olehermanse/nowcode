const express = require("express");
const app = express();

app.use(express.static("frontend/dist"));

app.get("/api/buffer/new", (req, res) => res.send({}));

module.exports = {
  app
};
