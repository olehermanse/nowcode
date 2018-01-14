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
      var status = xhr.status;
      if (status === 200
          && window.hasChangedSinceGet == false
          && window.editor.getValue() ) {
        const cursorPos = window.editor.getCursorPosition();
        window.editor.setValue(xhr.response["content"]);
        window.editor.clearSelection();
        window.editor.moveCursorToPosition(cursorPos);
      } else {
        console.log('Failed synchronization');
      }
      setTimeout(synchronize, 150);
    };
  xhr.send();
  window.hasChangedSinceGet = false;
}
synchronize();
window.hasChangedSinceGet = false;

window.editor.on('change', () => {
  window.hasChangedSinceGet = true;
  updateServer();
});

