(function(){
  var shareLink = document.getElementById('shareLink');
  shareLink.value = window.location.host + window.location.pathname

  var editorCode = document.getElementById('editorCode');

  editorCode.addEventListener("input", function() {
    updateServer();
  });

  editorCode.addEventListener("keyup", function() {
    updateServer();
  });

  editorCode.addEventListener("change", function() {

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
    var editorCode = document.getElementById('editorCode');
    var content = editorCode.value;

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
        if (status === 200) {
          var editorCode = document.getElementById('editorCode');
          editorCode.value = xhr.response["content"]
        } else {
          console.log('Failed synchronization');
        }
        setTimeout(synchronize, 150);
      };
    xhr.send();
  }
  synchronize();

})();

