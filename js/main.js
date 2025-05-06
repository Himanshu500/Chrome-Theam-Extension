// Main JavaScript file to initialize and coordinate the components
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're running as a Chrome extension
  const isExtension = window.chrome && chrome.runtime && chrome.runtime.id;
  
  // Apply some initial styles based on the environment
  if (!isExtension) {
    // If running outside of extension (e.g., for development), adjust styles
    document.body.classList.add('standalone-mode');
  }
  
  // Initialize search functionality
  initSearch();
  
  // Register service worker if needed
  registerServiceWorker();
  
  // Show a welcome message for first-time users
  showWelcomeMessage();
});

// Initialize search functionality
function initSearch() {
  const searchInput = document.getElementById('search-input');
  const voiceSearch = document.querySelector('.voice-search');
  
  if (searchInput) {
    // Handle search input
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
          executeSearch(query);
        }
      }
    });
    
    // Focus search input on pressing '/'
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.focus();
      }
    });
  }
  
  if (voiceSearch) {
    // Handle voice search if browser supports it
    voiceSearch.addEventListener('click', () => {
      if ('webkitSpeechRecognition' in window) {
        startVoiceRecognition();
      } else {
        alert('Voice search is not supported in your browser.');
      }
    });
  }
}

// Execute search query
function executeSearch(query) {
  // Check if it's a URL
  if (isUrl(query)) {
    // If it doesn't have a protocol, add https://
    if (!query.match(/^[a-zA-Z]+:\/\//)) {
      query = 'https://' + query;
    }
    window.open(query, '_blank');
  } else {
    // Otherwise search with Google
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
  }
}

// Check if string is a URL
function isUrl(string) {
  // Simple URL check
  const urlPattern = /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/\S*)?$/i;
  return urlPattern.test(string);
}

// Start voice recognition for search
function startVoiceRecognition() {
  const searchInput = document.getElementById('search-input');
  const recognition = new webkitSpeechRecognition();
  
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';
  
  // Add visual indicator that voice is active
  document.body.classList.add('voice-active');
  
  recognition.start();
  
  recognition.onresult = (event) => {
    const result = event.results[0][0].transcript;
    searchInput.value = result;
    executeSearch(result);
  };
  
  recognition.onerror = (event) => {
    console.error('Voice recognition error:', event.error);
  };
  
  recognition.onend = () => {
    document.body.classList.remove('voice-active');
  };
}

// Register service worker for offline support and caching
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful');
      })
      .catch(error => {
        console.error('ServiceWorker registration failed:', error);
      });
  }
}

// Show welcome message for first-time users
function showWelcomeMessage() {
  chrome.storage.sync.get(['hasSeenWelcome'], (result) => {
    if (!result.hasSeenWelcome) {
      // Create welcome message element
      const welcomeMessage = document.createElement('div');
      welcomeMessage.className = 'welcome-message';
      welcomeMessage.innerHTML = `
        <div class="welcome-content">
          <h2>Welcome to HackerSpace</h2>
          <p>Your high-tech new tab experience. Here are some tips to get started:</p>
          <ul>
            <li>Click shortcuts to visit your favorite sites</li>
            <li>Use the search bar or press "/" to search</li>
            <li>Customize your experience using the settings button</li>
            <li>Add your own shortcuts and modify animations</li>
          </ul>
          <button id="welcome-close">Get Started</button>
        </div>
      `;
      
      document.body.appendChild(welcomeMessage);
      
      // Add styles
      const style = document.createElement('style');
      style.textContent = `
        .welcome-message {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(8, 12, 20, 0.9);
          z-index: 9999;
          animation: fadeIn 0.5s ease-out;
        }
        
        .welcome-content {
          background: rgba(13, 22, 35, 0.9);
          border: var(--widget-border);
          border-radius: 12px;
          padding: 30px;
          max-width: 500px;
          text-align: center;
          box-shadow: 0 0 30px rgba(0, 229, 255, 0.3);
        }
        
        .welcome-content h2 {
          color: var(--accent-color);
          margin-bottom: 15px;
        }
        
        .welcome-content p {
          margin-bottom: 20px;
        }
        
        .welcome-content ul {
          text-align: left;
          margin-bottom: 25px;
        }
        
        .welcome-content li {
          margin-bottom: 8px;
          list-style-type: none;
          position: relative;
          padding-left: 20px;
        }
        
        .welcome-content li:before {
          content: '→';
          position: absolute;
          left: 0;
          color: var(--accent-color);
        }
        
        #welcome-close {
          background: rgba(0, 229, 255, 0.2);
          border: var(--widget-border);
          border-radius: 6px;
          padding: 10px 20px;
          color: var(--text-color);
          font-family: var(--primary-font);
          font-size: 1rem;
          cursor: pointer;
          transition: all var(--transition-speed);
        }
        
        #welcome-close:hover {
          background: rgba(0, 229, 255, 0.3);
          box-shadow: var(--accent-glow);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `;
      
      document.head.appendChild(style);
      
      // Add close event
      document.getElementById('welcome-close').addEventListener('click', () => {
        welcomeMessage.style.opacity = '0';
        welcomeMessage.style.transition = 'opacity 0.5s ease-out';
        
        setTimeout(() => {
          welcomeMessage.remove();
        }, 500);
        
        // Mark as seen
        chrome.storage.sync.set({ hasSeenWelcome: true });
      });
    }
  });
}

// Error handling and reporting
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  
  // You could log errors to analytics or show user feedback here
}); 