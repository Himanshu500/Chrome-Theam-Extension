  document.getElementById('new-tab').addEventListener('click', () => {
      chrome.tabs.create({ url: 'newtab.html' });
    });
    
    document.getElementById('settings').addEventListener('click', () => {
      chrome.tabs.create({ url: 'newtab.html' }, (tab) => {
        // Send message to open settings
        setTimeout(() => {
          chrome.tabs.sendMessage(tab.id, { action: 'openSettings' });
        }, 500);
      });
    });
    
    document.getElementById('feedback').addEventListener('click', () => {
      chrome.tabs.create({ url: 'https://github.com/Himanshu500/Chrome-Theam-Extension/issues' });
    });