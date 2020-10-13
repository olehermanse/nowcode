const app = require("./app.js").app;

// Start server on port 80:
const port = 80;
app.listen(port, function () {
  console.log("nowcode server listening on port " + port);
});
