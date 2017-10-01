(function(){
  //// CLIPBOARD ////
  let clipboard = require('../../node_modules/clipboard-js/clipboard.js');
  let clipboardBtn = document.getElementById('clipboardBtn');
  let shareLink = document.getElementById('shareLink');
  shareLink.value = window.location.host + window.location.pathname
  clipboardBtn.addEventListener('click', function(){
    clipboard.copy(shareLink.value);
  });

  let createNewBtn = document.getElementById('createNewBtn');
  createNewBtn.addEventListener('click', function(){
    window.location.replace('/');
  });

  //// EDITOR ////
  let aceEditor = require('../../node_modules/ace-builds/src-min-noconflict/ace.js');
  window.editor = ace.edit('editor');


  var hasChangedSinceGet = false;

  window.editor.on("change", function(){
    hasChangedSinceGet = true;
    updateServer();
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
        if (status === 200 && hasChangedSinceGet == false) {
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
    hasChangedSinceGet = false;
  }
  synchronize();

})();
