/**
 * SkiFree - Classic Windows skiing game
 * Dodge trees, rocks, and watch out for the Yeti!
 */

import AppBase from './AppBase.js';

class SkiFree extends AppBase {
    constructor() {
        super({
            id: 'skifree',
            name: 'SkiFree',
            icon: '⛷️',
            width: 500,
            height: 450,
            resizable: false,
            singleton: true
        });

        this.canvas = null;
        this.ctx = null;
        this.gameLoop = null;
        this.isPlaying = false;
        this.isPaused = false;
        this.gameOver = false;

        // Player state
        this.player = {
            x: 250,
            y: 100,
            angle: 0, // -2 to 2 for skiing directions
            speed: 0,
            maxSpeed: 8,
            crashed: false,
            crashTimer: 0
        };

        // Game state
        this.distance = 0;
        this.score = 0;
        this.obstacles = [];
        this.particles = [];

        // Yeti state
        this.yeti = {
            x: 0,
            y: -200,
            active: false,
            chasing: false,
            speed: 5,
            caught: false
        };

        this.yetiDistance = 2000; // Distance when yeti appears
    }

    onOpen() {
        return `
            <style>
                .skifree-container {
                    background: #c0c0c0;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }
                .skifree-header {
                    display: flex;
                    justify-content: space-between;
                    padding: 5px 10px;
                    background: #000080;
                    color: white;
                    font-size: 12px;
                    font-family: 'Courier New', monospace;
                }
                .skifree-canvas {
                    flex: 1;
                    background: #fff;
                    cursor: none;
                }
                .skifree-controls {
                    padding: 5px 10px;
                    background: #c0c0c0;
                    border-top: 2px groove #fff;
                    display: flex;
                    gap: 10px;
                    align-items: center;
                    font-size: 11px;
                }
                .skifree-btn {
                    padding: 3px 15px;
                    background: #c0c0c0;
                    border: 2px outset #fff;
                    cursor: pointer;
                    font-size: 11px;
                }
                .skifree-btn:active {
                    border-style: inset;
                }
            </style>
            <div class="skifree-container">
                <div class="skifree-header">
                    <span>Distance: <span id="distance">0</span>m</span>
                    <span>Score: <span id="score">0</span></span>
                    <span>Speed: <span id="speed">0</span></span>
                </div>
                <canvas class="skifree-canvas" id="gameCanvas"></canvas>
                <div class="skifree-controls">
                    <button class="skifree-btn" id="btnStart">Start (Space)</button>
                    <button class="skifree-btn" id="btnPause">Pause (P)</button>
                    <span style="flex: 1;"></span>
                    <span>Arrow Keys to steer | F = Speed boost | Space = Start/Restart</span>
                </div>
            </div>
        `;
    }

    onMount() {
        this.canvas = this.getElement('#gameCanvas');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');

        // Set canvas size
        this.resizeCanvas();

        // Event handlers
        this.addHandler(window, 'resize', () => this.resizeCanvas());
        this.addHandler(document, 'keydown', (e) => this.handleKeyDown(e));
        this.addHandler(document, 'keyup', (e) => this.handleKeyUp(e));
        this.addHandler(this.getElement('#btnStart'), 'click', () => this.startGame());
        this.addHandler(this.getElement('#btnPause'), 'click', () => this.togglePause());

        // Draw initial screen
        this.drawStartScreen();
    }

    onClose() {
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
        }
    }

    resizeCanvas() {
        if (!this.canvas) return;
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }

    handleKeyDown(e) {
        if (!this.isWindowFocused()) return;

        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                if (this.isPlaying && !this.player.crashed) {
                    this.player.angle = Math.max(-2, this.player.angle - 0.5);
                }
                break;
            case 'ArrowRight':
                e.preventDefault();
                if (this.isPlaying && !this.player.crashed) {
                    this.player.angle = Math.min(2, this.player.angle + 0.5);
                }
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (this.isPlaying && !this.player.crashed) {
                    this.player.speed = Math.min(this.player.maxSpeed, this.player.speed + 0.5);
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (this.isPlaying && !this.player.crashed) {
                    this.player.speed = Math.max(1, this.player.speed - 0.5);
                }
                break;
            case 'f':
            case 'F':
                e.preventDefault();
                if (this.isPlaying && !this.player.crashed) {
                    this.player.speed = this.player.maxSpeed;
                }
                break;
            case ' ':
                e.preventDefault();
                if (!this.isPlaying || this.gameOver) {
                    this.startGame();
                }
                break;
            case 'p':
            case 'P':
                e.preventDefault();
                this.togglePause();
                break;
        }
    }

    handleKeyUp(e) {
        // Gradually return to center angle
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            // Let natural deceleration handle it
        }
    }

    isWindowFocused() {
        const window = this.getWindow();
        return window && window.classList.contains('active');
    }

    startGame() {
        this.isPlaying = true;
        this.isPaused = false;
        this.gameOver = false;

        // Reset player
        this.player = {
            x: this.canvas.width / 2,
            y: 100,
            angle: 0,
            speed: 3,
            maxSpeed: 8,
            crashed: false,
            crashTimer: 0
        };

        // Reset game state
        this.distance = 0;
        this.score = 0;
        this.obstacles = [];
        this.particles = [];

        // Reset yeti
        this.yeti = {
            x: this.canvas.width / 2,
            y: -200,
            active: false,
            chasing: false,
            speed: 5.5,
            caught: false
        };

        // Generate initial obstacles
        this.generateObstacles(20);

        // Start game loop
        this.gameLoop = requestAnimationFrame(() => this.update());
    }

    togglePause() {
        if (!this.isPlaying) return;
        this.isPaused = !this.isPaused;

        if (!this.isPaused) {
            this.gameLoop = requestAnimationFrame(() => this.update());
        }
    }

    generateObstacles(count) {
        const types = ['tree', 'tree', 'tree', 'rock', 'rock', 'jump', 'flag'];

        for (let i = 0; i < count; i++) {
            this.obstacles.push({
                type: types[Math.floor(Math.random() * types.length)],
                x: Math.random() * this.canvas.width,
                y: this.canvas.height + Math.random() * 500 + i * 50,
                width: 20,
                height: 30
            });
        }
    }

    update() {
        if (!this.isPlaying || this.isPaused || this.gameOver) return;

        // Update player position
        if (!this.player.crashed) {
            // Move based on angle
            this.player.x += this.player.angle * this.player.speed * 0.5;

            // Keep player in bounds
            this.player.x = Math.max(20, Math.min(this.canvas.width - 20, this.player.x));

            // Update distance
            this.distance += this.player.speed * 0.5;

            // Gradually center angle
            if (this.player.angle > 0) {
                this.player.angle = Math.max(0, this.player.angle - 0.02);
            } else if (this.player.angle < 0) {
                this.player.angle = Math.min(0, this.player.angle + 0.02);
            }

            // Create snow particles
            if (Math.random() < 0.3) {
                this.particles.push({
                    x: this.player.x + (Math.random() - 0.5) * 10,
                    y: this.player.y + 15,
                    vx: -this.player.angle * 2,
                    vy: -1,
                    life: 20
                });
            }
        } else {
            this.player.crashTimer--;
            if (this.player.crashTimer <= 0) {
                this.player.crashed = false;
                this.player.speed = 3;
            }
        }

        // Move obstacles
        for (let obs of this.obstacles) {
            obs.y -= this.player.speed;
        }

        // Remove off-screen obstacles and add new ones
        this.obstacles = this.obstacles.filter(obs => obs.y > -50);
        if (this.obstacles.length < 15) {
            this.generateObstacles(5);
        }

        // Check collisions
        this.checkCollisions();

        // Update particles
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            return p.life > 0;
        });

        // Check for Yeti appearance
        if (this.distance > this.yetiDistance && !this.yeti.active) {
            this.yeti.active = true;
            this.yeti.chasing = true;
            this.yeti.y = this.canvas.height + 100;
            this.yeti.x = this.player.x + (Math.random() - 0.5) * 200;
        }

        // Update Yeti
        if (this.yeti.chasing) {
            // Move yeti toward player
            const dx = this.player.x - this.yeti.x;
            const dy = this.player.y - this.yeti.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 0) {
                this.yeti.x += (dx / dist) * this.yeti.speed;
                this.yeti.y += (dy / dist) * this.yeti.speed - this.player.speed + 1;
            }

            // Check if yeti caught player
            if (dist < 30) {
                this.yeti.caught = true;
                this.gameOver = true;
                this.isPlaying = false;
            }
        }

        // Update UI
        this.updateUI();

        // Draw
        this.draw();

        // Next frame
        if (this.isPlaying && !this.gameOver) {
            this.gameLoop = requestAnimationFrame(() => this.update());
        } else {
            this.drawGameOver();
        }
    }

    checkCollisions() {
        if (this.player.crashed) return;

        for (let obs of this.obstacles) {
            const dx = Math.abs(this.player.x - obs.x);
            const dy = Math.abs(this.player.y - obs.y);

            if (dx < 15 && dy < 20) {
                if (obs.type === 'jump') {
                    // Jump over - bonus points
                    this.score += 50;
                    obs.y = -100; // Remove
                } else if (obs.type === 'flag') {
                    // Slalom flag - bonus points
                    this.score += 25;
                    obs.y = -100;
                } else {
                    // Crash!
                    this.player.crashed = true;
                    this.player.crashTimer = 60;
                    this.player.speed = 0;
                    this.score -= 10;

                    // Create crash particles
                    for (let i = 0; i < 20; i++) {
                        this.particles.push({
                            x: this.player.x,
                            y: this.player.y,
                            vx: (Math.random() - 0.5) * 8,
                            vy: (Math.random() - 0.5) * 8,
                            life: 30
                        });
                    }
                }
            }
        }
    }

    updateUI() {
        const distEl = this.getElement('#distance');
        const scoreEl = this.getElement('#score');
        const speedEl = this.getElement('#speed');

        if (distEl) distEl.textContent = Math.floor(this.distance);
        if (scoreEl) scoreEl.textContent = this.score;
        if (speedEl) speedEl.textContent = Math.round(this.player.speed * 10);
    }

    draw() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Clear with white (snow)
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, w, h);

        // Draw snow texture (dots)
        ctx.fillStyle = '#eef';
        for (let i = 0; i < 50; i++) {
            const x = (i * 37 + this.distance) % w;
            const y = (i * 23 + this.distance * 0.5) % h;
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw particles (snow spray)
        ctx.fillStyle = '#aaf';
        for (let p of this.particles) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw obstacles
        for (let obs of this.obstacles) {
            this.drawObstacle(obs);
        }

        // Draw player
        this.drawPlayer();

        // Draw Yeti if active
        if (this.yeti.active) {
            this.drawYeti();
        }

        // Draw warning if yeti is coming
        if (this.distance > this.yetiDistance - 500 && !this.yeti.active) {
            ctx.fillStyle = '#f00';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('WARNING: YETI APPROACHING!', w / 2, 50);
        }
    }

    drawPlayer() {
        const ctx = this.ctx;
        const p = this.player;

        ctx.save();
        ctx.translate(p.x, p.y);

        if (p.crashed) {
            // Draw crashed skier
            ctx.fillStyle = '#000';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('💫', 0, 0);

            // Skis scattered
            ctx.strokeStyle = '#00f';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-15, 10);
            ctx.lineTo(-5, 20);
            ctx.moveTo(15, 5);
            ctx.lineTo(10, 18);
            ctx.stroke();
        } else {
            // Draw skier based on angle
            ctx.fillStyle = '#000';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';

            if (p.angle < -1) {
                ctx.fillText('⛷️', 0, 0);
                ctx.scale(-1, 1);
            } else if (p.angle > 1) {
                ctx.fillText('⛷️', 0, 0);
            } else {
                // Straight down
                ctx.fillText('🎿', 0, 0);
            }

            // Draw skis
            ctx.strokeStyle = '#00f';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-6 + p.angle * 3, 8);
            ctx.lineTo(-6 + p.angle * 8, 18);
            ctx.moveTo(6 + p.angle * 3, 8);
            ctx.lineTo(6 + p.angle * 8, 18);
            ctx.stroke();
        }

        ctx.restore();
    }

    drawObstacle(obs) {
        const ctx = this.ctx;

        ctx.save();
        ctx.translate(obs.x, obs.y);

        switch (obs.type) {
            case 'tree':
                // Pine tree
                ctx.fillStyle = '#228b22';
                ctx.beginPath();
                ctx.moveTo(0, -25);
                ctx.lineTo(-12, 0);
                ctx.lineTo(-6, 0);
                ctx.lineTo(-10, 10);
                ctx.lineTo(10, 10);
                ctx.lineTo(6, 0);
                ctx.lineTo(12, 0);
                ctx.closePath();
                ctx.fill();
                // Trunk
                ctx.fillStyle = '#8b4513';
                ctx.fillRect(-3, 10, 6, 8);
                break;

            case 'rock':
                ctx.fillStyle = '#666';
                ctx.beginPath();
                ctx.ellipse(0, 0, 12, 8, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#888';
                ctx.beginPath();
                ctx.ellipse(-3, -2, 6, 4, 0, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'jump':
                ctx.fillStyle = '#87ceeb';
                ctx.beginPath();
                ctx.moveTo(-15, 5);
                ctx.lineTo(0, -10);
                ctx.lineTo(15, 5);
                ctx.closePath();
                ctx.fill();
                ctx.strokeStyle = '#4169e1';
                ctx.lineWidth = 2;
                ctx.stroke();
                break;

            case 'flag':
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(0, 15);
                ctx.lineTo(0, -15);
                ctx.stroke();
                ctx.fillStyle = '#f00';
                ctx.beginPath();
                ctx.moveTo(0, -15);
                ctx.lineTo(12, -10);
                ctx.lineTo(0, -5);
                ctx.closePath();
                ctx.fill();
                break;
        }

        ctx.restore();
    }

    drawYeti() {
        const ctx = this.ctx;
        const y = this.yeti;

        ctx.save();
        ctx.translate(y.x, y.y);

        // Yeti body (scary abominable snowman)
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;

        // Body
        ctx.beginPath();
        ctx.ellipse(0, 0, 20, 25, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Face
        ctx.fillStyle = '#333';
        // Eyes
        ctx.beginPath();
        ctx.arc(-7, -10, 4, 0, Math.PI * 2);
        ctx.arc(7, -10, 4, 0, Math.PI * 2);
        ctx.fill();

        // Angry eyebrows
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-12, -18);
        ctx.lineTo(-4, -14);
        ctx.moveTo(12, -18);
        ctx.lineTo(4, -14);
        ctx.stroke();

        // Mouth (scary)
        ctx.fillStyle = '#f00';
        ctx.beginPath();
        ctx.arc(0, 5, 10, 0, Math.PI);
        ctx.fill();

        // Teeth
        ctx.fillStyle = '#fff';
        ctx.fillRect(-8, 5, 4, 6);
        ctx.fillRect(4, 5, 4, 6);

        // Arms reaching
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(-20, 0);
        ctx.lineTo(-35, -15);
        ctx.moveTo(20, 0);
        ctx.lineTo(35, -15);
        ctx.stroke();

        ctx.restore();
    }

    drawStartScreen() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#000080';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('⛷️ SkiFree ⛷️', w / 2, h / 3);

        ctx.font = '16px Arial';
        ctx.fillStyle = '#333';
        ctx.fillText('Arrow Keys to steer', w / 2, h / 2 - 20);
        ctx.fillText('Down Arrow / F = Go faster', w / 2, h / 2 + 10);
        ctx.fillText('Watch out for the Yeti!', w / 2, h / 2 + 40);

        ctx.font = 'bold 18px Arial';
        ctx.fillStyle = '#008000';
        ctx.fillText('Press SPACE to start', w / 2, h / 2 + 90);

        // Draw little yeti preview
        ctx.font = '40px Arial';
        ctx.fillText('🏔️', w / 2, h - 80);
    }

    drawGameOver() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';

        if (this.yeti.caught) {
            ctx.fillText('🥶 EATEN BY YETI! 🥶', w / 2, h / 3);
        } else {
            ctx.fillText('GAME OVER', w / 2, h / 3);
        }

        ctx.font = '18px Arial';
        ctx.fillText(`Distance: ${Math.floor(this.distance)}m`, w / 2, h / 2);
        ctx.fillText(`Score: ${this.score}`, w / 2, h / 2 + 30);

        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = '#0f0';
        ctx.fillText('Press SPACE to try again', w / 2, h / 2 + 80);
    }
}

export default SkiFree;
