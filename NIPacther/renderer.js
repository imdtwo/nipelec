const copyButton = document.querySelector('button');
copyButton.addEventListener('click', () => {
  window.electron.copyFiles();
});