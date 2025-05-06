// Universe background with planets using Three.js (More Realistic)
class UniverseAnimation {
    constructor() {
        this.canvas = document.getElementById('background-canvas');
        if (!this.canvas) {
            console.error("UniverseAnimation: Canvas not found!");
            return;
        }
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 5000); // Increased far plane
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true });
        
        this.planets = [];
        this.starsBackground = null; // Skysphere
        this.sun = null;
        this.clock = new THREE.Clock();
        this.textureLoader = new THREE.TextureLoader();
        this.loadedTextures = {}; // Store loaded textures to dispose later
        
        this.handleResize = this.onWindowResize.bind(this);
        this.animationFrameId = null;
        this.controls = null; // OrbitControls instance
        
        this.init();
    }
    
    async init() { // Make init async to handle texture loading
        console.log("Initializing Realistic Universe Animation...");
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true; // Enable shadows for more realism
        this.camera.position.set(0, 20, 70); // Start further back

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x333333); // Dimmer ambient
        this.scene.add(ambientLight);
        const sunLight = new THREE.PointLight(0xffffff, 3.0, 3000); // Stronger central light
        sunLight.position.set(0, 0, 0);
        sunLight.castShadow = true; // Sun casts shadow
        this.scene.add(sunLight);
        this.centralLight = sunLight; 
        
        // Controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true; // Smooth camera movement
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false; // Keep panning relative to origin
        this.controls.minDistance = 5;
        this.controls.maxDistance = 500;

        // Load textures and create objects
        try {
            await this.loadAllTextures(); // Wait for textures
            this.createSkysphere(); 
            this.createSun();
            this.createPlanets();
        } catch (error) {
            console.error("Failed to initialize universe objects:", error);
            // Handle error, maybe show a fallback?
        }
        
        // Event Listeners
        window.addEventListener('resize', this.handleResize);
        // OrbitControls handles mouse/touch input
        
        // Start animation loop
        this.animate();
        console.log("Realistic Universe Animation Initialized.");
    }

    // --- Texture Loading --- 
    async loadTexture(path) {
        return new Promise((resolve, reject) => {
            console.log("Loading texture:", path);
            this.textureLoader.load(path, 
                (texture) => {
                    console.log("Loaded:", path);
                    this.loadedTextures[path] = texture; // Store for disposal
                    resolve(texture);
                }, 
                undefined, // onProgress callback (optional)
                (err) => { 
                    console.error(`Failed to load texture: ${path}`, err);
                    reject(err); 
                }
            );
        });
    }

    async loadAllTextures() {
        // Define texture paths (relative to extension root)
        const texturePaths = {
            sky: 'assets/textures/stars_milky_way.jpg', 
            sun: 'assets/textures/sun.jpg',
            mercury: 'assets/textures/mercury.jpg',
            venus: 'assets/textures/venus.jpg',
            earth: 'assets/textures/earth_day.jpg',
            mars: 'assets/textures/mars.jpg',
            jupiter: 'assets/textures/jupiter.jpg',
            saturn: 'assets/textures/saturn.jpg',
            rings: 'assets/textures/saturn_rings.png'
            // Add Uranus, Neptune if desired
        };
        
        const promises = [];
        for (const key in texturePaths) {
            promises.push(this.loadTexture(texturePaths[key]).then(texture => ({ key, texture })));
        }
        
        const results = await Promise.all(promises);
        // Store textures in a more accessible way if needed, e.g., this.textures.sun = ...
        results.forEach(result => {
            this[result.key + 'Texture'] = result.texture; // e.g., this.sunTexture
        });
        console.log('All textures loaded.');
    }
    // --- End Texture Loading ---

    createSkysphere() {
        if (!this.skyTexture) return;
        const geometry = new THREE.SphereGeometry(1500, 60, 40); // Large sphere
        geometry.scale(-1, 1, 1); // Invert geometry to map texture inside
        const material = new THREE.MeshBasicMaterial({ map: this.skyTexture });
        this.starsBackground = new THREE.Mesh(geometry, material);
        this.scene.add(this.starsBackground);
    }

     createSun() {
        if (!this.sunTexture) return;
        const geometry = new THREE.SphereGeometry(5, 32, 32); // Sun size
        // Use MeshBasicMaterial as it's the light source, not affected by scene light
        const material = new THREE.MeshBasicMaterial({ 
            map: this.sunTexture, 
            // emissive: 0xffff00, // Optional: add glow effect
            // emissiveIntensity: 0.5
        }); 
        this.sun = new THREE.Mesh(geometry, material);
        this.sun.position.set(0, 0, 0); // Position at the center
        this.scene.add(this.sun);
    }
    
    createPlanets() {
        const planetData = [
            { key: 'mercury', size: 0.8, distance: 10, speed: 0.1 },
            { key: 'venus', size: 1.2, distance: 16, speed: 0.07 },
            { key: 'earth', size: 1.3, distance: 24, speed: 0.05 },
            { key: 'mars', size: 1.0, distance: 35, speed: 0.04 },
            { key: 'jupiter', size: 3.5, distance: 60, speed: 0.02 },
            { key: 'saturn', size: 3.0, distance: 90, speed: 0.015, hasRings: true },
        ];

        planetData.forEach(data => {
            const texture = this[data.key + 'Texture'];
            if (!texture) {
                console.warn(`Texture not loaded for ${data.key}, skipping planet.`);
                return;
            }

            const geometry = new THREE.SphereGeometry(data.size, 32, 32);
            const material = new THREE.MeshStandardMaterial({ 
                map: texture, 
                roughness: 0.9, 
                metalness: 0.1 
            });
            const planet = new THREE.Mesh(geometry, material);
            planet.castShadow = true;    // Planet casts shadow
            planet.receiveShadow = true; // Planet receives shadow

            const pivot = new THREE.Object3D();
            this.scene.add(pivot);
            pivot.add(planet);
            planet.position.x = data.distance;
            pivot.rotation.y = Math.random() * Math.PI * 2;
            pivot.rotation.x = (Math.random() - 0.5) * 0.05; // Slight orbital tilt

            // Add Rings for Saturn
            let ringsMesh = null;
            if (data.hasRings && this.ringsTexture) {
                const ringGeometry = new THREE.RingGeometry(data.size * 1.2, data.size * 2.2, 64);
                // Rotate ring geometry to be flat along XZ plane
                ringGeometry.rotateX(-Math.PI / 2);
                const ringMaterial = new THREE.MeshBasicMaterial({ 
                    map: this.ringsTexture, 
                    side: THREE.DoubleSide, // Render both sides
                    transparent: true, 
                    alphaTest: 0.01 // Adjust based on texture transparency
                });
                ringsMesh = new THREE.Mesh(ringGeometry, ringMaterial);
                ringsMesh.receiveShadow = true; // Rings can receive shadows (e.g., from planet)
                // Add rings directly to the planet mesh so they rotate together
                planet.add(ringsMesh); 
            }

            this.planets.push({ 
                key: data.key,
                mesh: planet, 
                pivot: pivot, 
                speed: data.speed, 
                distance: data.distance, 
                rings: ringsMesh 
            });
        });
    }
    
    animate() {
        this.animationFrameId = requestAnimationFrame(() => this.animate());
        
        const delta = this.clock.getDelta();
        
        // Animate Planets
        this.planets.forEach(p => {
            p.pivot.rotation.y += p.speed * delta * 2; // Orbit
            p.mesh.rotation.y += delta * 0.1; // Self-rotation
        });

        // Rotate sun slowly
        if (this.sun) {
            this.sun.rotation.y += delta * 0.01;
        }
        
        // Update OrbitControls
        this.controls.update();
        
        this.renderer.render(this.scene, this.camera);
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    destroy() {
        console.log("Destroying Realistic Universe Animation...");
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        window.removeEventListener('resize', this.handleResize);
        
        // Dispose controls
        if (this.controls) {
            this.controls.dispose();
            this.controls = null;
        }

        // Dispose textures
        for (const path in this.loadedTextures) {
            console.log("Disposing texture:", path);
            this.loadedTextures[path].dispose();
        }
        this.loadedTextures = {};

        if (this.scene) {
            this.scene.traverse((object) => {
                if (object.geometry) object.geometry.dispose();
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
            this.renderer.domElement = null; 
            this.renderer = null;
        }
        this.planets = [];
        this.starsBackground = null;
        this.sun = null;
        this.scene = null;
        this.camera = null;
        this.clock = null;
        this.centralLight = null;
        console.log("Realistic Universe Animation Destroyed.");
    }

    // --- Settings Methods (Placeholders - connect if needed) ---
    setAnimationSpeed(speedValue) { 
        // Map 0-100 to orbit speed multiplier?
        const speedFactor = 0.5 + (speedValue / 100) * 2.5; // Map to 0.5 - 3.0 range
        this.planets.forEach(p => { 
             // Need to store base speed separately to apply multiplier correctly
             // p.speed = p.baseSpeed * speedFactor;
         });
        console.log(`Universe: setAnimationSpeed called with ${speedValue}`);
    }
    setParticleDensity(densityValue) {
        // Could potentially regenerate stars with different density
         console.log(`Universe: setParticleDensity called with ${densityValue}`);
    }
    setPhysicsIntensity(intensityValue) {
        console.log(`Universe: setPhysicsIntensity called with ${intensityValue}`);
    }
    // --- End Settings --- 
} 