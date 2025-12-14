/**
 * Asteroids Game
 * Classic arcade space shooter
 */

import AppBase from './AppBase.js';
import StateManager from '../core/StateManager.js';

class Asteroids extends AppBase {
    constructor() {
        super({
            id: 'asteroids',
            name: 'Asteroids',
            icon: '🚀',
            width: 600,
            height: 480,
            resizable: false,
            singleton: true // One game at a time
        });

        // Game Constants
        this.FPS = 60;
        this.FRICTION = 0.7; // friction coefficient of space (0 = no friction, 1 = lots)
        this.LASER_DIST = 0.6; // max distance laser can travel as fraction of screen width
        this.LASER_SPD = 500; // pixels per second
        this.LASER_MAX = 10; // max number of lasers on screen at once
        this.ROIDS_NUM = 3; // starting number of asteroids
        this.ROIDS_SIZE = 100; // starting size of asteroids in pixels
        this.ROIDS_SPD = 50; // max starting speed of asteroids in pixels per second
        this.ROIDS_VERT = 10; // average number of vertices on each asteroid
        this.SHIP_SIZE = 30; // ship height in pixels
        this.SHIP_THRUST = 5; // acceleration of the ship in pixels per second per second
        this.TURN_SPEED = 360; // turn speed in degrees per second

        // Game State
        this.canvas = null;
        this.ctx = null;
        this.gameLoop = null;
        this.level = 0;
        this.lives = 3;
        this.score = 0;
        this.scoreHigh = 0;
        this.ship = null;
        this.roids = [];
        this.text = "";
        this.textAlpha = 0;
    }

    onOpen() {
        return `
            <div class="asteroids-container" style="background: #000; height: 100%; display: flex; flex-direction: column;">
                <div class="asteroids-hud" style="color: #0f0; font-family: 'Courier New', monospace; padding: 5px; display: flex; justify-content: space-between; border-bottom: 2px solid #333;">
                    <span>SCORE: <span id="score">0</span></span>
                    <span>LIVES: <span id="lives">3</span></span>
                </div>
                <canvas id="gameCanvas" width="580" height="420" style="display: block; width: 100%; height: 100%;"></canvas>
                <div class="asteroids-controls" style="color: #666; font-size: 10px; text-align: center; padding: 2px;">
                    Arrows: Move/Turn | Space: Shoot
                </div>
            </div>
        `;
    }

    onMount() {
        this.canvas = this.getElement('#gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Handle resizing properly (though window is fixed, internal canvas needs exact pixels)
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;

        // Setup input
        this.addHandler(document, 'keydown', (e) => this.keyDown(e));
        this.addHandler(document, 'keyup', (e) => this.keyUp(e));

        this.newGame();
        this.gameLoop = setInterval(() => this.update(), 1000 / this.FPS);
    }

    onClose() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
    }

    newGame() {
        this.level = 0;
        this.lives = 3;
        this.score = 0;
        this.ship = this.newShip();
        this.newLevel();
    }

    newLevel() {
        this.text = "LEVEL " + (this.level + 1);
        this.textAlpha = 1.0;
        this.createAsteroidBelt();
    }

    newShip() {
        return {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            a: 90 / 180 * Math.PI, // convert to radians
            r: this.SHIP_SIZE / 2,
            blinkNum: Math.ceil(this.SHIP_INV_DUR / this.SHIP_BLINK_DUR),
            blinkTime: Math.ceil(this.SHIP_BLINK_DUR * this.FPS),
            canShoot: true,
            dead: false,
            lasers: [],
            rot: 0,
            thrusting: false,
            thrust: { x: 0, y: 0 }
        };
    }

    createAsteroidBelt() {
        this.roids = [];
        let x, y;
        for (let i = 0; i < this.ROIDS_NUM + this.level; i++) {
            // Random position
            do {
                x = Math.floor(Math.random() * this.canvas.width);
                y = Math.floor(Math.random() * this.canvas.height);
            } while (this.distBetweenPoints(this.ship.x, this.ship.y, x, y) < this.ROIDS_SIZE * 2 + this.ship.r);
            this.roids.push(this.newAsteroid(x, y, Math.ceil(this.ROIDS_SIZE / 2)));
        }
    }

    newAsteroid(x, y, r) {
        let lvlMult = 1 + 0.1 * this.level;
        let roid = {
            x: x,
            y: y,
            xv: Math.random() * this.ROIDS_SPD * lvlMult / this.FPS * (Math.random() < 0.5 ? 1 : -1),
            yv: Math.random() * this.ROIDS_SPD * lvlMult / this.FPS * (Math.random() < 0.5 ? 1 : -1),
            r: r,
            a: Math.random() * Math.PI * 2,
            vert: Math.floor(Math.random() * (this.ROIDS_VERT + 1) + this.ROIDS_VERT / 2),
            offs: []
        };

        // Create random vertex offsets
        for (let i = 0; i < roid.vert; i++) {
            roid.offs.push(Math.random() * 0.4 + 0.8);
        }
        return roid;
    }

    distBetweenPoints(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    keyDown(e) {
        if (!this.isOpen) return;
        
        // Prevent scrolling
        if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight", " "].indexOf(e.key) > -1) {
            e.preventDefault();
        }

        switch(e.key) {
            case "ArrowLeft": this.ship.rot = this.TURN_SPEED / 180 * Math.PI / this.FPS; break;
            case "ArrowRight": this.ship.rot = -this.TURN_SPEED / 180 * Math.PI / this.FPS; break;
            case "ArrowUp": this.ship.thrusting = true; break;
            case " ": this.shootLaser(); break;
        }
    }

    keyUp(e) {
        if (!this.isOpen) return;
        switch(e.key) {
            case "ArrowLeft": this.ship.rot = 0; break;
            case "ArrowRight": this.ship.rot = 0; break;
            case "ArrowUp": this.ship.thrusting = false; break;
            case " ": this.ship.canShoot = true; break;
        }
    }

    shootLaser() {
        // Create laser object
        if (this.ship.canShoot && this.ship.lasers.length < this.LASER_MAX) {
            this.ship.lasers.push({ // from the nose of the ship
                x: this.ship.x + 4 / 3 * this.ship.r * Math.cos(this.ship.a),
                y: this.ship.y - 4 / 3 * this.ship.r * Math.sin(this.ship.a),
                xv: this.LASER_SPD * Math.cos(this.ship.a) / this.FPS,
                yv: -this.LASER_SPD * Math.sin(this.ship.a) / this.FPS,
                dist: 0,
                explodeTime: 0
            });
            this.playSound('click'); // Reuse click sound for pew pew
        }
        this.ship.canShoot = false; // Prevent rapid fire holding space
    }

    update() {
        const { width, height } = this.canvas;
        
        // Draw Space
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, width, height);

        // --- SHIP LOGIC ---
        if (!this.ship.dead) {
            // Move ship
            this.ship.x += this.ship.thrust.x;
            this.ship.y += this.ship.thrust.y;

            // Handle thrust
            if (this.ship.thrusting) {
                this.ship.thrust.x += this.SHIP_THRUST * Math.cos(this.ship.a) / this.FPS;
                this.ship.thrust.y -= this.SHIP_THRUST * Math.sin(this.ship.a) / this.FPS;
                
                // Draw thrust flame
                this.ctx.fillStyle = "red";
                this.ctx.strokeStyle = "yellow";
                this.ctx.lineWidth = this.SHIP_SIZE / 10;
                this.ctx.beginPath();
                this.ctx.moveTo( // rear left
                    this.ship.x - this.ship.r * (2 / 3 * Math.cos(this.ship.a) + 0.5 * Math.sin(this.ship.a)),
                    this.ship.y + this.ship.r * (2 / 3 * Math.sin(this.ship.a) - 0.5 * Math.cos(this.ship.a))
                );
                this.ctx.lineTo( // rear centre (behind the ship)
                    this.ship.x - this.ship.r * 5 / 3 * Math.cos(this.ship.a),
                    this.ship.y + this.ship.r * 5 / 3 * Math.sin(this.ship.a)
                );
                this.ctx.lineTo( // rear right
                    this.ship.x - this.ship.r * (2 / 3 * Math.cos(this.ship.a) - 0.5 * Math.sin(this.ship.a)),
                    this.ship.y + this.ship.r * (2 / 3 * Math.sin(this.ship.a) + 0.5 * Math.cos(this.ship.a))
                );
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.stroke();
            } else {
                // Apply friction
                this.ship.thrust.x -= this.FRICTION * this.ship.thrust.x / this.FPS;
                this.ship.thrust.y -= this.FRICTION * this.ship.thrust.y / this.FPS;
            }

            // Draw triangular ship
            this.ctx.strokeStyle = "white";
            this.ctx.lineWidth = this.SHIP_SIZE / 20;
            this.ctx.beginPath();
            this.ctx.moveTo( // nose
                this.ship.x + 4 / 3 * this.ship.r * Math.cos(this.ship.a),
                this.ship.y - 4 / 3 * this.ship.r * Math.sin(this.ship.a)
            );
            this.ctx.lineTo( // rear left
                this.ship.x - this.ship.r * (2 / 3 * Math.cos(this.ship.a) + Math.sin(this.ship.a)),
                this.ship.y + this.ship.r * (2 / 3 * Math.sin(this.ship.a) - Math.cos(this.ship.a))
            );
            this.ctx.lineTo( // rear right
                this.ship.x - this.ship.r * (2 / 3 * Math.cos(this.ship.a) - Math.sin(this.ship.a)),
                this.ship.y + this.ship.r * (2 / 3 * Math.sin(this.ship.a) + Math.cos(this.ship.a))
            );
            this.ctx.closePath();
            this.ctx.stroke();

            // Rotate ship
            this.ship.a += this.ship.rot;

            // Screen wrapping
            if (this.ship.x < 0 - this.ship.r) this.ship.x = width + this.ship.r;
            else if (this.ship.x > width + this.ship.r) this.ship.x = 0 - this.ship.r;
            if (this.ship.y < 0 - this.ship.r) this.ship.y = height + this.ship.r;
            else if (this.ship.y > height + this.ship.r) this.ship.y = 0 - this.ship.r;
        }

        // --- ASTEROIDS LOGIC ---
        this.ctx.lineWidth = this.SHIP_SIZE / 20;
        this.ctx.strokeStyle = "slategrey";
        for (let i = 0; i < this.roids.length; i++) {
            // Draw asteroid
            const { x, y, r, a, vert, offs } = this.roids[i];
            this.ctx.beginPath();
            for (let j = 0; j < vert; j++) {
                this.ctx.lineTo(
                    x + r * offs[j] * Math.cos(a + j * Math.PI * 2 / vert),
                    y + r * offs[j] * Math.sin(a + j * Math.PI * 2 / vert)
                );
            }
            this.ctx.closePath();
            this.ctx.stroke();

            // Move asteroid
            this.roids[i].x += this.roids[i].xv;
            this.roids[i].y += this.roids[i].yv;

            // Handle edge of screen
            if (this.roids[i].x < 0 - this.roids[i].r) this.roids[i].x = width + this.roids[i].r;
            else if (this.roids[i].x > width + this.roids[i].r) this.roids[i].x = 0 - this.roids[i].r;
            if (this.roids[i].y < 0 - this.roids[i].r) this.roids[i].y = height + this.roids[i].r;
            else if (this.roids[i].y > height + this.roids[i].r) this.roids[i].y = 0 - this.roids[i].r;
        }

        // --- LASER LOGIC ---
        for (let i = this.ship.lasers.length - 1; i >= 0; i--) {
            // Draw laser
            this.ctx.fillStyle = "salmon";
            this.ctx.beginPath();
            this.ctx.arc(this.ship.lasers[i].x, this.ship.lasers[i].y, this.SHIP_SIZE / 15, 0, Math.PI * 2, false);
            this.ctx.fill();

            // Move laser
            this.ship.lasers[i].x += this.ship.lasers[i].xv;
            this.ship.lasers[i].y += this.ship.lasers[i].yv;

            // Handle edge of screen
            if (this.ship.lasers[i].x < 0) this.ship.lasers[i].x = width;
            else if (this.ship.lasers[i].x > width) this.ship.lasers[i].x = 0;
            if (this.ship.lasers[i].y < 0) this.ship.lasers[i].y = height;
            else if (this.ship.lasers[i].y > height) this.ship.lasers[i].y = 0;

            // Calculate distance travelled
            this.ship.lasers[i].dist += Math.sqrt(Math.pow(this.ship.lasers[i].xv, 2) + Math.pow(this.ship.lasers[i].yv, 2));

            // Kill laser after distance
            if (this.ship.lasers[i].dist > width * this.LASER_DIST) {
                this.ship.lasers.splice(i, 1);
                continue;
            }

            // Detect laser hits on asteroids
            let hit = false;
            for (let j = this.roids.length - 1; j >= 0; j--) {
                if (this.distBetweenPoints(this.ship.lasers[i].x, this.ship.lasers[i].y, this.roids[j].x, this.roids[j].y) < this.roids[j].r) {
                    // Remove laser
                    this.ship.lasers.splice(i, 1);
                    hit = true;

                    // Destroy asteroid
                    this.destroyAsteroid(j);
                    break;
                }
            }
            if (hit) continue;
        }

        // --- COLLISION LOGIC (Ship vs Asteroid) ---
        if (!this.ship.dead) {
            for (let i = 0; i < this.roids.length; i++) {
                if (this.distBetweenPoints(this.ship.x, this.ship.y, this.roids[i].x, this.roids[i].y) < this.ship.r + this.roids[i].r) {
                    this.explodeShip();
                    this.destroyAsteroid(i);
                    break;
                }
            }
        }

        // --- LEVEL LOGIC ---
        if (this.roids.length === 0) {
            this.level++;
            this.newLevel();
        }

        // --- TEXT LOGIC ---
        if (this.textAlpha >= 0) {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${this.textAlpha})`;
            this.ctx.font = "small-caps 40px 'VT323'";
            this.ctx.textAlign = "center";
            this.ctx.fillText(this.text, width / 2, height * 0.75);
            this.textAlpha -= 0.01;
        }
    }

    destroyAsteroid(index) {
        const { x, y, r } = this.roids[index];

        // Split asteroid in two if necessary
        if (r > Math.ceil(this.ROIDS_SIZE / 8)) {
            this.roids.push(this.newAsteroid(x, y, Math.ceil(r / 2)));
            this.roids.push(this.newAsteroid(x, y, Math.ceil(r / 2)));
        }

        // Remove the original
        this.roids.splice(index, 1);
        
        // Add score
        this.score += 20;
        this.updateScore();
    }

    explodeShip() {
        this.lives--;
        this.updateLives();
        
        if (this.lives === 0) {
            this.text = "GAME OVER";
            this.textAlpha = 1.0;
            this.playSound('error');
            setTimeout(() => this.newGame(), 3000);
        } else {
            this.playSound('error');
            this.ship = this.newShip(); // Reset position
        }
    }

    updateScore() {
        const scoreEl = this.getElement('#score');
        if (scoreEl) scoreEl.textContent = this.score;
    }

    updateLives() {
        const livesEl = this.getElement('#lives');
        if (livesEl) livesEl.textContent = this.lives;
    }
}

export default Asteroids;