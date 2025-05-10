// Always use the full, absolute URL for extension assets:
const newTabUrl = chrome.runtime.getURL('newtab.html');

document.getElementById('new-tab').addEventListener('click', () => {
  // If you omit `url`, this will open your overridden New Tab:
  // chrome.tabs.create({});
  chrome.tabs.create({ url: newTabUrl });
});

document.getElementById('settings').addEventListener('click', () => {
  chrome.tabs.create({ url: newTabUrl }, (tab) => {
    setTimeout(() => {
      chrome.tabs.sendMessage(tab.id, { action: 'openSettings' });
    }, 500);
  });
});

document.getElementById('feedback').addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://github.com/Himanshu500/Chrome-Theam-Extension/issues' });
});
