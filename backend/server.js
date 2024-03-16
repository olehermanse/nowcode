const app = require("./app.js").app;

// Start server on port 3000:
const port = 3000;
app.listen(port, function () {
  console.log("nowcode server listening on port " + port);
});
