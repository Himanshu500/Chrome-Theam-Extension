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
        
        // Joystick control elements
        this.joystick = null;
        this.joystickActive = false;
        this.joystickPosition = { x: 0, y: 0 };
        this.joystickMoveSpeed = 0.5;
        
        // Camera state saving
        this.savedStates = {};
        this.stateButtons = null;
        
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
        
        // Create joystick
        this.createJoystick();
        
        // Create state management buttons
        this.createStateControls();
        
        // Load saved states from localStorage
        this.loadSavedStates();
        
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
            
            // Create a loader with better timeout handling
            const loader = new THREE.TextureLoader();
            
            // Set timeout to detect if loading takes too long (potentially missing file)
            const timeoutId = setTimeout(() => {
                console.warn(`Texture loading timeout for: ${path}`);
            }, 5000); // 5 second timeout
            
            loader.load(
                path, 
                (texture) => {
                    clearTimeout(timeoutId);
                    console.log("Successfully loaded texture:", path);
                    
                    // Apply proper texture settings based on texture type
                    if (path.includes('stars_milky_way.jpg')) {
                        console.log("Applying special settings to milky way texture");
                        texture.wrapS = THREE.RepeatWrapping;
                        texture.wrapT = THREE.RepeatWrapping;
                        texture.repeat.set(1, 1);
                        texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
                    }
                    
                    this.loadedTextures[path] = texture; // Store for disposal
                    resolve(texture);
                }, 
                // Progress callback
                (xhr) => {
                    const percentComplete = (xhr.loaded / xhr.total) * 100;
                    console.log(`${path} loading: ${Math.round(percentComplete)}%`);
                },
                // Error callback
                (err) => { 
                    clearTimeout(timeoutId);
                    console.error(`Failed to load texture: ${path}`, err);
                    // Create a basic colored texture as fallback
                    const canvas = document.createElement('canvas');
                    canvas.width = 128;
                    canvas.height = 128;
                    const ctx = canvas.getContext('2d');
                    
                    // Use different fallback colors based on texture type
                    if (path.includes('stars_milky_way.jpg')) {
                        // Dark blue with stars for sky
                        ctx.fillStyle = '#000820';
                        ctx.fillRect(0, 0, 128, 128);
                        // Add some "stars"
                        ctx.fillStyle = 'white';
                        for (let i = 0; i < 100; i++) {
                            ctx.fillRect(
                                Math.random() * 128,
                                Math.random() * 128,
                                Math.random() < 0.3 ? 2 : 1,
                                Math.random() < 0.3 ? 2 : 1
                            );
                        }
                    } else {
                        // Generic gray texture for other objects
                        ctx.fillStyle = '#555555';
                        ctx.fillRect(0, 0, 128, 128);
                    }
                    
                    const fallbackTexture = new THREE.CanvasTexture(canvas);
                    this.loadedTextures[path] = fallbackTexture;
                    console.log(`Created fallback texture for: ${path}`);
                    resolve(fallbackTexture);
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
        
        try {
            const results = await Promise.all(promises);
            // Store textures in a more accessible way if needed, e.g., this.textures.sun = ...
            results.forEach(result => {
                this[result.key + 'Texture'] = result.texture; // e.g., this.sunTexture
            });
            console.log('All textures loaded successfully.');
        } catch (error) {
            console.error('Error loading textures:', error);
        }
    }
    // --- End Texture Loading ---

    createSkysphere() {
        if (!this.skyTexture) {
            console.error("Sky texture not available for background creation");
            return;
        }
        
        console.log("Creating sky background with texture:", this.skyTexture);
        
        // Make sure THREE is available and texture is properly loaded
        if (typeof THREE === 'undefined') {
            console.error("THREE is not defined when creating sky background");
            return;
        }
        
        // Create a skybox using a cube instead of a sphere for better image mapping
        const geometry = new THREE.BoxGeometry(2000, 2000, 2000);
        
        // Create materials for each face with the same texture
        const materials = [];
        for (let i = 0; i < 6; i++) {
            materials.push(new THREE.MeshBasicMaterial({
                map: this.skyTexture,
                side: THREE.BackSide // Render on inside of cube
            }));
        }
        
        // Create the mesh with our geometry and materials
        this.starsBackground = new THREE.Mesh(geometry, materials);
        
        // Add to scene
        this.scene.add(this.starsBackground);
        
        console.log("Sky background created successfully");
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
        
        // Rotate skybox very slowly for a subtle motion effect
        if (this.starsBackground) {
            // Use an extremely slow rotation for a subtle effect
            // This makes it appear as if the background is slowly moving
            this.starsBackground.rotation.y += delta * 0.002;
        }
        
        // Apply joystick camera movement
        if (this.joystickActive && (Math.abs(this.joystickPosition.x) > 0.1 || Math.abs(this.joystickPosition.y) > 0.1)) {
            this.moveCamera(delta);
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

        // Remove joystick
        if (this.joystick) {
            document.removeEventListener('mousemove', this.onJoystickMove.bind(this));
            document.removeEventListener('mouseup', this.onJoystickEnd.bind(this));
            document.removeEventListener('touchmove', this.onJoystickMove.bind(this));
            document.removeEventListener('touchend', this.onJoystickEnd.bind(this));
            document.removeEventListener('touchcancel', this.onJoystickEnd.bind(this));
            
            if (this.joystick.container && this.joystick.container.parentNode) {
                this.joystick.container.parentNode.removeChild(this.joystick.container);
            }
            this.joystick = null;
        }
        
        // Remove state controls
        if (this.stateButtons) {
            if (this.stateButtons.container && this.stateButtons.container.parentNode) {
                this.stateButtons.container.parentNode.removeChild(this.stateButtons.container);
            }
            this.stateButtons = null;
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
        // We can use this to control joystick sensitivity
        if (intensityValue >= 0 && intensityValue <= 100) {
            this.joystickMoveSpeed = 0.2 + (intensityValue / 100) * 1.3; // Map to 0.2 - 1.5 range
        }
        console.log(`Universe: setPhysicsIntensity called with ${intensityValue}`);
    }
    // --- End Settings --- 

    createJoystick() {
        // Create joystick container
        const joystickContainer = document.createElement('div');
        joystickContainer.className = 'joystick-container';
        joystickContainer.style.cssText = `
            position: absolute;
            bottom: 30px;
            left: 30px;
            width: 100px;
            height: 100px;
            background-color: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            z-index: 1000;
            touch-action: none;
            user-select: none;
        `;

        // Create joystick handle
        const joystickHandle = document.createElement('div');
        joystickHandle.className = 'joystick-handle';
        joystickHandle.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 40px;
            height: 40px;
            background-color: rgba(255, 255, 255, 0.8);
            border-radius: 50%;
            cursor: pointer;
        `;

        joystickContainer.appendChild(joystickHandle);
        document.body.appendChild(joystickContainer);
        
        this.joystick = {
            container: joystickContainer,
            handle: joystickHandle,
            containerRect: joystickContainer.getBoundingClientRect(),
            centerX: 0,
            centerY: 0
        };
        
        // Calculate center position
        this.updateJoystickCenter();
        
        // Add event listeners
        this.setupJoystickEvents();
    }

    updateJoystickCenter() {
        const rect = this.joystick.container.getBoundingClientRect();
        this.joystick.containerRect = rect;
        this.joystick.centerX = rect.left + rect.width / 2;
        this.joystick.centerY = rect.top + rect.height / 2;
    }

    setupJoystickEvents() {
        // Mouse events
        this.joystick.container.addEventListener('mousedown', this.onJoystickStart.bind(this));
        document.addEventListener('mousemove', this.onJoystickMove.bind(this));
        document.addEventListener('mouseup', this.onJoystickEnd.bind(this));
        
        // Touch events for mobile
        this.joystick.container.addEventListener('touchstart', this.onJoystickStart.bind(this));
        document.addEventListener('touchmove', this.onJoystickMove.bind(this));
        document.addEventListener('touchend', this.onJoystickEnd.bind(this));
        document.addEventListener('touchcancel', this.onJoystickEnd.bind(this));
        
        // Window resize
        window.addEventListener('resize', this.updateJoystickCenter.bind(this));
    }

    onJoystickStart(event) {
        event.preventDefault();
        this.joystickActive = true;
        this.updateJoystickCenter();
        this.onJoystickMove(event);
    }

    onJoystickMove(event) {
        if (!this.joystickActive) return;
        
        event.preventDefault();
        
        // Get touch/mouse position
        let clientX, clientY;
        if (event.touches && event.touches.length > 0) {
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        } else {
            clientX = event.clientX;
            clientY = event.clientY;
        }
        
        // Calculate joystick position
        const containerRadius = this.joystick.containerRect.width / 2;
        const maxDistance = containerRadius - 20; // Subtract handle radius
        
        // Calculate distance from center
        let dx = clientX - this.joystick.centerX;
        let dy = clientY - this.joystick.centerY;
        
        // Limit to container radius
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > maxDistance) {
            const angle = Math.atan2(dy, dx);
            dx = Math.cos(angle) * maxDistance;
            dy = Math.sin(angle) * maxDistance;
        }
        
        // Update handle position
        this.joystick.handle.style.transform = `translate(${dx}px, ${dy}px)`;
        
        // Normalize for camera movement (range -1 to 1)
        this.joystickPosition.x = dx / maxDistance;
        this.joystickPosition.y = dy / maxDistance;
    }

    onJoystickEnd(event) {
        if (!this.joystickActive) return;
        
        this.joystickActive = false;
        this.joystickPosition.x = 0;
        this.joystickPosition.y = 0;
        
        // Reset handle position with animation
        this.joystick.handle.style.transition = 'transform 0.2s ease-out';
        this.joystick.handle.style.transform = 'translate(0px, 0px)';
        
        // Remove transition after animation completes
        setTimeout(() => {
            this.joystick.handle.style.transition = '';
        }, 200);
    }

    moveCamera(delta) {
        // Get camera direction vectors
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
        
        // Scale movement by joystick position and speed
        forward.multiplyScalar(-this.joystickPosition.y * this.joystickMoveSpeed);
        right.multiplyScalar(this.joystickPosition.x * this.joystickMoveSpeed);
        
        // Apply movement
        const movement = new THREE.Vector3().addVectors(forward, right);
        this.camera.position.add(movement);
        this.controls.target.add(movement);
    }

    createStateControls() {
        // Create container for state buttons
        const stateContainer = document.createElement('div');
        stateContainer.className = 'universe-state-controls';
        stateContainer.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            z-index: 1000;
        `;
        
        // Create save button
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save Position';
        saveButton.className = 'universe-state-button';
        saveButton.style.cssText = `
            background-color: rgba(0, 0, 0, 0.5);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 4px;
            padding: 8px 12px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 12px;
            cursor: pointer;
            transition: background-color 0.2s;
        `;
        saveButton.addEventListener('mouseenter', () => {
            saveButton.style.backgroundColor = 'rgba(40, 40, 40, 0.6)';
        });
        saveButton.addEventListener('mouseleave', () => {
            saveButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        });
        saveButton.addEventListener('click', () => this.promptSaveState());
        
        // Create slots container
        const slotsContainer = document.createElement('div');
        slotsContainer.className = 'universe-state-slots';
        slotsContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 4px;
        `;
        
        stateContainer.appendChild(saveButton);
        stateContainer.appendChild(slotsContainer);
        document.body.appendChild(stateContainer);
        
        this.stateButtons = {
            container: stateContainer,
            saveButton: saveButton,
            slotsContainer: slotsContainer
        };
    }

    loadSavedStates() {
        try {
            const savedStateJson = localStorage.getItem('universeAnimationStates');
            if (savedStateJson) {
                this.savedStates = JSON.parse(savedStateJson);
                this.updateStateSlots();
            }
        } catch (error) {
            console.error('Error loading saved states:', error);
            this.savedStates = {};
        }
    }

    saveStatesToStorage() {
        try {
            localStorage.setItem('universeAnimationStates', JSON.stringify(this.savedStates));
        } catch (error) {
            console.error('Error saving states to storage:', error);
        }
    }

    getCurrentState() {
        return {
            camera: {
                position: {
                    x: this.camera.position.x,
                    y: this.camera.position.y,
                    z: this.camera.position.z
                },
                rotation: {
                    x: this.camera.rotation.x,
                    y: this.camera.rotation.y,
                    z: this.camera.rotation.z
                }
            },
            controls: {
                target: {
                    x: this.controls.target.x,
                    y: this.controls.target.y,
                    z: this.controls.target.z
                }
            },
            timestamp: Date.now(),
            description: ''
        };
    }

    promptSaveState() {
        // Create a modal for saving state
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        `;
        
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background-color: rgba(30, 30, 30, 0.9);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            padding: 20px;
            width: 300px;
            font-family: 'JetBrains Mono', monospace;
            color: white;
        `;
        
        const title = document.createElement('h3');
        title.textContent = 'Save Current Position';
        title.style.margin = '0 0 15px 0';
        
        const input = document.createElement('input');
        input.placeholder = 'Position description';
        input.type = 'text';
        input.style.cssText = `
            width: 100%;
            padding: 8px;
            background-color: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 4px;
            color: white;
            margin-bottom: 15px;
            font-family: inherit;
        `;
        
        const buttons = document.createElement('div');
        buttons.style.cssText = `
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        `;
        
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.style.cssText = `
            background-color: rgba(60, 60, 60, 0.7);
            color: white;
            border: none;
            border-radius: 4px;
            padding: 8px 12px;
            cursor: pointer;
            font-family: inherit;
        `;
        
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save';
        saveButton.style.cssText = `
            background-color: rgba(0, 120, 210, 0.7);
            color: white;
            border: none;
            border-radius: 4px;
            padding: 8px 12px;
            cursor: pointer;
            font-family: inherit;
        `;
        
        buttons.appendChild(cancelButton);
        buttons.appendChild(saveButton);
        
        dialog.appendChild(title);
        dialog.appendChild(input);
        dialog.appendChild(buttons);
        modal.appendChild(dialog);
        
        document.body.appendChild(modal);
        
        // Focus the input field
        setTimeout(() => {
            input.focus();
        }, 100);
        
        // Event handlers
        cancelButton.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        saveButton.addEventListener('click', () => {
            const description = input.value.trim() || `Position ${Object.keys(this.savedStates).length + 1}`;
            const currentState = this.getCurrentState();
            currentState.description = description;
            
            // Generate a unique key
            const stateKey = `state_${Date.now()}`;
            this.savedStates[stateKey] = currentState;
            
            // Update UI and save to localStorage
            this.updateStateSlots();
            this.saveStatesToStorage();
            
            document.body.removeChild(modal);
        });
        
        // Close on escape key
        const handleKeydown = (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(modal);
                document.removeEventListener('keydown', handleKeydown);
            } else if (e.key === 'Enter') {
                saveButton.click();
                document.removeEventListener('keydown', handleKeydown);
            }
        };
        document.addEventListener('keydown', handleKeydown);
    }

    updateStateSlots() {
        // Clear existing slots
        while (this.stateButtons.slotsContainer.firstChild) {
            this.stateButtons.slotsContainer.removeChild(this.stateButtons.slotsContainer.firstChild);
        }
        
        // Sort states by timestamp, most recent first
        const sortedStates = Object.entries(this.savedStates)
            .sort(([, a], [, b]) => b.timestamp - a.timestamp);
        
        // Add slots for each saved state
        sortedStates.forEach(([key, state]) => {
            const slotButton = document.createElement('div');
            slotButton.className = 'universe-state-slot';
            slotButton.style.cssText = `
                background-color: rgba(0, 0, 0, 0.5);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 4px;
                padding: 6px 8px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-family: 'JetBrains Mono', monospace;
                font-size: 11px;
                color: white;
                cursor: pointer;
            `;
            
            const name = document.createElement('span');
            name.textContent = state.description;
            name.style.flex = '1';
            
            const actions = document.createElement('div');
            actions.style.display = 'flex';
            actions.style.gap = '4px';
            
            const goButton = document.createElement('button');
            goButton.innerHTML = '&#9654;'; // Play symbol
            goButton.title = 'Go to position';
            goButton.style.cssText = `
                background: none;
                border: none;
                color: rgba(100, 255, 100, 0.8);
                cursor: pointer;
                font-size: 11px;
                padding: 2px 4px;
            `;
            
            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '&#10005;'; // X symbol
            deleteButton.title = 'Delete position';
            deleteButton.style.cssText = `
                background: none;
                border: none;
                color: rgba(255, 100, 100, 0.8);
                cursor: pointer;
                font-size: 11px;
                padding: 2px 4px;
            `;
            
            actions.appendChild(goButton);
            actions.appendChild(deleteButton);
            
            slotButton.appendChild(name);
            slotButton.appendChild(actions);
            
            this.stateButtons.slotsContainer.appendChild(slotButton);
            
            // Event handlers
            slotButton.addEventListener('mouseenter', () => {
                slotButton.style.backgroundColor = 'rgba(40, 40, 40, 0.6)';
            });
            
            slotButton.addEventListener('mouseleave', () => {
                slotButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            });
            
            // Load state on click
            goButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.loadState(key);
            });
            
            // Also load on slot click
            slotButton.addEventListener('click', () => {
                this.loadState(key);
            });
            
            // Delete state
            deleteButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteState(key);
            });
        });
    }

    loadState(stateKey) {
        const state = this.savedStates[stateKey];
        if (!state) return;
        
        // Set camera position
        this.camera.position.set(
            state.camera.position.x,
            state.camera.position.y,
            state.camera.position.z
        );
        
        // Set camera rotation
        this.camera.rotation.set(
            state.camera.rotation.x,
            state.camera.rotation.y,
            state.camera.rotation.z
        );
        
        // Set controls target
        this.controls.target.set(
            state.controls.target.x,
            state.controls.target.y,
            state.controls.target.z
        );
        
        // Update controls
        this.controls.update();
        
        // Show feedback
        this.showToast(`Loaded position: ${state.description}`);
    }

    deleteState(stateKey) {
        if (!this.savedStates[stateKey]) return;
        
        const description = this.savedStates[stateKey].description;
        delete this.savedStates[stateKey];
        
        // Update UI and save to localStorage
        this.updateStateSlots();
        this.saveStatesToStorage();
        
        // Show feedback
        this.showToast(`Deleted position: ${description}`);
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 14px;
            z-index: 2000;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.opacity = '1';
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
} 