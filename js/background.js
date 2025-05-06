// Space-themed background with Three.js
class BackgroundAnimation {
  constructor() {
    this.canvas = document.getElementById('background-canvas');
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true });
    
    this.stars = [];
    this.nebulae = [];
    this.clock = new THREE.Clock();
    
    this.handleResize = this.onWindowResize.bind(this);
    this.animationFrameId = null;
    
    this.init();
  }
  
  init() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.camera.position.z = 5;
    
    // Add subtle ambient light
    const ambientLight = new THREE.AmbientLight(0x222233);
    this.scene.add(ambientLight);
    
    // Create stars
    this.createStars();
    
    // Create nebula clouds
    this.createNebulae();
    
    // Add event listener for window resize
    window.addEventListener('resize', this.handleResize);
    
    // Start animation loop
    this.animate();
  }
  
  createStars() {
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 2,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });
    
    const starVertices = [];
    const starColors = [];
    const colorOptions = [0xffffff, 0x6bf6ff, 0x00e5ff, 0x00ffff];
    
    for (let i = 0; i < 1000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      
      starVertices.push(x, y, z);
      
      // Random color from options
      const color = new THREE.Color(colorOptions[Math.floor(Math.random() * colorOptions.length)]);
      starColors.push(color.r, color.g, color.b);
    }
    
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
    starMaterial.vertexColors = true;
    
    const stars = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(stars);
    this.stars.push(stars);
  }
  
  createNebulae() {
    // Create subtle nebula-like clouds
    for (let i = 0; i < 5; i++) {
      const nebulaGeometry = new THREE.SphereGeometry(Math.random() * 300 + 100, 32, 32);
      const nebulaMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0x00e5ff),
        transparent: true,
        opacity: 0.03,
        wireframe: true
      });
      
      const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
      
      // Position nebulae at random locations
      nebula.position.set(
        (Math.random() - 0.5) * 1000,
        (Math.random() - 0.5) * 1000,
        (Math.random() - 0.5) * 1000
      );
      
      this.scene.add(nebula);
      this.nebulae.push(nebula);
    }
  }
  
  animate() {
    this.animationFrameId = requestAnimationFrame(() => this.animate());
    
    const delta = this.clock.getDelta();
    
    // Rotate stars slowly
    this.stars.forEach(star => {
      star.rotation.x += 0.0005;
      star.rotation.y += 0.0003;
    });
    
    // Animate nebulae
    this.nebulae.forEach(nebula => {
      nebula.rotation.x += 0.0002;
      nebula.rotation.y += 0.0003;
      
      // Pulsate size slightly
      const pulseFactor = Math.sin(this.clock.getElapsedTime() * 0.2) * 0.05 + 1;
      nebula.scale.set(pulseFactor, pulseFactor, pulseFactor);
    });
    
    // Subtle camera movement
    this.camera.position.x = Math.sin(this.clock.getElapsedTime() * 0.1) * 0.2;
    this.camera.position.y = Math.cos(this.clock.getElapsedTime() * 0.1) * 0.1;
    
    this.renderer.render(this.scene, this.camera);
  }
  
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  destroy() {
    console.log("Destroying Background Animation...");
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    window.removeEventListener('resize', this.handleResize);
    
    if (this.scene) {
      this.scene.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose();
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      while(this.scene.children.length > 0){
        this.scene.remove(this.scene.children[0]);
      }
    }
    
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }

    this.stars = [];
    this.nebulae = [];
    this.scene = null;
    this.camera = null;
    this.clock = null;
    
    if(this.canvas) {
      const ctx = this.canvas.getContext('webgl2') || this.canvas.getContext('webgl');
      if (ctx) {
        // Optionally clear - renderer dispose might handle this
        // ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT);
      }
    }
    console.log("Background Animation Destroyed.");
  }
} 