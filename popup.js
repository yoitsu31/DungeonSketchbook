document.getElementById('openSidePanel').addEventListener('click', () => {
  chrome.sidePanel.open();
});

document.getElementById('openOptions').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});
