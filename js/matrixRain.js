// Matrix Digital Rain effect for a 2D canvas
class MatrixRain {
    constructor(canvas) {
        if (!canvas) {
            console.error('MatrixRain requires a canvas element.');
            return;
        }
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        this.cols = 0; // Determined on resize
        this.ypos = [];
        this.animationFrameId = null;

        // Settings
        this.fontSize = 16;
        this.characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>!@#$%^&*()-+=';
        this.fallSpeedFactor = 0.05; // Lower is slower (chance of advancing each frame)
        this.fadeSpeed = 0.05; // Lower is slower fade

        this.init();
    }

    init() {
        console.log('Initializing Matrix Rain...');
        this.handleResize = this.resizeHandler.bind(this); // Bind for listener removal
        window.addEventListener('resize', this.handleResize);
        this.resizeHandler(); // Initial setup
        this.startAnimation();
        console.log('Matrix Rain Initialized.');
    }

    resizeHandler() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Calculate columns based on font size
        this.cols = Math.floor(this.canvas.width / this.fontSize);
        
        // Initialize y position for each column (start off-screen)
        this.ypos = Array(this.cols).fill(0);
        
        // Set initial canvas background (or clear if needed)
        this.ctx.fillStyle = '#000'; // Use a dark color, not fully black for fading
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    startAnimation() {
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        this.animate();
    }

    animate() {
        // Draw semitransparent black rectangle for fading effect
        this.ctx.fillStyle = `rgba(0, 0, 0, ${this.fadeSpeed})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Set text style
        this.ctx.fillStyle = '#0f0'; // Classic green
        this.ctx.font = `${this.fontSize}px monospace`;

        // Loop through columns
        this.ypos.forEach((y, index) => {
            // Pick random character
            const text = this.characters.charAt(Math.floor(Math.random() * this.characters.length));
            
            // Calculate x position
            const x = index * this.fontSize;
            
            // Draw character
            this.ctx.fillText(text, x, y);

            // Randomly reset column to top (creates gaps/new streams)
            // Adjust the probability (0.99) for more/less frequent streams
            if (y > this.canvas.height && Math.random() > 0.99) {
                this.ypos[index] = 0;
            } else {
                // Move character down (adjust speed with fontSize)
                this.ypos[index] = y + this.fontSize;
            }
        });

        this.animationFrameId = requestAnimationFrame(() => this.animate());
    }
    
    // --- Settings Methods (Examples) ---
    setAnimationSpeed(speedValue) { // speedValue 0-100
        // Map speed to fade speed and fall chance
        // Higher speed = faster fade (higher alpha), faster fall (lower ypos increment probability maybe?)
        // This mapping needs tuning.
        this.fadeSpeed = Math.max(0.01, Math.min(0.2, 0.01 + (speedValue / 100) * 0.19));
        // Fall speed adjustment is tricky with current logic, fontSize affects it.
        // We could adjust the reset probability maybe?
        console.log(`Matrix speed set to ${speedValue}, fadeSpeed: ${this.fadeSpeed.toFixed(3)}`);
    }
    
    // Density might relate to font size or column spacing
    setParticleDensity(densityValue) { // densityValue 0-100
        // Map density to font size (inversely? smaller font = denser look)
        const minFontSize = 8;
        const maxFontSize = 20;
        this.fontSize = Math.round(maxFontSize - (maxFontSize - minFontSize) * (densityValue / 100));
        console.log(`Matrix density set to ${densityValue}, fontSize: ${this.fontSize}`);
        // Need to trigger a resize/reset to apply font size change
        this.resizeHandler();
    }
    // --- End Settings --- 

    destroy() {
        console.log('Destroying Matrix Rain...');
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        window.removeEventListener('resize', this.handleResize);
        // Clear canvas
        if (this.ctx && this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        this.ypos = [];
        console.log('Matrix Rain Destroyed.');
    }
} 