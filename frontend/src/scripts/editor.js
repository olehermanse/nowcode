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

const enableAndFocusEditor = function () {
  if (editor) {
    editor.focus();
    const session = editor.getSession();
    //Get the number of lines
    const count = session.getLength();
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

    if (status !== 200) {
      console.log("Failed synchronization");
      return;
    }

    const cursorPos = window.editor.getCursorPosition();
    serverBuffer = LineBuffer.from(xhr.response);
    buffer = serverBuffer.merge(buffer);

    const content = buffer.render();
    disableChangeEvent = true;
    window.editor.setValue(content);
    disableChangeEvent = false;
    window.editor.clearSelection();
    window.editor.moveCursorToPosition(cursorPos);
  };
  xhr.send();
}

function userEdit(e) {
  if (e.action === "insert") {
    const string = e.lines.join("\n");
    buffer.insert(string, e.start.row, e.start.column);
  } else if (e.action === "remove") {
    const string = e.lines.join("\n");
    buffer.remove(string, e.start.row, e.start.column);
  } else {
    return;
  }
  let operation = buffer.operations[buffer.operations.length - 1];

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
