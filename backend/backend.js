const app = require("./app.js").app;

const port = 80;
// Serve the files on port 80.
app.listen(port, function () {
  console.log("Example app listening on port 80!\n");
});
