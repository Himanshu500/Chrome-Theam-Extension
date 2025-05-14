// Website shortcuts with interactive animations
class ShortcutManager {
  constructor() {
    this.container = document.getElementById('shortcuts-container');
    this.shortcuts = [];
    this.defaultShortcuts = [
      { 
        id: 'github',
        name: 'GitHub',
        url: 'https://github.com',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.237 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>'
      },
      { 
        id: 'gmail',
        name: 'Gmail',
        url: 'https://mail.google.com',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/></svg>'
      },
      { 
        id: 'youtube',
        name: 'YouTube',
        url: 'https://youtube.com',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>'
      },
      { 
        id: 'stackoverflow',
        name: 'Stack Overflow',
        url: 'https://stackoverflow.com',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M18.986 21.865v-6.404h2.134V24H1.844v-8.539h2.13v6.404h15.012zM6.111 19.731H16.85v-2.137H6.111v2.137zm.259-4.852l10.48 2.189.451-2.07-10.478-2.187-.453 2.068zm1.359-5.056l9.705 4.53.903-1.95-9.706-4.53-.902 1.95zm2.715-4.785l8.217 6.855 1.359-1.62-8.216-6.853-1.36 1.618zM15.751 0l-1.746 1.294 6.405 8.604 1.746-1.294L15.749 0z"/></svg>'
      },
      { 
        id: 'chatgpt',
        name: 'ChatGPT',
        url: 'https://chat.openai.com',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.5095-2.6067-1.4997z" /></svg>'
      }
    ];
    
    // Initialize with empty or loaded, don't immediately assign defaults here
    this.shortcuts = []; 
    
    this.init();
  }
  
  init() {
    // Load saved shortcuts or use defaults
    this.loadShortcuts();
    
    // Render shortcuts
    this.renderShortcuts();
    
    // Add event listeners for shortcut interactions
    this.container.addEventListener('click', this.handleShortcutClick.bind(this));
    this.container.addEventListener('mouseover', this.handleShortcutHover.bind(this));
  }
  
  loadShortcuts() {
    // Try to get shortcuts from storage
    chrome.storage.sync.get(['shortcuts'], (result) => {
      let loadedShortcuts = [];
      if (result.shortcuts && Array.isArray(result.shortcuts)) {
        loadedShortcuts = result.shortcuts;
        console.log('Loaded shortcuts from storage:', loadedShortcuts);

        // --- Safeguard: Ensure all loaded shortcuts have IDs ---
        let updated = false;
        loadedShortcuts.forEach((sc, index) => {
          if (typeof sc.id === 'undefined' || sc.id === null || sc.id === '') {
            console.warn(`Shortcut at index ${index} missing ID, generating one:`, sc);
            sc.id = 'loaded-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
            updated = true;
          }
          // Optional: Add checks for other required fields like name/url if needed
          if (!sc.name) sc.name = 'Unnamed Shortcut';
          if (!sc.url) sc.url = '#'; // Assign a placeholder URL
        });
        
        if (updated) {
            console.log('Attempting to save shortcuts after ID generation.');
            // If we had to generate IDs, save the corrected array back to storage
            this.shortcuts = loadedShortcuts; // Update the manager's array first
            this.saveShortcuts(); // This will trigger the sync.set
        } else {
            this.shortcuts = loadedShortcuts;
        }
        // --- End Safeguard ---

      } else {
        // Use default shortcuts if none are saved or data is invalid
        console.log('No valid shortcuts in storage, using defaults.');
        // Ensure defaults have IDs (they should already from the definition)
        this.shortcuts = this.defaultShortcuts.map(sc => ({...sc})); // Create copies
        this.shortcuts.forEach(sc => { // Double check/assign default IDs if needed
             if (!sc.id) sc.id = sc.name.toLowerCase().replace(/\s+/g, '-'); 
        });
        this.saveShortcuts();
      }
      
      // Render shortcuts after loading/fixing
      this.renderShortcuts();
    });
  }
  
  saveShortcuts() {
    chrome.storage.sync.set({ shortcuts: this.shortcuts });
  }
  
  renderShortcuts() {
    // Clear existing shortcuts
    this.container.innerHTML = '';
    
    // Create and append shortcut elements
    this.shortcuts.forEach(shortcut => {
      const shortcutElement = document.createElement('div');
      shortcutElement.className = 'shortcut';
      shortcutElement.dataset.id = shortcut.id;
      shortcutElement.dataset.url = shortcut.url;
      
      // Create icon container
      const iconElement = document.createElement('div');
      iconElement.className = 'shortcut-icon';
      
      // Render icon based on whether it's a URL or SVG string
      if (shortcut.icon && shortcut.icon.startsWith('http')) {
          // It's a URL, use an img tag
          iconElement.innerHTML = `<img src="${shortcut.icon}" alt="${shortcut.name}" width="24" height="24">`;
          // Add styling for the image within the icon container if needed
          const img = iconElement.querySelector('img');
          if (img) {
              img.style.objectFit = 'contain'; // Prevent stretching
              img.onerror = (e) => { // Handle broken image links
                 console.warn(`Error loading icon for ${shortcut.name}: ${shortcut.icon}`);
                 e.target.outerHTML = this.getDefaultIconSVG(); // Replace with default SVG
              };
          }
      } else if (shortcut.isPlugin) {
          // Plugin Icon Priority:
          // 1. Custom URL (shortcut.icon) - if it exists and is a URL
          // 2. /plugins/{folder}/icon.png
          // 3. Default SVG

          if (shortcut.icon && typeof shortcut.icon === 'string' && shortcut.icon.startsWith('http')) {
              // Priority 1: Use custom URL if provided and looks like a URL
              console.log(`Using custom plugin icon URL: ${shortcut.icon}`);
              iconElement.innerHTML = `<img src="${shortcut.icon}" alt="${shortcut.name}" width="24" height="24" style="object-fit: contain;">`;
              const img = iconElement.querySelector('img');
              if (img) {
                  img.onerror = (e) => {
                      console.warn(`Custom plugin icon failed to load: ${shortcut.icon}. Falling back to default.`);
                      e.target.outerHTML = this.getDefaultIconSVG(); // Replace with default SVG
                  };
              }
          } else {
              // Priority 2: Try loading the plugin's conventional icon.png
              const pluginFolderName = shortcut.url.split('/')[1]; // Extract folder name from URL
              const pluginIconPath = `plugins/${pluginFolderName}/icon.png`;
              console.log(`Rendering plugin shortcut, trying default icon: ${pluginIconPath}`);
              iconElement.innerHTML = `<img src="${pluginIconPath}" alt="${shortcut.name}" width="24" height="24" style="object-fit: contain;">`;
              const img = iconElement.querySelector('img');
              if (img) {
                   img.onerror = (e) => { // Handle missing plugin icon
                      // Priority 3: Fallback to default SVG
                      console.warn(`Plugin icon.png not found or failed at ${pluginIconPath}, using default.`);
                      e.target.outerHTML = this.getDefaultIconSVG(); // Replace with default SVG
                   };
               }
          }
      } else if (shortcut.icon) {
          // Assume it's an SVG string (for non-plugin, non-http icons)
          iconElement.innerHTML = shortcut.icon;
      } else {
          // Fallback if icon is somehow missing
          iconElement.innerHTML = this.getDefaultIconSVG();
      }
      
      // Create name element
      const nameElement = document.createElement('div');
      nameElement.className = 'shortcut-name';
      nameElement.textContent = shortcut.name;
      
      // Append elements
      shortcutElement.appendChild(iconElement);
      shortcutElement.appendChild(nameElement);
      
      // Add to container
      this.container.appendChild(shortcutElement);
    });
  }
  
  handleShortcutClick(event) {
    const shortcutElement = event.target.closest('.shortcut');
    if (!shortcutElement) return;

    const url = shortcutElement.dataset.url;
    const nameElement = shortcutElement.querySelector('.shortcut-name');
    const originalName = nameElement ? nameElement.textContent : '';

    const openLink = () => {
      chrome.storage.sync.get(['settings'], (result) => {
        let openInNewTab = true;
        if (result.settings && typeof result.settings.openShortcutsInNewTab !== 'undefined') {
          openInNewTab = result.settings.openShortcutsInNewTab;
        }
        const target = openInNewTab ? '_blank' : '_self';
        window.open(url, target);
      });

      shortcutElement.classList.add('clicked');
      setTimeout(() => {
        shortcutElement.classList.remove('clicked');
      }, 300);
    };

    if (window.settingsManager && window.settingsManager.settings.theme === 'codebreaker' && nameElement) {
      let iterations = 0;
      const maxIterations = 15; // Controls speed/duration (15 * 50ms = 750ms)
      const intervalTime = 50; // Milliseconds between character changes
      const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{};:/?,.<>';

      nameElement.style.minWidth = nameElement.offsetWidth + 'px'; // Prevent layout shift
      nameElement.style.textAlign = 'center';

      const decryptInterval = setInterval(() => {
        let newText = '';
        for (let i = 0; i < originalName.length; i++) {
          newText += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
        }
        nameElement.textContent = newText;
        iterations++;
        if (iterations >= maxIterations) {
          clearInterval(decryptInterval);
          nameElement.textContent = originalName;
          nameElement.style.minWidth = ''; // Reset minWidth
          nameElement.style.textAlign = '';
          openLink();
        }
      }, intervalTime);
    } else {
      openLink(); // Open link directly if not codebreaker theme or no name element
    }
  }
  
  handleShortcutHover(event) {
    // Find the closest shortcut element
    const shortcutElement = event.target.closest('.shortcut');
    if (!shortcutElement) return;
    
    // Add hover effects using animation
    this.applyFluidHoverEffect(shortcutElement);
  }
  
  applyFluidHoverEffect(element) {
    // Get the icon element
    const iconElement = element.querySelector('.shortcut-icon');
    
    // Apply fluid-like animation effect
    iconElement.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
    iconElement.style.transform = 'scale(1.15)';
    
    // Add event listener for mouseout to reset the effect
    const resetEffect = () => {
      iconElement.style.transform = 'scale(1)';
      element.removeEventListener('mouseleave', resetEffect);
    };
    
    element.addEventListener('mouseleave', resetEffect);
  }
  
  // Utility to get default icon (consistent with settings.js)
  getDefaultIconSVG() {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle></svg>'; // Simple circle default
  }
  
  // Method to add a new shortcut
  addShortcut(shortcut) {
    // Ensure required fields exist (name, url)
    if (!shortcut || !shortcut.name || !shortcut.url) {
        console.error("Attempted to add invalid shortcut data:", shortcut);
        return; // Don't add incomplete shortcuts
    }
    
    // Generate a unique ID if one isn't already provided (though it shouldn't be)
    if (!shortcut.id) {
        shortcut.id = 'custom-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
        console.log(`Generated new ID for shortcut: ${shortcut.id}`);
    }
    
    // Ensure icon exists, assign default if needed
    if (!shortcut.icon) {
        shortcut.icon = this.getDefaultIconSVG();
    }
    
    // Add to shortcuts array
    this.shortcuts.push(shortcut);
    
    // Save shortcuts
    this.saveShortcuts();
    
    // Re-render shortcuts
    this.renderShortcuts();
  }
  
  // Method to update an existing shortcut
  updateShortcut(id, updatedData) {
    const index = this.shortcuts.findIndex(s => s.id === id);
    if (index !== -1) {
      // Merge existing shortcut with updated data
      this.shortcuts[index] = { ...this.shortcuts[index], ...updatedData };
      this.saveShortcuts();
      this.renderShortcuts(); // Re-render the main shortcut display
      console.log(`Shortcut ${id} updated.`);
      return true; // Indicate success
    } else {
      console.error(`Shortcut with ID ${id} not found for update.`);
      return false; // Indicate failure
    }
  }
  
  // Method to remove a shortcut
  removeShortcut(id) {
    // Find the index of the shortcut
    const index = this.shortcuts.findIndex(s => s.id === id);
    
    if (index !== -1) {
      // Remove from array
      this.shortcuts.splice(index, 1);
      
      // Save shortcuts
      this.saveShortcuts();
      
      // Re-render shortcuts
      this.renderShortcuts();
    }
  }
  
  // Method to restore default shortcuts
  restoreDefaults() {
      console.log('Restoring default shortcuts...');
      // Use map to ensure we are working with copies, not references to the original default objects
      this.shortcuts = this.defaultShortcuts.map(sc => ({ ...sc }));
      // Ensure IDs are present (though they should be in the definition)
      this.shortcuts.forEach(sc => { 
           if (!sc.id) sc.id = sc.name.toLowerCase().replace(/\s+/g, '-'); 
      });
      this.saveShortcuts(); // Save the defaults to storage
      this.renderShortcuts(); // Update the main shortcut display
      // Settings panel refresh will be handled by SettingsManager calling populateShortcutsEditor
  }
}

// Initialize shortcuts on page load
window.addEventListener('DOMContentLoaded', () => {
  window.shortcutManager = new ShortcutManager();
}); 