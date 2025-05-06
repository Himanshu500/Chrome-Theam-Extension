// Manages loading, unloading, and switching between different background/foreground animations
class AnimationManager {
    constructor() {
        console.log('AnimationManager initializing...');
        this.activeForegroundAnim = null;
        this.activeBackgroundAnim = null;
        this.foregroundCanvas = document.getElementById('particles-canvas');
        this.backgroundCanvas = document.getElementById('background-canvas');

        if (!this.foregroundCanvas || !this.backgroundCanvas) {
            console.error('Animation canvases not found!');
            return;
        }
        
        // Initially hide canvases until animations load
        this.foregroundCanvas.style.display = 'none';
        this.backgroundCanvas.style.display = 'none';
        
        // Load initial animations based on settings (requires settings to be loaded first)
        this.loadInitialAnimations();
    }

    async loadInitialAnimations() {
        // Wait for settings to potentially load from storage
        // A better approach might use explicit events or promises, but setTimeout is simpler for now
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
        
        const settings = window.settingsManager?.settings;
        if (!settings) {
            console.error('Settings not available for initial animation load.');
            // Fallback to defaults if settings failed to load
            this.switchForegroundAnimation('physics'); 
            this.switchBackgroundAnimation('starfield');
            return;
        }
        
        console.log('Loading initial animations based on settings:', settings);
        this.switchForegroundAnimation(settings.foregroundAnimationType || 'physics');
        this.switchBackgroundAnimation(settings.backgroundAnimationType || 'starfield');
    }

    switchForegroundAnimation(type) {
        console.log(`Switching foreground animation to: ${type}`);
        // Destroy existing foreground animation
        if (this.activeForegroundAnim && typeof this.activeForegroundAnim.destroy === 'function') {
            this.activeForegroundAnim.destroy();
        }
        this.activeForegroundAnim = null;
        this.foregroundCanvas.style.display = 'none'; // Hide canvas

        // Initialize new animation
        switch (type) {
            case 'physics':
                if (typeof ParticleSystem !== 'undefined') {
                    if (typeof Matter === 'undefined') {
                        console.error("Matter.js library not loaded! Cannot init Physics Particles.");
                        break;
                    }
                    this.activeForegroundAnim = new ParticleSystem();
                    window.activeForegroundAnim = this.activeForegroundAnim; // Expose globally if needed by settings
                    this.foregroundCanvas.style.display = 'block';
                } else {
                    console.error('ParticleSystem class not defined.');
                }
                break;
            case 'matrix':
                 if (typeof MatrixRain !== 'undefined') {
                    this.activeForegroundAnim = new MatrixRain(this.foregroundCanvas); // Pass canvas
                    window.activeForegroundAnim = this.activeForegroundAnim;
                    this.foregroundCanvas.style.display = 'block';
                } else {
                    console.error('MatrixRain class not defined.');
                }
                break;
            case 'none':
            default:
                console.log('No foreground animation selected.');
                break;
        }
        // Re-apply current settings to the new animation if applicable
        this.applyCurrentSettingsToAnimation(this.activeForegroundAnim);
    }

    switchBackgroundAnimation(type) {
        console.log(`Switching background animation to: ${type}`);
        // Destroy existing background animation
        if (this.activeBackgroundAnim && typeof this.activeBackgroundAnim.destroy === 'function') {
            this.activeBackgroundAnim.destroy();
        }
        this.activeBackgroundAnim = null;
        this.backgroundCanvas.style.display = 'none'; // Hide canvas

        // Initialize new animation
        switch (type) {
            case 'starfield':
                if (typeof BackgroundAnimation !== 'undefined') {
                     if (typeof THREE === 'undefined') {
                        console.error("Three.js library not loaded! Cannot init Starfield.");
                        break;
                    }
                    this.activeBackgroundAnim = new BackgroundAnimation();
                    window.activeBackgroundAnim = this.activeBackgroundAnim; // Expose globally
                    this.backgroundCanvas.style.display = 'block';
                } else {
                    console.error('BackgroundAnimation class not defined.');
                }
                break;
            case 'universe':
                if (typeof UniverseAnimation !== 'undefined') {
                     if (typeof THREE === 'undefined') {
                        console.error("Three.js library not loaded! Cannot init Universe.");
                        break;
                    }
                    this.activeBackgroundAnim = new UniverseAnimation();
                    window.activeBackgroundAnim = this.activeBackgroundAnim; // Expose globally
                    this.backgroundCanvas.style.display = 'block';
                } else {
                    console.error('UniverseAnimation class not defined.');
                }
                break;
            case 'none':
            default:
                console.log('No background animation selected.');
                break;
        }
         // Re-apply current settings to the new animation if applicable
        this.applyCurrentSettingsToAnimation(this.activeBackgroundAnim);
    }
    
    // Helper to apply relevant settings to a newly loaded animation
    applyCurrentSettingsToAnimation(animationInstance) {
        if (!animationInstance || !window.settingsManager || !window.settingsManager.settings) return;
        
        const settings = window.settingsManager.settings;
        
        console.log('Applying current settings to new animation:', animationInstance.constructor.name);

        // Apply relevant settings if the instance has the corresponding method
        if (typeof animationInstance.setParticleDensity === 'function') {
            animationInstance.setParticleDensity(settings.particleDensity);
        }
        if (typeof animationInstance.setAnimationSpeed === 'function') {
            animationInstance.setAnimationSpeed(settings.animationSpeed);
        }
        if (typeof animationInstance.setPhysicsIntensity === 'function') {
            animationInstance.setPhysicsIntensity(settings.physicsIntensity);
        }
        // Add more settings application here as needed (e.g., Matrix speed, Star density etc.)
         if (typeof animationInstance.setMatrixSpeed === 'function') { // Example for Matrix
             // Need to add 'matrixSpeed' setting if implementing this
             // animationInstance.setMatrixSpeed(settings.matrixSpeed || 50);
         }
    }
}

// Initialize the manager after the DOM is loaded and settings are likely available
window.addEventListener('DOMContentLoaded', () => {
    // Ensure settings manager is initialized first if it isn't already guaranteed
    if (!window.settingsManager) {
         console.warn('SettingsManager not ready, attempting to initialize...');
         window.settingsManager = new SettingsManager();
    }
    window.animationManager = new AnimationManager();
}); 