(function(){
  let aceEditor = require('../../node_modules/ace-builds/src-min-noconflict/ace.js');
  window.editor = ace.edit('editor');
  var shareLink = document.getElementById('shareLink');

  shareLink.value = window.location.host + window.location.pathname

  var hasChangedSinceGet = false;
  window.currentText = window.editor.getValue();

  window.editor.on("change", function(){
    hasChangedSinceGet = true;
    console.log(window.currentText);
    console.log(window.editor.getValue());
    if(window.currentText != window.editor.getValue()){
      updateServer();
      window.currentText = window.editor.getValue();
    }
  });

  function getBufferID() {
    var pathname = window.location.pathname;
    var bufferID = pathname.substr(1, pathname.length -1);
    return bufferID;
  }

  function updateServer() {
    var xhr = new XMLHttpRequest();
    var url = '/api/buffers/' + getBufferID();
    var content = window.editor.getValue();

    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        var json = JSON.parse(xhr.responseText);
      }
    };
    var data = JSON.stringify({
      "content": content,
      "buffer_id": getBufferID(),
    });
    xhr.send(data);
  }

  function synchronize() {
    console.log("synchronize");
    var url = '/api/buffers/' + getBufferID();
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
      xhr.responseType = 'json';
      xhr.onload = function() {
        var status = xhr.status;
        console.log(hasChangedSinceGet);
        if (status === 200 && hasChangedSinceGet == false) {
          const cursorPos = window.editor.getCursorPosition();
          if(xhr.response["content"] != window.editor.getValue()){
            console.log("updated text");
            window.editor.setValue(xhr.response["content"]);
            window.editor.clearSelection();
            window.editor.moveCursorToPosition(cursorPos);
          }
        } else {
          console.log('Failed synchronization');
        }
        setTimeout(synchronize, 150);
      };
    xhr.send();
    hasChangedSinceGet = false;
  }
  synchronize();

})();
