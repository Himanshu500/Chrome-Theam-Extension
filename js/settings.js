// Settings panel controller
class SettingsManager {
  constructor() {
    // Wait for DOM to fully load before accessing elements
    this.initialized = false;
    this.init();
  }
  
  init() {
    // Make sure all elements exist before initializing
    this.settingsToggle = document.getElementById('settings-toggle');
    this.settingsPanel = document.getElementById('settings-panel');
    this.closeSettingsBtn = document.getElementById('close-settings');

    // Exit early if elements aren't loaded yet
    if (!this.settingsToggle || !this.settingsPanel || !this.closeSettingsBtn) {
      console.error('Essential settings panel elements not found, stopping init.');
      // No retry here, if basic elements fail, something is fundamentally wrong
      return;
    }

    this.themeOptions = document.querySelectorAll('.theme-option');
    this.particleDensity = document.getElementById('particle-density');
    this.animationSpeed = document.getElementById('animation-speed');
    this.physicsIntensity = document.getElementById('physics-intensity');
    this.addShortcutBtn = document.getElementById('add-shortcut-btn');
    this.shortcutsEditor = document.getElementById('shortcuts-editor');
    
    // --- Add Checks for Slider Elements ---
    if (!this.particleDensity) console.warn('Particle Density slider element not found.');
    if (!this.animationSpeed) console.warn('Animation Speed slider element not found.');
    if (!this.physicsIntensity) console.warn('Physics Intensity slider element not found.');
    if (!this.addShortcutBtn) console.warn('Add Shortcut button element not found.');
    if (!this.shortcutsEditor) console.warn('Shortcuts editor element not found.');
    if (!this.themeOptions || this.themeOptions.length === 0) console.warn('Theme option elements not found.');
    // --- End Checks ---
    
    // --- Widget Toggle Listeners ---
    this.widgetToggleCheckboxes = document.querySelectorAll('.settings-section input[type="checkbox"][data-widget-id]');
    this.widgetToggleCheckboxes.forEach(checkbox => {
        const settingKey = `show${checkbox.id.split('-')[1].charAt(0).toUpperCase() + checkbox.id.split('-')[1].slice(1)}`; // e.g., showTasksWidget
        checkbox.addEventListener('change', () => {
            this.settings[settingKey] = checkbox.checked;
            this.applyWidgetVisibility();
            // Debounce saving for checkboxes as well? Less critical but consistent.
            clearTimeout(this.saveDebounceTimer);
            this.saveDebounceTimer = setTimeout(() => {
                this.saveSettings();
                console.log('Settings saved after widget toggle debounce');
                this.showSaveFeedback(); // Add feedback here too
            }, 500);
        });
    });
    // --- End Widget Toggle Listeners ---
    
    // --- Custom Color Input Listeners ---
    this.colorInputs = document.querySelectorAll('.custom-colors input[type="color"]');
    this.colorInputs.forEach(input => {
        const settingKey = `custom${input.id.split('-')[1].charAt(0).toUpperCase() + input.id.split('-')[1].slice(1)}Color`; // e.g., customBgColor
        // Handle widget BG separately
        const actualSettingKey = input.id === 'color-widget-bg' ? 'customWidgetBgBase' : settingKey;

        input.addEventListener('input', () => {
            this.settings[actualSettingKey] = input.value; 
            this.settings.activeThemeType = 'custom'; // Switch to custom theme on color change
            this.applyTheme(); // Re-apply theme with new custom color
            // Debounce save
            clearTimeout(this.saveDebounceTimer);
            this.saveDebounceTimer = setTimeout(() => {
                this.saveSettings();
                console.log('Settings saved after color change debounce');
                this.showSaveFeedback();
            }, 500);
        });
    });
    // --- End Custom Color Listeners ---
    
    // --- Import/Export Listeners ---
    this.exportBtn = document.getElementById('export-data-btn');
    this.importBtn = document.getElementById('import-data-btn');
    this.importFileInput = document.getElementById('import-file-input');

    if (this.exportBtn) {
        this.exportBtn.addEventListener('click', () => this.exportData());
    }
    if (this.importBtn && this.importFileInput) {
        this.importBtn.addEventListener('click', () => this.importFileInput.click()); // Trigger file input
        this.importFileInput.addEventListener('change', (e) => this.handleImportFile(e));
    }
    // --- End Import/Export Listeners ---
    
    // --- Plugin Shortcut Listener ---
    this.pluginNameInput = document.getElementById('plugin-folder-name');
    this.addPluginBtn = document.getElementById('add-plugin-shortcut-btn');
    this.pluginIconUrlInput = document.getElementById('plugin-icon-url'); // Get reference

    if (this.addPluginBtn && this.pluginNameInput) {
        this.addPluginBtn.addEventListener('click', () => this.handleAddPluginShortcut());
    } else {
        console.warn('Plugin shortcut input or button not found.');
    }
    // --- End Plugin Shortcut Listener ---
    
    // Debounce timer for saving settings
    this.saveDebounceTimer = null;
    
    // Store defaults for reset functionality
    this.defaultSettings = {
      theme: 'hacker', // Default preset theme
      activeThemeType: 'preset', // Track if preset or custom is active
      foregroundAnimationType: 'physics', // Default foreground anim
      backgroundAnimationType: 'universe', // Change default to new one
      particleDensity: 50,
      animationSpeed: 50,
      physicsIntensity: 50,
      // Default visibility states
      showTasksWidget: true,
      showShortcutsWidget: true,
      showSearchWidget: true,
      showClockWidget: true,
      // Default custom colors (match 'hacker' theme)
      customBgColor: '#080c14',
      customTextColor: '#6bf6ff',
      customTextSecondaryColor: '#57c7cc',
      customAccentColor: '#00e5ff',
      customWidgetBgBase: '#0d1623' // Base color for widget BG (alpha handled separately)
    };
    
    // Initialize current settings potentially from storage or defaults
    this.settings = { ...this.defaultSettings }; 
    
    // Mark as initialized
    this.initialized = true;
    console.log('Settings manager initialized');

    // Load settings from storage
    this.loadSettings();
    
    // Add event listeners
    this.settingsToggle.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent event bubbling
      this.toggleSettingsPanel();
    });
    
    this.closeSettingsBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent event bubbling
      this.closeSettingsPanel();
    });
    
    // Theme selection events
    this.themeOptions.forEach(option => {
      option.addEventListener('click', () => {
        this.setTheme(option.dataset.theme);
      });
    });
    
    // --- Debounced Slider Event Listeners ---
    const setupSliderListener = (sliderElement, settingKey) => {
      if (sliderElement) {
        sliderElement.addEventListener('input', () => {
          // Update the setting value immediately for responsiveness
          this.settings[settingKey] = parseInt(sliderElement.value, 10);
          // Apply visual changes immediately (like particle density)
          this.applySettingChange(settingKey, this.settings[settingKey]); 

          // Clear the previous debounce timer
          clearTimeout(this.saveDebounceTimer);
          
          // Set a new timer to save after a delay (e.g., 500ms)
          this.saveDebounceTimer = setTimeout(() => {
            this.saveSettings(); // Save the entire settings object
            console.log(`Settings saved after debounce (Key: ${settingKey})`);
            // --- Add visual feedback ---
            this.showSaveFeedback();
            // --- End feedback ---
          }, 500); 
        });
      }
    };

    setupSliderListener(this.particleDensity, 'particleDensity');
    setupSliderListener(this.animationSpeed, 'animationSpeed');
    setupSliderListener(this.physicsIntensity, 'physicsIntensity');
    // --- End Debounced Listeners ---
    
    // Add shortcut button
    if (this.addShortcutBtn) {
      this.addShortcutBtn.addEventListener('click', () => {
        this.showAddShortcutForm();
      });
    }
    
    // Reset Settings Button
    this.resetSettingsBtn = document.getElementById('reset-settings-btn');
    if (this.resetSettingsBtn) {
        this.resetSettingsBtn.addEventListener('click', () => {
            this.resetToDefaults();
        });
    } else {
        console.warn('Reset settings button not found.');
    }
    
    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
      if (this.settingsPanel.classList.contains('active') && 
          !this.settingsPanel.contains(e.target) && 
          e.target !== this.settingsToggle) {
        this.closeSettingsPanel();
      }
    });

    // --- Animation Type Selectors ---
    this.foregroundAnimSelect = document.getElementById('setting-foreground-animation');
    this.backgroundAnimSelect = document.getElementById('setting-background-animation');

    const setupAnimTypeListener = (selectElement, settingKey, managerFunctionName) => {
        if (selectElement) {
            selectElement.addEventListener('change', () => {
                const newType = selectElement.value;
                this.settings[settingKey] = newType;
                console.log(`${settingKey} changed to: ${newType}`);

                // Trigger animation switch via AnimationManager (if it exists)
                if (window.animationManager && typeof window.animationManager[managerFunctionName] === 'function') {
                    window.animationManager[managerFunctionName](newType);
                } else {
                    console.warn('AnimationManager or switch function not available.');
                }

                // Debounce save
                clearTimeout(this.saveDebounceTimer);
                this.saveDebounceTimer = setTimeout(() => {
                    this.saveSettings();
                    console.log('Settings saved after animation type change debounce');
                    this.showSaveFeedback();
                }, 500);
            });
        } else {
            console.warn(`Animation selector element for ${settingKey} not found.`);
        }
    };

    setupAnimTypeListener(this.foregroundAnimSelect, 'foregroundAnimationType', 'switchForegroundAnimation');
    setupAnimTypeListener(this.backgroundAnimSelect, 'backgroundAnimationType', 'switchBackgroundAnimation');
    // --- End Animation Type Selectors ---
  }
  
  loadSettings() {
    chrome.storage.sync.get(['settings'], (result) => {
      if (result.settings) {
        // Merge stored settings with defaults to ensure all keys exist
        this.settings = { ...this.defaultSettings, ...result.settings };
        console.log('Loaded settings from storage:', this.settings);
      } else {
        // If nothing in storage, ensure defaults are used
        this.settings = { ...this.defaultSettings };
        console.log('No settings in storage, using defaults.');
      }
      
      // Apply loaded/default settings to UI and components
      this.applySettings();
    });
  }
  
  saveSettings() {
    chrome.storage.sync.set({ settings: this.settings });
  }
  
  applySettings() {
    // Apply theme
    this.applyTheme();
    
    // Update sliders to match current settings values
    if (this.particleDensity) this.particleDensity.value = this.settings.particleDensity;
    if (this.animationSpeed) this.animationSpeed.value = this.settings.animationSpeed;
    if (this.physicsIntensity) this.physicsIntensity.value = this.settings.physicsIntensity;
    
    // Apply settings to the relevant components (like ParticleSystem)
    this.applySettingChange('particleDensity', this.settings.particleDensity);
    this.applySettingChange('animationSpeed', this.settings.animationSpeed);
    this.applySettingChange('physicsIntensity', this.settings.physicsIntensity);
    
    // Update animation selection dropdowns
    if (this.foregroundAnimSelect) this.foregroundAnimSelect.value = this.settings.foregroundAnimationType;
    if (this.backgroundAnimSelect) this.backgroundAnimSelect.value = this.settings.backgroundAnimationType;
    
    // Apply widget visibility
    this.applyWidgetVisibility();
  }
  
  toggleSettingsPanel() {
    if (!this.initialized) {
      console.log('Settings manager not initialized yet');
      return;
    }
    
    console.log('Toggling settings panel');
    
    // Ensure settings panel exists in DOM
    if (!this.settingsPanel) {
      console.error('Settings panel element not found');
      return;
    }
    
    this.settingsPanel.classList.toggle('active');
    
    // Animate toggle button
    if (this.settingsPanel.classList.contains('active')) {
      this.settingsToggle.style.transform = 'rotate(90deg)';
      
      // Force repaint to ensure panel is visible
      this.settingsPanel.style.display = 'block';
      setTimeout(() => {
        this.settingsPanel.style.opacity = '1'; 
      }, 10);
      
      // Populate shortcuts editor if needed
      if (this.shortcutsEditor) {
        this.populateShortcutsEditor();
      }
    } else {
      this.settingsToggle.style.transform = '';
    }
  }
  
  closeSettingsPanel() {
    if (!this.settingsPanel) return;
    
    this.settingsPanel.classList.remove('active');
    this.settingsToggle.style.transform = '';
    
    // Ensure smooth transition out
    this.settingsPanel.style.opacity = '0';
    setTimeout(() => {
      if (!this.settingsPanel.classList.contains('active')) {
        this.settingsPanel.style.display = '';
      }
    }, 300); // Match the CSS transition time
  }
  
  setTheme(theme) {
    // Update settings
    this.settings.theme = theme;
    this.settings.activeThemeType = 'preset'; // Mark as using a preset
    this.saveSettings();
    
    // Apply the theme
    this.applyTheme();
  }
  
  applyTheme() {
    const root = document.documentElement;
    const currentThemeType = this.settings.activeThemeType;
    const presetTheme = this.settings.theme;

    console.log(`Applying theme - Type: ${currentThemeType}, Preset: ${presetTheme}`);

    // Update selected theme button in UI
    this.themeOptions.forEach(option => {
      // Only highlight if a preset is active and it matches
      option.classList.toggle('selected', currentThemeType === 'preset' && option.dataset.theme === presetTheme);
    });

    // Update color input values from settings (either defaults or loaded custom)
    this.colorInputs.forEach(input => {
        const settingKey = `custom${input.id.split('-')[1].charAt(0).toUpperCase() + input.id.split('-')[1].slice(1)}Color`;
        const actualSettingKey = input.id === 'color-widget-bg' ? 'customWidgetBgBase' : settingKey;
        if (this.settings[actualSettingKey]) {
          input.value = this.settings[actualSettingKey];
        }
    });
    
    // Clear previous theme classes
    document.body.className = '';
    
    if (currentThemeType === 'preset') {
        // Apply PRESET theme variables
        let vars = {};
        switch (presetTheme) {
            case 'hacker':
                vars = { '--bg-color': '#080c14', '--text-color': '#6bf6ff', '--text-secondary': '#57c7cc', '--accent-color': '#00e5ff', '--widget-bg-base': '#0d1623' };
                document.body.classList.add('theme-hacker');
                break;
            case 'cyberpunk':
                vars = { '--bg-color': '#0d0221', '--text-color': '#fc28a8', '--text-secondary': '#fe53bb', '--accent-color': '#fd1d53', '--widget-bg-base': '#1a0d2e' };
                document.body.classList.add('theme-cyberpunk');
                break;
            case 'matrix':
                vars = { '--bg-color': '#000300', '--text-color': '#00ff41', '--text-secondary': '#00b828', '--accent-color': '#00ff41', '--widget-bg-base': '#001a05' };
                document.body.classList.add('theme-matrix');
                break;
            case 'space':
                vars = { '--bg-color': '#030014', '--text-color': '#e0e4fc', '--text-secondary': '#a4b1fb', '--accent-color': '#7b88ff', '--widget-bg-base': '#0d1030' };
                document.body.classList.add('theme-space');
                break;
            default: // Fallback to hacker
                vars = { '--bg-color': '#080c14', '--text-color': '#6bf6ff', '--text-secondary': '#57c7cc', '--accent-color': '#00e5ff', '--widget-bg-base': '#0d1623' };
                document.body.classList.add('theme-hacker');
                break;
        }
        // Apply preset variables
        for (const [key, value] of Object.entries(vars)) {
            root.style.setProperty(key, value);
        }
        // Also update custom color settings to match the newly selected preset
        this.settings.customBgColor = vars['--bg-color'];
        this.settings.customTextColor = vars['--text-color'];
        this.settings.customTextSecondaryColor = vars['--text-secondary'];
        this.settings.customAccentColor = vars['--accent-color'];
        this.settings.customWidgetBgBase = vars['--widget-bg-base'];
        // Update the color input UI elements as well
        this.colorInputs.forEach(input => {
            const cssVar = input.dataset.cssVar === '--widget-bg-base' ? '--widget-bg-base' : input.dataset.cssVar;
            if (vars[cssVar]) {
                input.value = vars[cssVar];
            }
        });
        
    } else { // Apply CUSTOM theme variables
        console.log('Applying custom colors:', this.settings);
        root.style.setProperty('--bg-color', this.settings.customBgColor);
        root.style.setProperty('--text-color', this.settings.customTextColor);
        root.style.setProperty('--text-secondary', this.settings.customTextSecondaryColor);
        root.style.setProperty('--accent-color', this.settings.customAccentColor);
        root.style.setProperty('--widget-bg-base', this.settings.customWidgetBgBase);
        // Add a generic body class for custom themes if needed
        document.body.classList.add('theme-custom'); 
    }

    // Apply shared derived variables (like widget-bg with alpha, accent-glow)
    // This needs to happen AFTER base colors are set by either preset or custom
    this.applyDerivedStyles();
  }
  
  applyDerivedStyles() {
    const root = document.documentElement;
    const accentColor = root.style.getPropertyValue('--accent-color').trim();
    const widgetBgBase = root.style.getPropertyValue('--widget-bg-base').trim();

    if (accentColor) {
        // Attempt to parse accent color to create glow (simple RGBA approach)
        let glowColor = 'rgba(0, 229, 255, 0.7)'; // Default fallback
        try {
            // Use a temporary element to get RGBA components from hex/rgb
            const tempDiv = document.createElement('div');
            tempDiv.style.color = accentColor;
            document.body.appendChild(tempDiv); // Must be in DOM for getComputedStyle
            const rgb = window.getComputedStyle(tempDiv).color;
            document.body.removeChild(tempDiv);
            const match = rgb.match(/\d+/g);
            if (match && match.length >= 3) {
                glowColor = `rgba(${match[0]}, ${match[1]}, ${match[2]}, 0.7)`;
            }
        } catch (e) { console.error('Could not parse accent color for glow:', e); }
        root.style.setProperty('--accent-glow', `0 0 10px ${glowColor}`);
    }

    if (widgetBgBase) {
        // Apply widget background with fixed alpha
        let widgetBg = 'rgba(13, 22, 35, 0.6)'; // Default fallback
        try {
            const tempDiv = document.createElement('div');
            tempDiv.style.color = widgetBgBase;
            document.body.appendChild(tempDiv);
            const rgb = window.getComputedStyle(tempDiv).color;
            document.body.removeChild(tempDiv);
            const match = rgb.match(/\d+/g);
            if (match && match.length >= 3) {
                widgetBg = `rgba(${match[0]}, ${match[1]}, ${match[2]}, 0.6)`; // Keep alpha fixed at 0.6
            }
        } catch (e) { console.error('Could not parse widget base color:', e); }
        root.style.setProperty('--widget-bg', widgetBg);
    }
  }
  
  applySettingChange(key, value) {
    // Apply visual/functional changes immediately 
    const ps = window.particleSystem;
    if (!ps) {
        console.warn(`Cannot apply setting ${key}: Particle system not ready.`);
        return;
    }

    switch (key) {
        case 'particleDensity':
            // Only apply if the current animation is physics particles
            if (this.settings.foregroundAnimationType === 'physics' && ps && typeof ps.setParticleDensity === 'function') {
                ps.setParticleDensity(value);
            } else {
                 console.warn('Cannot set particle density - Active animation is not physics or method missing.');
            }
            break;
        case 'animationSpeed':
            // Apply to BOTH active animations if they support it
            if (window.activeForegroundAnim && typeof window.activeForegroundAnim.setAnimationSpeed === 'function') {
                window.activeForegroundAnim.setAnimationSpeed(value);
            }
            if (window.activeBackgroundAnim && typeof window.activeBackgroundAnim.setAnimationSpeed === 'function') {
                // Need to add setAnimationSpeed to BackgroundAnimation if desired
                // window.activeBackgroundAnim.setAnimationSpeed(value);
                console.warn('setAnimationSpeed not implemented for background animation.'); // Placeholder
            } else if (!window.activeForegroundAnim && !window.activeBackgroundAnim) {
               console.warn('Cannot set animation speed - No active animation.');
            }
            break;
        case 'physicsIntensity':
            // Only apply if the current animation is physics particles
            if (this.settings.foregroundAnimationType === 'physics' && ps && typeof ps.setPhysicsIntensity === 'function') {
                ps.setPhysicsIntensity(value);
            } else {
                console.warn('Cannot set physics intensity - Active animation is not physics or method missing.');
            }
            break;
        // Add cases for other settings if needed
        default:
            // console.log(`No immediate action for setting key: ${key}`);
            break;
    }
  }
  
  // --- Reset to Defaults ---
  resetToDefaults() {
      if (!confirm('Are you sure you want to reset all settings and shortcuts to their defaults?')) {
          return;
      }
      console.log('Resetting settings to defaults...');
      
      // Reset settings object
      this.settings = { ...this.defaultSettings };
      
      // Reset shortcuts via ShortcutManager
      if (window.shortcutManager && typeof window.shortcutManager.restoreDefaults === 'function') {
          window.shortcutManager.restoreDefaults(); 
          // Re-populate editor after defaults are restored and saved by manager
          this.populateShortcutsEditor(); 
      } else {
          console.warn('Shortcut manager or restoreDefaults method not available.');
      }
      
      // Save reset settings to storage
      this.saveSettings(); 
      
      // Apply the reset settings to UI elements and components
      this.applySettings(); 
      
      alert('Settings have been reset to defaults.');
  }
  // --- End Reset --- 
  
  // --- Utility to fetch Favicon ---
  async fetchFavicon(url) {
    if (!url) return this.getDefaultIconSVG();
    let validUrl;
    try {
      // Ensure protocol exists for URL constructor
      const urlWithProto = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
      validUrl = new URL(urlWithProto);
    } catch (e) {
      console.warn(`Invalid URL format for favicon fetching: ${url}`);
      return this.getDefaultIconSVG(); // Return default if URL format is invalid
    }

    try {
      const domain = validUrl.hostname;
      // Use Google's favicon service (size 64x64)
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
      
      // We simply return the Google service URL.
      // The <img> tag's onerror handler in ShortcutManager will handle if Google can't find/provide an icon.
      return faviconUrl; 

    } catch (error) {
      // Catch any unexpected errors during hostname extraction or URL construction
      console.error('Error processing URL for favicon:', error);
      return this.getDefaultIconSVG(); // Return default icon on processing error
    }
  }
  
  getDefaultIconSVG() {
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle></svg>'; // Simple circle default
  }
  // --- End Utility ---
  
  populateShortcutsEditor() {
    if (!this.shortcutsEditor) {
      console.error('Shortcut editor element not found');
      return;
    }
    
    // Clear existing content (forms, etc.)
    this.shortcutsEditor.innerHTML = '';
    
    // Check if shortcut manager exists AND is initialized
    if (!window.shortcutManager || !window.shortcutManager.shortcuts) {
        console.warn('Shortcut manager not ready yet in populateShortcutsEditor');
        // Optionally display a loading message or retry later
        this.shortcutsEditor.innerHTML = '<p>Loading shortcuts...</p>'; 
        // Attempt to re-populate after a short delay if manager might still be loading
        setTimeout(() => {
            if (this.settingsPanel.classList.contains('active')) { // Only repopulate if panel is still open
                 this.populateShortcutsEditor();
            }
        }, 500);
        return;
    }
    
    const shortcuts = window.shortcutManager.shortcuts;
    
    // If no shortcuts, display a message
    if (shortcuts.length === 0) {
        this.shortcutsEditor.innerHTML = '<p>No shortcuts configured yet.</p>';
        return;
    }
    
    shortcuts.forEach(shortcut => {
      // --- DEBUG LOG --- 
      console.log('Processing shortcut:', shortcut.name, 'ID:', shortcut.id);
      if (typeof shortcut.id === 'undefined') {
          console.error('Shortcut object is missing ID property!', shortcut);
      }
      // --- END DEBUG ---
      
      const shortcutItem = document.createElement('div');
      shortcutItem.className = 'shortcut-edit-item';
      shortcutItem.dataset.id = shortcut.id; // Ensure ID is set
      
      // Determine if icon is a URL or SVG string
      let iconHTML = '';
      if (shortcut.icon && shortcut.icon.startsWith('http')) {
          iconHTML = `<img src="${shortcut.icon}" alt="${shortcut.name}" width="20" height="20">`;
      } else if (shortcut.icon) { // Assume SVG string
          iconHTML = shortcut.icon; // Use the stored SVG
      } else { // Fallback if icon is missing
          iconHTML = this.getDefaultIconSVG();
      }
      
      // Display shortcut info
      shortcutItem.innerHTML = `
        <div class="shortcut-info">
          <div class="shortcut-icon-small">${iconHTML}</div>
          <div class="shortcut-details">
            <div>${shortcut.name}</div>
            <div class="shortcut-url">${shortcut.url}</div>
          </div>
        </div>
        <div class="shortcut-actions">
          <button class="edit-shortcut" data-id="${shortcut.id}">Edit</button>
          <button class="delete-shortcut" data-id="${shortcut.id}">Delete</button>
        </div>
      `;
      
      this.shortcutsEditor.appendChild(shortcutItem);
    });
    
    // --- Add event listeners AFTER generating all items ---
    this.shortcutsEditor.querySelectorAll('.edit-shortcut').forEach(button => {
      // Ensure listener is attached to the button itself
      button.addEventListener('click', () => { 
        // --- DEBUG LOG --- 
        console.log('Edit button clicked. Button element:', button);
        console.log('Button dataset:', button.dataset);
        // --- END DEBUG ---
        
        if (!window.shortcutManager) {
             console.error('ShortcutManager not available for editing.');
             return;
        }
        const shortcutId = button.dataset.id; 
        if (!shortcutId) {
            console.error('Could not find shortcut ID on the edit button dataset.', button.dataset);
            return;
        }

        const shortcut = window.shortcutManager.shortcuts.find(s => s.id === shortcutId);
        if (shortcut) {
          this.showEditShortcutForm(shortcut);
        } else {
          console.error(`Shortcut with ID ${shortcutId} not found for editing.`);
        }
      });
    });
    
    this.shortcutsEditor.querySelectorAll('.delete-shortcut').forEach(button => {
      // Ensure listener is attached to the button itself
      button.addEventListener('click', () => { 
         // --- DEBUG LOG --- 
        console.log('Delete button clicked. Button element:', button);
        console.log('Button dataset:', button.dataset);
        // --- END DEBUG ---

        if (!window.shortcutManager) {
             console.error('ShortcutManager not available for deleting.');
             return;
        }
        const shortcutId = button.dataset.id;
        if (!shortcutId) {
            console.error('Could not find shortcut ID on the delete button dataset.', button.dataset);
            return;
        }

        const shortcut = window.shortcutManager.shortcuts.find(s=>s.id === shortcutId);
        const shortcutName = shortcut ? shortcut.name : 'this item';
        if (confirm(`Are you sure you want to delete the shortcut for ${shortcutName}?`)) {
            window.shortcutManager.removeShortcut(shortcutId);
            this.populateShortcutsEditor(); // Refresh the list immediately
        } 
      });
    });
    
    // Add/Update styles (ensure they cover img tag)
    const styleId = 'shortcuts-editor-styles';
    let style = document.getElementById(styleId);
    if (!style) {
        style = document.createElement('style');
        style.id = styleId;
        document.head.appendChild(style);
    }
    style.textContent = `
      .shortcut-edit-item { display: flex; justify-content: space-between; align-items: center; padding: 10px; margin-bottom: 10px; background: rgba(13, 22, 35, 0.4); border: var(--widget-border); border-radius: 6px; }
      .shortcut-info { display: flex; align-items: center; }
      .shortcut-icon-small { width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; margin-right: 10px; }
      .shortcut-icon-small svg, .shortcut-icon-small img { width: 20px; height: 20px; object-fit: contain; } /* Style for both SVG and img */
      .shortcut-details { display: flex; flex-direction: column; } 
      .shortcut-url { font-size: 0.8rem; color: var(--text-secondary); opacity: 0.7; word-break: break-all; } /* Allow URL to wrap */
      .shortcut-actions button { background: rgba(0, 229, 255, 0.1); border: var(--widget-border); border-radius: 4px; padding: 5px 10px; margin-left: 5px; color: var(--text-color); cursor: pointer; font-family: var(--primary-font); font-size: 0.8rem; transition: all var(--transition-speed); }
      .shortcut-actions button:hover { background: rgba(0, 229, 255, 0.2); }
      .shortcut-actions button.delete-shortcut { background: rgba(255, 43, 91, 0.1); }
      .shortcut-actions button.delete-shortcut:hover { background: rgba(255, 43, 91, 0.2); }
    `;
    
  }
  
  showAddShortcutForm() {
    // Prevent adding multiple forms
    if (this.shortcutsEditor.querySelector('.shortcut-form')) {
        return;
    }
    
    const form = document.createElement('div');
    form.className = 'shortcut-form';
    form.innerHTML = `
      <h3>Add New Shortcut</h3>
      <div class="form-group">
        <label for="shortcut-name">Name</label>
        <input type="text" id="shortcut-name" placeholder="e.g., Google">
      </div>
      <div class="form-group">
        <label for="shortcut-url">URL</label>
        <input type="text" id="shortcut-url" placeholder="e.g., https://google.com">
        <img id="favicon-preview" src="" alt="Icon Preview" width="16" height="16" style="margin-left: 10px; vertical-align: middle; display: none;">
        <small id="favicon-feedback" style="display: block; margin-top: 5px; opacity: 0.7;"></small>
      </div>
      <div class="form-group">
        <label for="shortcut-icon-url">Icon URL (Optional)</label>
        <input type="text" id="shortcut-icon-url" placeholder="Paste direct image URL here">
      </div>
      <div class="form-actions">
        <button id="cancel-add-shortcut" type="button">Cancel</button>
        <button id="save-add-shortcut" type="button">Save</button>
      </div>
    `;
    
    this.shortcutsEditor.appendChild(form);
    
    const urlInput = form.querySelector('#shortcut-url');
    const nameInput = form.querySelector('#shortcut-name');
    const faviconPreview = form.querySelector('#favicon-preview');
    const faviconFeedback = form.querySelector('#favicon-feedback');
    const iconUrlInput = form.querySelector('#shortcut-icon-url');
    let finalIcon = this.getDefaultIconSVG(); // Store final icon URL/SVG

    // --- Combined Icon Logic (URL Input / Favicon Fetch) ---
    const updateIcon = async () => {
        const manualIconUrl = iconUrlInput.value.trim();
        const shortcutUrl = urlInput.value.trim();

        faviconPreview.style.display = 'none';
        faviconFeedback.textContent = '';

        if (manualIconUrl) {
            // Prioritize manual URL
            // Basic validation: check if it looks like an image URL (ends with common extension)
            if (/\.(jpg|jpeg|png|gif|svg|webp|ico)$/i.test(manualIconUrl)) {
                finalIcon = manualIconUrl;
                faviconPreview.src = finalIcon;
                faviconPreview.style.display = 'inline-block';
                faviconFeedback.textContent = 'Using provided icon URL.';
            } else {
                finalIcon = this.getDefaultIconSVG();
                faviconFeedback.textContent = 'Invalid icon URL format. Using default.';
            }
        } else if (shortcutUrl) {
            // Fallback to fetching favicon from shortcut URL
            finalIcon = await this.fetchFavicon(shortcutUrl);
            if (finalIcon.startsWith('http')) {
                faviconPreview.src = finalIcon;
                faviconPreview.style.display = 'inline-block';
                faviconFeedback.textContent = 'Favicon preview';
            } else {
                faviconFeedback.textContent = 'Favicon not found, using default.';
            }
        } else {
            // No URLs provided, use default
            finalIcon = this.getDefaultIconSVG();
            faviconFeedback.textContent = 'Enter URL to fetch favicon.';
        }
        
        // Auto-fill name if empty (optional) - Keep this part
        if (!nameInput.value && shortcutUrl && !shortcutUrl.startsWith('http') && shortcutUrl.includes('.')) {
             try { nameInput.value = new URL(`https://${shortcutUrl}`).hostname.split('.')[0]; } catch {}
        }
    };

    let debounceTimer;
    urlInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(updateIcon, 500); // Update icon based on main URL change
    });
    iconUrlInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(updateIcon, 500); // Update icon based on icon URL change
    });
    // --- End Combined Icon Logic ---

    form.querySelector('#cancel-add-shortcut').addEventListener('click', () => {
      form.remove();
    });
    
    form.querySelector('#save-add-shortcut').addEventListener('click', async () => {
      if (!window.shortcutManager) {
         console.error('ShortcutManager not available for saving.');
         alert('Error: Cannot save shortcut. Shortcut manager not loaded.');
         return;
      }
      
      const name = nameInput.value.trim();
      let url = urlInput.value.trim();
      
      if (name && url) {
        // Ensure URL has protocol
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        // Use the potentially fetched/provided icon URL/SVG stored in finalIcon
        const newShortcut = {
          name,
          url,
          icon: finalIcon || this.getDefaultIconSVG() // Use finalIcon
        };
        
        window.shortcutManager.addShortcut(newShortcut);
        form.remove();
        this.populateShortcutsEditor(); // Refresh list
      } else {
          alert('Please provide both a name and a valid URL.');
      }
    });
    
    // Add/Update form styles
    const styleId = 'shortcut-form-styles';
    let style = document.getElementById(styleId);
    if (!style) {
        style = document.createElement('style');
        style.id = styleId;
        document.head.appendChild(style);
    }
    style.textContent = `
      .shortcut-form { padding: 15px; background: rgba(13, 22, 35, 0.8); border: var(--widget-border); border-radius: 8px; margin-top: 15px; }
      .form-group { margin-bottom: 15px; }
      .form-group label { display: block; margin-bottom: 5px; color: var(--text-secondary); }
      .form-group input { width: 100%; background: rgba(13, 22, 35, 0.5); border: var(--widget-border); border-radius: 4px; padding: 8px; color: var(--text-color); font-family: var(--primary-font); }
      .form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
      .form-actions button { padding: 8px 15px; border-radius: 4px; border: var(--widget-border); background: rgba(0, 229, 255, 0.1); color: var(--text-color); font-family: var(--primary-font); cursor: pointer; transition: all var(--transition-speed); }
      .form-actions button:hover { background: rgba(0, 229, 255, 0.2); }
      #save-add-shortcut { background: rgba(0, 255, 157, 0.1); }
      #save-add-shortcut:hover { background: rgba(0, 255, 157, 0.2); }
    `;
  }
  
  showEditShortcutForm(shortcut) {
     // Prevent multiple forms
    if (this.shortcutsEditor.querySelector('.shortcut-form')) {
        this.shortcutsEditor.querySelector('.shortcut-form').remove(); // Remove existing form
    }
    
    const isPluginShortcut = shortcut.url && shortcut.url.startsWith('plugins/');
    console.log(`Editing shortcut: ${shortcut.name}, Is Plugin: ${isPluginShortcut}`);

    const form = document.createElement('div');
    form.className = 'shortcut-form';
    // Use current icon (could be URL or SVG) for initial preview
    let initialIconPreview = '';
    // For plugins, we don't show a preview in the form as it's auto-detected
    if (!isPluginShortcut && shortcut.icon && shortcut.icon.startsWith('http')) { 
        initialIconPreview = `<img id="favicon-preview" src="${shortcut.icon}" alt="Favicon Preview" width="16" height="16" style="margin-left: 10px; vertical-align: middle;">`;
    } 

    // Determine initial Icon URL value (only for non-plugins)
    const initialIconUrl = (!isPluginShortcut && shortcut.icon && shortcut.icon.startsWith('http')) ? shortcut.icon : '';

    form.innerHTML = `
      <h3>Edit Shortcut ${isPluginShortcut ? '(Plugin)' : ''}</h3>
      <div class="form-group">
        <label for="shortcut-name-edit">Name</label>
        <input type="text" id="shortcut-name-edit" value="${shortcut.name}">
      </div>
      <div class="form-group">
        <label for="shortcut-url-edit">URL ${isPluginShortcut ? '(Cannot be changed)' : ''}</label>
        <input type="text" id="shortcut-url-edit" value="${shortcut.url}" ${isPluginShortcut ? 'disabled' : ''}>
        ${initialIconPreview} <!-- Display initial preview (only non-plugin) -->
        <small id="favicon-feedback-edit" style="display: block; margin-top: 5px; opacity: 0.7;"></small>
      </div>
      <div class="form-group"> <!-- Always show for both, label changes based on type -->
        <label for="shortcut-icon-url-edit">${isPluginShortcut ? 'Custom Icon URL (Optional)' : 'Icon URL (Optional)'}</label>
        <input type="text" id="shortcut-icon-url-edit" 
               placeholder="${isPluginShortcut ? 'Leave blank for default (/icon.png)' : 'Paste direct image URL here'}" 
               value="${(isPluginShortcut ? shortcut.icon : initialIconUrl) || ''}">
      </div>
      <div class="form-actions">
        <button id="cancel-edit-shortcut" type="button">Cancel</button>
        <button id="save-edit-shortcut" type="button" data-id="${shortcut.id}">Save</button>
      </div>
    `;
    
    // Insert form after the item being edited or at the end
    const currentItemElement = this.shortcutsEditor.querySelector(`.shortcut-edit-item[data-id="${shortcut.id}"]`);
    if (currentItemElement) {
        currentItemElement.parentNode.insertBefore(form, currentItemElement.nextSibling);
    } else {
        this.shortcutsEditor.appendChild(form); // Fallback
    }

    const urlInput = form.querySelector('#shortcut-url-edit');
    const nameInput = form.querySelector('#shortcut-name-edit');
    let faviconPreview = form.querySelector('#favicon-preview'); // Use let as it might be created
    const faviconFeedback = form.querySelector('#favicon-feedback-edit');
    const iconUrlInput = form.querySelector('#shortcut-icon-url-edit');
    let finalIcon = shortcut.icon; // Start with current icon

    // Only run FAVICON fetching logic if it's NOT a plugin shortcut
    if (!isPluginShortcut) {
      // --- Combined Icon Logic (Edit - similar to add form) ---
      const updateIconEdit = async () => {
          const manualIconUrl = iconUrlInput.value.trim();
          const shortcutUrl = urlInput.value.trim();
          let previewElement = form.querySelector('#favicon-preview'); // Re-select
          
          // Create preview if it doesn't exist
          if (!previewElement && (manualIconUrl || shortcutUrl)) { 
              previewElement = document.createElement('img');
              previewElement.id = 'favicon-preview';
              previewElement.alt = 'Icon Preview';
              previewElement.width = 16; previewElement.height = 16;
              previewElement.style.marginLeft = '10px'; previewElement.style.verticalAlign = 'middle';
              // Ensure it's appended to the correct parent (the one with the URL input)
              urlInput.parentNode.appendChild(previewElement);
          }
          
          if (previewElement) previewElement.style.display = 'none';
          faviconFeedback.textContent = '';

          if (manualIconUrl) {
              if (/\.(jpg|jpeg|png|gif|svg|webp|ico)$/i.test(manualIconUrl)) {
                  finalIcon = manualIconUrl;
                  if(previewElement) {
                    previewElement.src = finalIcon;
                    previewElement.style.display = 'inline-block';
                  }
                  faviconFeedback.textContent = 'Using provided icon URL.';
              } else {
                  finalIcon = this.getDefaultIconSVG(); // Non-plugins fall back to default SVG
                  faviconFeedback.textContent = 'Invalid icon URL format. Using default.';
              }
          } else if (shortcutUrl) {
              finalIcon = await this.fetchFavicon(shortcutUrl);
              if (finalIcon.startsWith('http')) {
                  if(previewElement) {
                      previewElement.src = finalIcon;
                      previewElement.style.display = 'inline-block';
                  }
                  faviconFeedback.textContent = 'Favicon preview';
              } else {
                   finalIcon = this.getDefaultIconSVG(); // Ensure default if fetch fails
                  faviconFeedback.textContent = 'Favicon not found, using default.';
              }
          } else {
              finalIcon = this.getDefaultIconSVG();
              faviconFeedback.textContent = 'Enter URL to fetch favicon.';
          }
      };

      let debounceTimerEdit;
      urlInput.addEventListener('input', () => {
          clearTimeout(debounceTimerEdit);
          debounceTimerEdit = setTimeout(updateIconEdit, 500); 
      });
      iconUrlInput.addEventListener('input', () => {
          clearTimeout(debounceTimerEdit);
          debounceTimerEdit = setTimeout(updateIconEdit, 500); 
      });
      // Trigger initial update in case pre-filled URL is valid
      updateIconEdit(); 
      // --- End Combined Icon Logic (Edit) ---
    }
    
    form.querySelector('#cancel-edit-shortcut').addEventListener('click', () => {
      form.remove();
    });
    
    form.querySelector('#save-edit-shortcut').addEventListener('click', (e) => {
      if (!window.shortcutManager) {
         console.error('ShortcutManager not available for saving edit.');
         alert('Error: Cannot save shortcut edit. Shortcut manager not loaded.');
         return;
      }
      
      const id = e.target.dataset.id;
      const originalShortcut = window.shortcutManager.shortcuts.find(s => s.id === id);
      const isPlugin = originalShortcut && originalShortcut.url.startsWith('plugins/');
      
      const name = nameInput.value.trim();
      let url = urlInput.value.trim(); // Get potentially edited URL
      let icon = null; // Default to null, set below

      if (!name) {
          alert('Please provide a name.');
          return;
      }
      
      if (isPlugin) {
          // For plugins, ONLY update the name and optional custom icon URL.
          console.log('Saving plugin shortcut edit (name and maybe icon URL).');
          url = originalShortcut.url; // Keep original URL
          // Get value from the (now visible) icon URL input
          const customPluginIconUrl = iconUrlInput ? iconUrlInput.value.trim() : null;
          icon = customPluginIconUrl || null; // Store the custom URL or null if empty
      } else {
          // For regular shortcuts, ensure URL is valid and has protocol
          if (!url) {
             alert('Please provide a valid URL.');
             return;
          }
          if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('chrome://')) {
              url = 'https://' + url;
          }
          // Use the icon determined by the form logic (finalIcon variable updated by updateIconEdit)
          icon = finalIcon || this.getDefaultIconSVG(); 
      }
        
      // Call update method on shortcutManager
      const success = window.shortcutManager.updateShortcut(id, {
          name,
          url, // Use the corrected/original URL
          icon: icon // Use the determined/null icon
      });
        
      if (success) {
          form.remove();
          this.populateShortcutsEditor(); // Refresh list
      } else {
          console.error(`Failed to update shortcut with ID ${id}.`);
          alert('Error: Could not update shortcut.');
      }
    });
  }
  
  // --- Add method for feedback ---
  showSaveFeedback() {
    if (!this.settingsToggle) return;
    this.settingsToggle.classList.add('saved-feedback');
    setTimeout(() => {
        if (this.settingsToggle) { // Check if element still exists
           this.settingsToggle.classList.remove('saved-feedback');
        }
    }, 1000); // Remove feedback after 1 second
  }
  // --- End feedback method ---
  
  // --- New Function: Apply Widget Visibility ---
  applyWidgetVisibility() {
      console.log("Applying widget visibility settings:", this.settings);
      this.widgetToggleCheckboxes.forEach(checkbox => {
          const widgetId = checkbox.dataset.widgetId;
          const settingKey = `show${checkbox.id.split('-')[1].charAt(0).toUpperCase() + checkbox.id.split('-')[1].slice(1)}`;
          const widgetElement = document.getElementById(widgetId);

          // Update checkbox state based on loaded settings
          checkbox.checked = !!this.settings[settingKey]; // Use !! to ensure boolean

          // Toggle widget visibility class
          if (widgetElement) {
              widgetElement.classList.toggle('widget-hidden', !this.settings[settingKey]);
              console.log(`Widget ${widgetId} hidden: ${!this.settings[settingKey]}`);
          } else {
              console.warn(`Widget element with ID '${widgetId}' not found for visibility toggle.`);
          }
      });
  }
  // --- End Function ---

  // --- Export Data Function ---
  exportData() {
      console.log('Exporting data...');
      if (!window.shortcutManager || !window.taskManager) {
          alert('Error: Cannot export data. Required components not loaded.');
          console.error('ShortcutManager or TaskManager not available for export.');
          return;
      }
      try {
          const backupData = {
              settings: this.settings,
              shortcuts: window.shortcutManager.shortcuts || [],
              tasks: window.taskManager.tasks || []
          };
          
          const jsonString = JSON.stringify(backupData, null, 2); // Pretty print JSON
          const blob = new Blob([jsonString], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          
          const link = document.createElement('a');
          link.href = url;
          const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
          link.download = `hackerspace_backup_${timestamp}.json`;
          document.body.appendChild(link); // Required for Firefox
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          console.log('Data exported successfully.');
      } catch (error) {
          console.error('Error during data export:', error);
          alert('An error occurred while exporting data. Check the console for details.');
      }
  }
  // --- End Export ---

  // --- Import Data Function ---
  handleImportFile(event) {
      console.log('Handling file import...');
      const file = event.target.files[0];
      if (!file) {
          console.log('No file selected.');
          return;
      }
      if (file.type !== 'application/json') {
          alert('Invalid file type. Please select a .json file exported from HackerSpace.');
          event.target.value = null; // Reset file input
          return;
      }

      const reader = new FileReader();

      reader.onload = (e) => {
          try {
              const importedData = JSON.parse(e.target.result);
              console.log('Parsed imported data:', importedData);

              // Basic Validation
              if (!importedData || typeof importedData !== 'object' || 
                  !importedData.settings || !Array.isArray(importedData.shortcuts) || !Array.isArray(importedData.tasks)) {
                  throw new Error('Invalid JSON structure. Missing required keys (settings, shortcuts, tasks) or incorrect types.');
              }

              if (!window.shortcutManager || !window.taskManager) {
                  throw new Error('Cannot import data. Required components (ShortcutManager, TaskManager) not loaded.');
              }

              // Confirmation
              if (!confirm('Importing this file will OVERWRITE your current settings, shortcuts, and tasks. Are you sure you want to proceed?')) {
                  event.target.value = null; // Reset file input if cancelled
                  return;
              }

              // Apply Imported Data
              console.log('Applying imported data...');
              // Merge imported settings with defaults to ensure all expected keys are present
              this.settings = { ...this.defaultSettings, ...importedData.settings };
              window.shortcutManager.shortcuts = importedData.shortcuts;
              window.taskManager.tasks = importedData.tasks;
              
              // --- Important: Ensure imported shortcuts/tasks have IDs ---
              // (Run the same ID safeguard logic as in loadShortcuts/loadTasks if necessary)
              let shortcutsUpdated = false;
              window.shortcutManager.shortcuts.forEach(sc => {
                  if (!sc.id) { sc.id = 'imported-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7); shortcutsUpdated = true; }
                  if (!sc.name) sc.name = 'Imported Shortcut';
                  if (!sc.url) sc.url = '#';
              });
              let tasksUpdated = false;
              window.taskManager.tasks.forEach(t => {
                  if (!t.id) { t.id = 'imported-task-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7); tasksUpdated = true; }
                  if (!t.text) t.text = 'Imported Task';
                  if (typeof t.completed === 'undefined') t.completed = false;
                  if (!t.createdAt) t.createdAt = new Date().toISOString();
              });
              // --- End ID Safeguard ---

              // Save all data
              this.saveSettings();
              window.shortcutManager.saveShortcuts();
              window.taskManager.saveTasks();

              // Apply settings and re-render UI
              this.applySettings(); // Applies theme, sliders, widget visibility
              window.shortcutManager.renderShortcuts(); // Render imported shortcuts
              window.taskManager.renderTasks(); // Render imported tasks
              this.populateShortcutsEditor(); // Update settings panel view
              
              alert('Data imported successfully!');

          } catch (error) {
              console.error('Error processing imported file:', error);
              alert(`Error importing data: ${error.message}. Check console for details.`);
          } finally {
              // Reset file input regardless of success/failure
              event.target.value = null;
          }
      };

      reader.onerror = (e) => {
          console.error('Error reading import file:', e);
          alert('Error reading the selected file.');
          event.target.value = null; // Reset file input
      };

      reader.readAsText(file);
  }
  // --- End Import ---

  // --- Add Plugin Shortcut Function ---
  handleAddPluginShortcut() {
      if (!this.pluginNameInput || !window.shortcutManager) {
          alert('Error: Cannot add plugin shortcut. Input or ShortcutManager missing.');
          console.error('Plugin input or ShortcutManager not available.');
          return;
      }

      const folderName = this.pluginNameInput.value.trim();
      if (!folderName) {
          alert('Please enter the plugin folder name.');
          return;
      }

      // Basic validation - avoid potentially problematic characters like / .. \ etc.
      if (/[\\/\.]/.test(folderName)) { 
          alert('Invalid folder name. Please use only the direct subfolder name inside /plugins/. Avoid slashes or dots.');
          return;
      }
      
      const customIconUrl = this.pluginIconUrlInput ? this.pluginIconUrlInput.value.trim() : null;
      
      console.log(`Attempting to add plugin shortcut for folder: ${folderName}, Custom Icon: ${customIconUrl || 'None'}`);

      // Construct paths (relative to extension root)
      const basePath = `plugins/${folderName}/`;
      const htmlUrl = `${basePath}index.html`;

      const newShortcut = {
          id: `plugin-${folderName}-${Date.now()}`, // Ensure unique ID
          name: folderName, // Use folder name as shortcut name
          url: htmlUrl,
          icon: customIconUrl || null, // Store custom URL or null
          isPlugin: true // Flag to identify these
      };

      console.log('Adding plugin shortcut:', newShortcut);

      window.shortcutManager.addShortcut(newShortcut);
      this.populateShortcutsEditor(); // Refresh settings view
      this.pluginNameInput.value = ''; // Clear input
      if (this.pluginIconUrlInput) this.pluginIconUrlInput.value = ''; // Clear icon input
      alert(`Plugin shortcut for '${folderName}' added! Make sure the folder and index.html exist.`);
  }
  // --- End Add Plugin ---
}

// Initialize settings manager when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  window.settingsManager = new SettingsManager();
}); 