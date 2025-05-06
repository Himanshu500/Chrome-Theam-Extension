// Interactive particles with Matter.js physics
class ParticleSystem {
  constructor() {
    this.canvas = document.getElementById('particles-canvas');
    if (!this.canvas) {
        console.error("Particle canvas element not found!");
        return; // Stop if canvas doesn't exist
    }
    this.ctx = this.canvas.getContext('2d');
    
    // Set canvas dimensions
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    // Create a Matter.js engine
    this.engine = Matter.Engine.create({
      enableSleeping: false,
      constraintIterations: 3
    });
    
    // Adjust gravity to be very light
    this.engine.gravity.scale = 0.0005;
    
    // Create world
    this.world = this.engine.world;
    
    // Track mouse position
    this.mouse = { x: 0, y: 0 };
    
    // Create an array to store particles
    this.particles = [];
    
    // Create a mouse constraint for interaction
    this.mouseConstraint = Matter.MouseConstraint.create(this.engine, {
      mouse: Matter.Mouse.create(this.canvas),
      constraint: {
        stiffness: 0.2,
        render: { visible: false }
      }
    });
    
    // Add mouse constraint to world
    Matter.Composite.add(this.world, this.mouseConstraint);
    
    // Settings (initial values)
    this.particleDensity = 20; // Start with a density value (e.g., 0-100 scale)
    this.targetParticleCount = this.calculateTargetCount(this.particleDensity);
    this.particleSize = 15;
    this.interactionRadius = 150;
    this.dampingFactor = 0.98;
    
    // Settings for physics - will be adjusted by sliders
    this.basePhysics = {
      timeScale: 1.0, // Normal speed
      attractionForce: 0.001,
      repulsionForce: 0.005,
      frictionAir: 0.02,
      restitution: 0.9
    };
    // Store current scaled values
    this.currentPhysics = { ...this.basePhysics };
    
    this.fluidPhysics = {
      attractionDistance: 200,
      repulsionDistance: 100
    };
    
    this.lastFrameTime = performance.now();
    this.animationFrameId = null; // To store the requestAnimationFrame ID
    
    // Initialize
    this.init();
  }
  
  init() {
    if (!this.canvas) return; // Don't init if canvas failed
    console.log("Initializing Particle System...");
    this.resizeCanvas(); // Initial size set
    this.createBounds();
    this.adjustParticles(); // Create initial particles based on density
    this.addEventListeners();
    
    // Start the animation loop using requestAnimationFrame ONLY
    this.animate(); 
    console.log("Particle System Initialized.");
  }
  
  // Helper to calculate target particle number from density slider (0-100)
  calculateTargetCount(densityValue) {
      // Map density (0-100) to a reasonable particle count range (e.g., 5 to 150)
      // Adjust min/max counts as needed for performance/aesthetics
      const minCount = 5;
      const maxCount = 150; 
      return Math.round(minCount + (maxCount - minCount) * (densityValue / 100));
  }

  createBounds() {
    // Remove existing bounds if any to prevent duplicates on resize/reset
    if (this.bounds) {
      Matter.Composite.remove(this.world, this.bounds);
    }
    const wallThickness = 60;
    const wallOptions = {
      isStatic: true,
      render: { visible: false },
      restitution: 0.7,
      friction: 0.1
    };
    this.bounds = [
      Matter.Bodies.rectangle(this.canvas.width / 2, -wallThickness / 2, this.canvas.width, wallThickness, wallOptions), // Top
      Matter.Bodies.rectangle(this.canvas.width / 2, this.canvas.height + wallThickness / 2, this.canvas.width, wallThickness, wallOptions), // Bottom
      Matter.Bodies.rectangle(-wallThickness / 2, this.canvas.height / 2, wallThickness, this.canvas.height, wallOptions), // Left
      Matter.Bodies.rectangle(this.canvas.width + wallThickness / 2, this.canvas.height / 2, wallThickness, this.canvas.height, wallOptions) // Right
    ];
    Matter.Composite.add(this.world, this.bounds);
  }
  
  // Method to add/remove particles to match target count
  adjustParticles() {
    const currentCount = this.particles.length;
    const targetCount = this.targetParticleCount;

    if (currentCount < targetCount) {
        // Add particles
        for (let i = 0; i < targetCount - currentCount; i++) {
            this.createSingleParticle();
        }
    } else if (currentCount > targetCount) {
        // Remove particles
        const particlesToRemove = this.particles.splice(0, currentCount - targetCount);
        Matter.Composite.remove(this.world, particlesToRemove);
    }
    console.log(`Particle count adjusted: ${this.particles.length}`);
  }

  createSingleParticle() {
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;
      const radius = this.particleSize + (Math.random() * 10 - 5);
      const hue = 180 + Math.random() * 40;
      const color = `hsl(${hue}, 100%, 75%)`;
      
      const particle = Matter.Bodies.circle(x, y, radius, {
        restitution: this.currentPhysics.restitution,
        friction: 0.1,
        frictionAir: this.currentPhysics.frictionAir,
        render: { visible: false },
        collisionFilter: { group: 0, category: 0x0001, mask: 0x0001 }
      });
      
      particle.color = color;
      particle.originalRadius = radius;
      particle.pulsePhase = Math.random() * Math.PI * 2;
      particle.pulseSpeed = 0.05 + Math.random() * 0.05;
      
      this.particles.push(particle);
      Matter.Composite.add(this.world, particle); 
  }
  
  // Method to be called by settings manager
  setParticleDensity(densityValue) {
      this.particleDensity = Math.max(0, Math.min(100, densityValue)); // Clamp 0-100
      this.targetParticleCount = this.calculateTargetCount(this.particleDensity);
      this.adjustParticles();
      console.log(`Particle density set to ${this.particleDensity}, target count: ${this.targetParticleCount}`);
  }
  
  addEventListeners() {
    // Use arrow functions to maintain 'this' context
    this.handleMouseMove = (event) => {
      this.mouse.x = event.clientX;
      this.mouse.y = event.clientY;
    };
    this.handleResize = () => {
        this.resizeCanvas();
        this.createBounds(); // Recreate bounds for new size
        // Optional: reposition particles if needed, though bounds should handle it
    };

    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('resize', this.handleResize);
  }
  
  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    // Update Matter.js render bounds if its renderer were used (not needed here)
    console.log(`Canvas resized to ${this.canvas.width}x${this.canvas.height}`);
  }

  applyFluidPhysics() {
    // Use currentPhysics values for forces
    const attractionForce = this.currentPhysics.attractionForce;
    const repulsionForce = this.currentPhysics.repulsionForce;

    // Apply attraction/repulsion forces between particles
    for (let i = 0; i < this.particles.length; i++) {
      const particleA = this.particles[i];
      
      // Apply mouse influence
      const mouseDistance = Matter.Vector.magnitude(
        Matter.Vector.sub(
          { x: this.mouse.x, y: this.mouse.y }, 
          particleA.position
        )
      );
      
      // If mouse is near particle, attract it
      if (mouseDistance < this.interactionRadius) {
        const direction = Matter.Vector.normalise(
          Matter.Vector.sub(
            { x: this.mouse.x, y: this.mouse.y }, 
            particleA.position
          )
        );
        
        const force = Matter.Vector.mult(
          direction, 
          0.002 * (this.interactionRadius - mouseDistance)
        );
        
        Matter.Body.applyForce(particleA, particleA.position, force);
      }
      
      // Apply forces between particles
      for (let j = i + 1; j < this.particles.length; j++) {
        const particleB = this.particles[j];
        
        // Calculate distance between particles
        const distance = Matter.Vector.magnitude(
          Matter.Vector.sub(particleA.position, particleB.position)
        );
        
        // Apply attraction/repulsion based on distance
        if (distance < this.fluidPhysics.attractionDistance) {
          // Direction from A to B
          const direction = Matter.Vector.normalise(
            Matter.Vector.sub(particleB.position, particleA.position)
          );
          
          let forceMagnitude;
          // Repulsion when very close
          if (distance < this.fluidPhysics.repulsionDistance) {
            forceMagnitude = -repulsionForce * (1 - distance / this.fluidPhysics.repulsionDistance);
          } 
          // Attraction otherwise
          else {
            forceMagnitude = attractionForce * (1 - distance / this.fluidPhysics.attractionDistance);
          }
          const force = Matter.Vector.mult(direction, forceMagnitude);
          
          // Apply forces to both particles
          Matter.Body.applyForce(particleA, particleA.position, force);
          Matter.Body.applyForce(particleB, particleB.position, Matter.Vector.neg(force));
        }
      }
    }
  }
  
  animate() {
    if (!this.canvas || !this.ctx) return; // Stop if canvas/context lost

    const now = performance.now();
    const deltaTime = (now - this.lastFrameTime); // Delta time in milliseconds
    this.lastFrameTime = now;

    // Clear the canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Apply custom physics forces
    this.applyFluidPhysics();
    
    // Update the Matter.js engine manually
    // Use deltaTime for more stable physics simulation if needed, 
    // but fixed step (1000/60) is often simpler with Matter.js default settings.
    Matter.Engine.update(this.engine, 1000 / 60); 
    
    // Render each particle
    for (const particle of this.particles) {
      // Calculate pulse effect
      particle.pulsePhase += particle.pulseSpeed;
      const pulseFactor = 0.2 * Math.sin(particle.pulsePhase) + 1;
      const renderRadius = particle.originalRadius * pulseFactor;
      
      // Get current position from Matter.js body
      const { x, y } = particle.position;

      // Draw particle glow
      const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, renderRadius * 2);
      gradient.addColorStop(0, particle.color);
      gradient.addColorStop(1, 'rgba(0, 229, 255, 0)');
      this.ctx.beginPath();
      this.ctx.arc(x, y, renderRadius * 1.8, 0, Math.PI * 2);
      this.ctx.fillStyle = gradient;
      this.ctx.fill();
      
      // Draw particle core
      this.ctx.beginPath();
      this.ctx.arc(x, y, renderRadius, 0, Math.PI * 2);
      this.ctx.fillStyle = particle.color;
      this.ctx.fill();
      
      // Draw connections between nearby particles
      for (const otherParticle of this.particles) {
        if (particle === otherParticle) continue;
        const dist = Matter.Vector.magnitude(Matter.Vector.sub(particle.position, otherParticle.position));
        const maxDist = 120; // Connection distance threshold
        if (dist < maxDist) {
          this.ctx.beginPath();
          this.ctx.moveTo(particle.position.x, particle.position.y);
          this.ctx.lineTo(otherParticle.position.x, otherParticle.position.y);
          this.ctx.strokeStyle = `rgba(0, 229, 255, ${1 - dist / maxDist})`; // Fade line with distance
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      }
    }
    
    // Request the next frame
    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  // Method to clean up resources (e.g., if the extension is disabled/reloaded)
  destroy() {
      console.log("Destroying Particle System...");
      if (this.animationFrameId) {
          cancelAnimationFrame(this.animationFrameId);
          this.animationFrameId = null;
      }
      window.removeEventListener('mousemove', this.handleMouseMove);
      window.removeEventListener('resize', this.handleResize);
      if (this.engine) {
          // Clear composites from the world before clearing the engine
          if (this.world) {
              Matter.Composite.clear(this.world, false); // Clear bodies/constraints, keep world structure
          }
          Matter.Engine.clear(this.engine);
          // Optional: Clear the canvas if desired
          if (this.ctx && this.canvas) { 
              this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
          }
      }
      this.particles = [];
      this.world = null;
      this.engine = null;
      this.mouseConstraint = null;
      this.bounds = [];
      console.log("Particle System Destroyed.");
  }

  // --- Methods to control physics parameters --- 
  setAnimationSpeed(speedValue) { // speedValue from 0-100
      // Map 0-100 to a timeScale range, e.g., 0.1 to 2.0
      const minTimeScale = 0.1;
      const maxTimeScale = 2.0;
      this.currentPhysics.timeScale = minTimeScale + (maxTimeScale - minTimeScale) * (speedValue / 100);
      this.engine.timing.timeScale = this.currentPhysics.timeScale;
      console.log(`Animation speed set to ${speedValue}, timeScale: ${this.engine.timing.timeScale}`);
  }

  setPhysicsIntensity(intensityValue) { // intensityValue from 0-100
      // Map 0-100 to multipliers for forces, friction, restitution
      const factor = intensityValue / 50; // 0-100 maps to 0.0 - 2.0 (1.0 is baseline)
      
      // Scale forces (ensure they don't become too extreme)
      this.currentPhysics.attractionForce = this.basePhysics.attractionForce * factor;
      this.currentPhysics.repulsionForce = this.basePhysics.repulsionForce * factor;
      
      // Scale friction and restitution inversely (higher intensity = less friction/more bounce)
      // Clamp values to reasonable ranges
      const baseFriction = this.basePhysics.frictionAir;
      const baseRestitution = this.basePhysics.restitution;
      this.currentPhysics.frictionAir = Math.max(0.001, baseFriction / (1 + factor * 0.5)); // Less friction with intensity
      this.currentPhysics.restitution = Math.min(1.0, baseRestitution * (1 + factor * 0.1)); // More bounce with intensity
      
      // Apply updated friction/restitution to existing particles
      for (const particle of this.particles) {
          // Note: Directly modifying frictionAir/restitution after creation might require Body.set 
          // or might not be fully effective depending on Matter.js version/internals. 
          // A safer approach might be to recreate particles, but let's try direct modification first.
          Matter.Body.set(particle, 'frictionAir', this.currentPhysics.frictionAir);
          Matter.Body.set(particle, 'restitution', this.currentPhysics.restitution);
      }
      console.log(`Physics intensity set to ${intensityValue}, factor: ${factor.toFixed(2)}, frictionAir: ${this.currentPhysics.frictionAir.toFixed(3)}, restitution: ${this.currentPhysics.restitution.toFixed(2)}`);
  }
  // --- End control methods ---
}

// REMOVE Initialization from here - will be handled by AnimationManager
// window.addEventListener('DOMContentLoaded', () => {
//   if (typeof Matter === 'undefined') {
//       console.error("Matter.js library not loaded!");
//       return;
//   }
//   window.particleSystem = new ParticleSystem();
// });

// Optional: Add listener for when the extension is unloaded/reloaded
// This might require background script permissions depending on context
// window.addEventListener('beforeunload', () => {
//     if (window.particleSystem) {
//         window.particleSystem.destroy();
//     }
// }); 