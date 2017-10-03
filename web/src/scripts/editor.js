require('../../node_modules/ace-builds/src-min-noconflict/ace.js');

window.editor = ace.edit('editor');

const pathname = window.location.pathname;
const bufferID = pathname.substr(1, pathname.length -1);
const apiURL = '/api/buffers/' + bufferID;
window.currentEditorData = '';

function updateServer() {
  const xhr = new XMLHttpRequest();
  const content = window.editor.getValue();

  xhr.open("POST", apiURL, true);
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const response = JSON.parse(xhr.responseText);
    }
  };
  const data = JSON.stringify({
    "content": content,
    "buffer_id": bufferID,
  });
  xhr.send(data);
}

function synchronize() {
  let xhr = new XMLHttpRequest();
  xhr.open('GET', apiURL, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      const status = xhr.status;
      console.log("editor.getValue: " + window.editor.getValue());
      console.log("currentEditorData" + window.currentEditorData);

      if (status === 200) {
        console.log("Synchronization successful");
        const cursorPos = window.editor.getCursorPosition();
        const content = xhr.response['content'];
        window.currentEditorData = content;
        window.editor.setValue(content);
        window.editor.clearSelection();
        window.editor.moveCursorToPosition(cursorPos);

      } else if (status !== 200) {
        console.log('Failed synchronization');
      }
      setTimeout(synchronize, 3000);
    };
  xhr.send();
}
synchronize();

window.editor.on('change', () => {
  // setValue triggers change event, this way we prevent it from making another update to the server. Creating a loop.
  if(window.editor.currentEditorData === window.editor.getValue()){
    return;
  }

  updateServer();
});

