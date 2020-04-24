require("../../../node_modules/ace-builds/src-min-noconflict/ace.js");
const LineBuffer = require("../../../libbuf/libbuf.js").LineBuffer;

let buffer = new LineBuffer();
let serverBuffer = null;
let disableChangeEvent = false;

window.editor = ace.edit("editor");

const pathname = window.location.pathname;
const bufferID = pathname.substr(1, pathname.length - 1);

const apiURL = "/api/buffers/" + bufferID;
window.POSTinProgress = false;

window.currentSyncTime = 0;
window.currentEditorData = "";

var enableAndFocusEditor = function () {
  if (editor) {
    editor.focus();
    var session = editor.getSession();
    //Get the number of lines
    var count = session.getLength();
    //Go to end of the last line
    editor.gotoLine(count, session.getLine(count - 1).length);
    editor.setReadOnly(false);
  }
};

function synchronize() {
  let xhr = new XMLHttpRequest();
  xhr.open("GET", apiURL, true);
  xhr.responseType = "json";
  xhr.onload = function () {
    const status = xhr.status;

    if (status === 200) {
      const cursorPos = window.editor.getCursorPosition();
      serverBuffer = LineBuffer.from(xhr.response);
      buffer = serverBuffer.merge(buffer);

      const content = buffer.render();
      disableChangeEvent = true;
      window.editor.setValue(content);
      disableChangeEvent = false;
      window.editor.clearSelection();
      window.editor.moveCursorToPosition(cursorPos);
    } else if (status !== 200) {
      console.log("Failed synchronization");
    }
  };
  xhr.send();
}

function userEdit(e) {
  if (e.action === "insert") {
    console.log(e);
    let string = e.lines.join("\n");
    buffer.insert(string, e.start.row, e.start.column);
  } else if (e.action === "remove") {
    console.log(e);
    let string = e.lines.join("\n");
    buffer.remove(string, e.start.row, e.start.column);
  } else {
    return;
  }
  let operation = buffer.operations[buffer.operations.length - 1];
  console.log(operation);

  const xhr = new XMLHttpRequest();
  const content = window.editor.getValue();

  xhr.open("POST", apiURL, true);
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.onreadystatechange = () => {
    console.log("POST complete: " + xhr.status + ", " + xhr.responseText);
  };
  xhr.send(operation.json());
}

setInterval(() => {
  synchronize();
}, 150);

window.editor.on("change", (e) => {
  if (disableChangeEvent) {
    return;
  }

  userEdit(e);
});

enableAndFocusEditor();
