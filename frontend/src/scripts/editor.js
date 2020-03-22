require('../../../node_modules/ace-builds/src-min-noconflict/ace.js');

window.editor = ace.edit('editor');

const pathname = window.location.pathname;
const bufferID = pathname.substr(1, pathname.length -1);

const apiURL = '/api/buffers/' + bufferID;
window.POSTinProgress = false;

window.currentSyncTime = 0;
window.currentEditorData = '';

var enableAndFocusEditor = function() {
    if (editor) {
      editor.focus();
      var session = editor.getSession();
      //Get the number of lines
      var count = session.getLength();
      //Go to end of the last line
      editor.gotoLine(count, session.getLine(count-1).length);
      editor.setReadOnly(false);
    }
  };


function synchronize() {
  if(POSTinProgress){
    return;
  }
  let xhr = new XMLHttpRequest();
  xhr.open('GET', apiURL, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      const status = xhr.status;

      if (status === 200) {
        const cursorPos = window.editor.getCursorPosition();
        const content = xhr.response['content'];
        const sync = parseInt(xhr.response['sync_time']);
        if (sync <= currentSyncTime) {
          return; // Outdated GET data, do nothing, wait for next
        }
        window.currentEditorData = content;
        window.editor.setValue(content);
        window.editor.clearSelection();
        window.editor.moveCursorToPosition(cursorPos);
        window.currentSyncTime = sync;

      } else if (status !== 200) {
        console.log('Failed synchronization');
      }
    };
  xhr.send();
}

function updateServer() {

  window.POSTinProgress = true;
  const xhr = new XMLHttpRequest();
  const content = window.editor.getValue();

  xhr.open("POST", apiURL, true);
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const response = JSON.parse(xhr.responseText);
      window.currentSyncTime = response["sync_time"];
    }
    console.log("POST NOT IN PROGRESS ANYMORE")
    window.POSTinProgress = false;
  };
  const data = JSON.stringify({
    "content": content,
    "buffer_id": bufferID,
    "sync_time": window.currentSyncTime
  });
  xhr.send(data);
}

setInterval(() => {synchronize()}, 150);

window.editor.on('change', () => {
  if (window.POSTinProgress){
    console.log("POST IN PROGRESS");
    return;
  }

  // setValue triggers change event, this way we prevent it from making another update to the server. Creating a loop.
  if(window.editor.currentEditorData === window.editor.getValue()){
    return;
  }

  updateServer();
});


enableAndFocusEditor();
