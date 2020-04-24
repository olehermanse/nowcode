// This is identical to backend/backend.js
// except we can add dev only things here, like webpack middleware

const app = require("./backend/app.js").app;

// Serve the files on port 3000.
app.listen(3000, function () {
  console.log("Example app listening on port 3000!\n");
});
