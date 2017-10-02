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
  var localBuffer = {"content":   "",
                     "buffer_id": getBufferID(),
                     "sync_time": 0,
                     "cursors":   {}
  };

  window.editor.on("change", function(){
    hasChangedSinceGet = true;
    updateServer();
  });

  function getBufferID() {
    var pathname = window.location.pathname;
    var bufferID = pathname.substr(1, pathname.length -1);
    return bufferID;
  }

  function updateLocal(remoteBuffer) {
      if (hasChangedSinceGet == true){
        console.log("User is writing, delaying update to buffer.");
      }
      else if (remoteBuffer["sync_time"] > localBuffer["sync_time"]){
          localBuffer = remoteBuffer;
          const cursorPos = window.editor.getCursorPosition();
          window.editor.setValue(remoteBuffer["content"]);
          window.editor.clearSelection();
          window.editor.moveCursorToPosition(cursorPos);
      }
  }

  function updateSyncTime(buffer){
      localBuffer["sync_time"] = buffer["sync_time"];
  }

  function updateServer() {
    var xhr = new XMLHttpRequest();
    var url = '/api/buffers/' + getBufferID();
    var content = localBuffer["content"] = window.editor.getValue();

    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        var json = JSON.parse(xhr.responseText);
        updateSyncTime(json);
      }
    };
    var data = JSON.stringify(localBuffer);
    xhr.send(data);
  }

  function synchronize() {
    var url = '/api/buffers/' + getBufferID();
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
      xhr.responseType = 'json';
      xhr.onload = function() {
        var status = xhr.status;
        if (status === 200) {
          updateLocal(xhr.response);
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
