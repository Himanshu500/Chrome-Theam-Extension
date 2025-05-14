class CodeBreakerGrid {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error(`CodeBreakerGrid: Canvas element '${canvasId}' not found.`);
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error("CodeBreakerGrid: Failed to get 2D context.");
            return;
        }

        this.config = {
            gridSize: 40,
            mouseRadius: 150,
            baseNodeRadius: 2,
            baseNodeColor: 'rgba(0, 255, 255, 0.3)',
            interactiveNodeColor: 'rgba(51, 255, 255, 0.8)',
            lineBaseColorRGB: '51, 255, 255',
            lineWidth: 0.5,
            maxLineDistanceFactor: 1.7, // Multiplier for gridSize
            lineAlphaBase: 0.05,
            lineAlphaInteractive: 0.4,
            lineAlphaBothInteractive: 0.7,
            maxNodeDisplacement: 15,
            nodeLerpFactor: 0.1,
            sparkColor: 'rgba(173, 255, 47, 0.9)', // Bright greenish-yellow
            sparkGenerationChance: 0.05, // Chance to create a spark per interactive node per frame
            sparkInteractionFactor: 0.5, // Mouse must be within (mouseRadius * this_factor) of node to spark
            minSparkSpeed: 0.5,
            maxSparkSpeed: 2.0, // Increased max speed slightly
            minSparkSize: 1,
            maxSparkSize: 3, // Increased max size slightly
            minSparkLifespan: 20, // frames
            maxSparkLifespan: 60, // frames
            sparkShrinkRate: 0.97
        };

        this.isActive = false;
        this.nodes = [];
        this.sparks = [];
        this.mouse = { x: undefined, y: undefined }; // Radius is in config

        // Bind methods
        this.resizeCanvas = this.resizeCanvas.bind(this);
        this.animate = this.animate.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseOut = this.handleMouseOut.bind(this); // Bound method for mouseout
    }

    resizeCanvas() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        if (this.isActive) {
            this.initGrid();
        }
    }

    initGrid() {
        if (!this.ctx) return;
        this.nodes = [];
        this.sparks = [];
        
        const cols = Math.floor(this.canvas.width / this.config.gridSize);
        const rows = Math.floor(this.canvas.height / this.config.gridSize);
        const offsetX = (this.canvas.width - (cols * this.config.gridSize)) / 2 + this.config.gridSize / 2;
        const offsetY = (this.canvas.height - (rows * this.config.gridSize)) / 2 + this.config.gridSize / 2;

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                this.nodes.push({
                    x: offsetX + i * this.config.gridSize,
                    y: offsetY + j * this.config.gridSize,
                    baseX: offsetX + i * this.config.gridSize,
                    baseY: offsetY + j * this.config.gridSize,
                    radius: this.config.baseNodeRadius,
                    originalRadius: this.config.baseNodeRadius,
                    color: this.config.baseNodeColor,
                    originalColor: this.config.baseNodeColor,
                    interactiveColor: this.config.interactiveNodeColor,
                    targetRadius: this.config.baseNodeRadius,
                    lerpFactor: this.config.nodeLerpFactor,
                    isInteractive: false
                });
            }
        }
    }

    drawGridAndLines() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.nodes.forEach(node => {
            this.ctx.beginPath();
            node.radius += (node.targetRadius - node.radius) * node.lerpFactor;
            this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = node.color;
            this.ctx.fill();
        });

        const maxLineDistance = this.config.gridSize * this.config.maxLineDistanceFactor;
        this.ctx.lineWidth = this.config.lineWidth;

        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const nodeA = this.nodes[i];
                const nodeB = this.nodes[j];
                const dx = nodeA.x - nodeB.x;
                const dy = nodeA.y - nodeB.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < maxLineDistance) {
                    let alpha = this.config.lineAlphaBase;
                    if (nodeA.isInteractive || nodeB.isInteractive) {
                        alpha = this.config.lineAlphaInteractive;
                    }
                    if (nodeA.isInteractive && nodeB.isInteractive && distance < this.config.gridSize * 1.2) { // 1.2 factor is arbitrary, could be config
                        alpha = this.config.lineAlphaBothInteractive;
                    }
                    this.ctx.beginPath();
                    this.ctx.moveTo(nodeA.x, nodeA.y);
                    this.ctx.lineTo(nodeB.x, nodeB.y);
                    this.ctx.strokeStyle = `rgba(${this.config.lineBaseColorRGB}, ${alpha})`;
                    this.ctx.stroke();
                }
            }
        }
    }

    updateGridAndSparks() {
        const mousePresent = this.mouse.x !== undefined && this.mouse.y !== undefined;

        this.nodes.forEach(node => {
            if (mousePresent) {
                const dxMouse = node.baseX - this.mouse.x;
                const dyMouse = node.baseY - this.mouse.y;
                const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
                const displacementStrength = 1 - Math.min(1, distMouse / this.config.mouseRadius);

                if (distMouse < this.config.mouseRadius) {
                    node.isInteractive = true;
                    node.targetRadius = node.originalRadius + (this.config.baseNodeRadius * 2) * displacementStrength; // Make max interactive radius relative
                    node.color = node.interactiveColor;
                    if (distMouse > 0) {
                        const angle = Math.atan2(dyMouse, dxMouse);
                        const displacement = this.config.maxNodeDisplacement * displacementStrength;
                        node.x = node.baseX + Math.cos(angle) * displacement;
                        node.y = node.baseY + Math.sin(angle) * displacement;
                    } else {
                        node.x = node.baseX; node.y = node.baseY;
                    }
                    if (distMouse < this.config.mouseRadius * this.config.sparkInteractionFactor && Math.random() < this.config.sparkGenerationChance) {
                        this.createSpark(node.x, node.y);
                    }
                } else {
                    node.isInteractive = false;
                    node.targetRadius = node.originalRadius;
                    node.color = node.originalColor;
                    node.x += (node.baseX - node.x) * node.lerpFactor;
                    node.y += (node.baseY - node.y) * node.lerpFactor;
                }
            } else { // No mouse present or mouse left window
                node.isInteractive = false;
                node.targetRadius = node.originalRadius;
                node.color = node.originalColor;
                node.x += (node.baseX - node.x) * node.lerpFactor;
                node.y += (node.baseY - node.y) * node.lerpFactor;
            }
        });

        for (let i = this.sparks.length - 1; i >= 0; i--) {
            const spark = this.sparks[i];
            spark.x += spark.vx;
            spark.y += spark.vy;
            spark.lifespan--;
            spark.size *= this.config.sparkShrinkRate;
            if (spark.lifespan <= 0 || spark.size < 0.1) {
                this.sparks.splice(i, 1);
            }
        }
    }
    
    createSpark(x, y) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * (this.config.maxSparkSpeed - this.config.minSparkSpeed) + this.config.minSparkSpeed;
        const size = Math.random() * (this.config.maxSparkSize - this.config.minSparkSize) + this.config.minSparkSize;
        this.sparks.push({
            x: x, y: y,
            vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
            size: size,
            originalSize: size, // Corrected: use the current spark's generated size
            color: this.config.sparkColor,
            lifespan: Math.random() * (this.config.maxSparkLifespan - this.config.minSparkLifespan) + this.config.minSparkLifespan
        });
    }

    drawSparks() {
        if (!this.ctx) return;
        this.sparks.forEach(spark => {
            this.ctx.beginPath();
            this.ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
            this.ctx.fillStyle = spark.color;
            this.ctx.fill();
        });
    }

    animate() {
        if (!this.isActive || !this.ctx) return;
        this.updateGridAndSparks();
        this.drawGridAndLines(); 
        this.drawSparks(); 
        requestAnimationFrame(this.animate);
    }

    start() {
        if (!this.canvas || !this.ctx) return;
        this.isActive = true;
        this.resizeCanvas(); 
        this.animate();
        this.canvas.style.display = 'block';
        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('mouseout', this.handleMouseOut);
        window.addEventListener('resize', this.resizeCanvas);
        console.log("CodeBreakerGrid started with mouse and resize listeners");
    }

    stop() {
        this.isActive = false;
        if (this.canvas) {
            this.canvas.style.display = 'none';
            if (this.ctx) {
                 this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
        }
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('mouseout', this.handleMouseOut);
        window.removeEventListener('resize', this.resizeCanvas);
        this.mouse = { x: undefined, y: undefined }; // Reset mouse state
        this.sparks = []; 
        console.log("CodeBreakerGrid stopped, mouse and resize listeners removed");
    }

    handleMouseMove(event) {
        if (!this.isActive) return;
        this.mouse.x = event.clientX;
        this.mouse.y = event.clientY;
    }

    handleMouseOut() {
        if (!this.isActive) return;
        this.mouse.x = undefined;
        this.mouse.y = undefined;
    }
}

// Example of how it might be instantiated (will be done in settings.js or main.js)
// let codeBreakerGridInstance = null;
// document.addEventListener('DOMContentLoaded', () => {
//     // codeBreakerGridInstance = new CodeBreakerGrid('codebreaker-grid-canvas');
//     // This instance would be controlled by the theme selection logic.
// }); 