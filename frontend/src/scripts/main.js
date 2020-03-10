(() => {
  require('../../src/scripts/editor.js');
  require('../../src/scripts/clipboard.js');

  const createNewBtn = document.getElementById('createNewBtn');
  createNewBtn.addEventListener('click', () => {
    window.location.replace('/');
  });
})();
