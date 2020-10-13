// This is identical to backend/server.js
// except we use port 3000 and can add dev only things

const app = require("./backend/app.js").app;

// Start server on port 3000:
const port = 3000;
app.listen(port, function () {
  console.log("nowcode dev-server listening on port" + port);
});