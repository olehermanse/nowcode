(() => {
  const clipboard = require('../../../node_modules/clipboard-js/clipboard.js');
  const clipboardBtn = document.getElementById('clipboardBtn');
  const shareLink = document.getElementById('shareLink');
  shareLink.value = window.location.host + window.location.pathname;
  clipboardBtn.addEventListener('click', function(){
    clipboard.copy(shareLink.value);
  });
})();
