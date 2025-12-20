/**
 * DesktopPet - Animated desktop companion with retro behaviors
 * Inspired by classic desktop pets like eSheep, Neko, and Shimeji
 * Singleton pattern
 */

import EventBus, { Events } from '../core/EventBus.js';
import StateManager from '../core/StateManager.js';

// Pet behavior states
const STATES = {
    IDLE: 'idle',
    WALKING: 'walking',
    RUNNING: 'running',
    SLEEPING: 'sleeping',
    SITTING: 'sitting',
    JUMPING: 'jumping',
    FALLING: 'falling',
    DRAGGING: 'dragging',
    SCRATCHING: 'scratching',
    YAWNING: 'yawning',
    PLAYING: 'playing',
    CURIOUS: 'curious',
    GROOMING: 'grooming'
};

// Fortune messages
const FORTUNES = [
    "You will find happiness in a retro OS.",
    "A mysterious paperclip brings wisdom.",
    "Your lucky numbers are 640, 95, 1998.",
    "Today is good for defragmentation.",
    "Beware of the Y2K bug!",
    "A wild dialog box appears!",
    "The cursor holds secrets...",
    "Remember to backup your floppies!"
];

class DesktopPetClass {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.container = null;

        // Physics
        this.x = 100;
        this.y = 100;
        this.vx = 0;
        this.vy = 0;
        this.gravity = 0.5;
        this.bounce = 0.3;

        // Animation
        this.state = STATES.IDLE;
        this.facing = 1; // 1 = right, -1 = left
        this.frame = 0;
        this.frameTimer = 0;
        this.frameDelay = 8;

        // Behavior
        this.stateTimer = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.clickCount = 0;

        // Interaction
        this.isDragging = false;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;

        // Size
        this.width = 32;
        this.height = 32;

        // Activity tracking
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.cursorChaseTimer = 0;

        // Animation loop
        this.animationId = null;
        this.enabled = false;
    }

    initialize() {
        console.log('[DesktopPet] Initializing enhanced desktop pet...');

        // Get container
        this.container = document.getElementById('desktopPet');
        if (!this.container) {
            console.error('[DesktopPet] Container element not found');
            return;
        }

        // Create canvas for sprite rendering
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.imageRendering = 'pixelated'; // Crisp pixel art
        this.canvas.style.imageRendering = '-moz-crisp-edges';
        this.canvas.style.imageRendering = 'crisp-edges';
        this.ctx = this.canvas.getContext('2d');

        // Clear existing content and add canvas
        this.container.innerHTML = '';
        this.container.appendChild(this.canvas);

        // Position container absolutely
        this.container.style.position = 'fixed';
        this.container.style.cursor = 'pointer';
        this.container.style.zIndex = '8999';
        this.container.style.pointerEvents = 'auto';

        // Load saved state
        const enabled = StateManager.getState('settings.pet.enabled');
        this.enabled = enabled;

        if (enabled) {
            this.show();
        }

        // Set up event listeners
        this.setupEventListeners();

        // Listen for toggle events
        EventBus.on(Events.PET_TOGGLE, ({ enabled }) => {
            this.toggle(enabled);
        });

        console.log('[DesktopPet] Enhanced desktop pet initialized');
    }

    setupEventListeners() {
        // Mouse tracking for cursor following
        document.addEventListener('mousemove', (e) => {
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        });

        // Click on pet
        this.container.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.startDrag(e);
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.updateDrag(e);
            }
        });

        document.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.endDrag();
            }
        });

        // Double-click for fortune
        this.container.addEventListener('dblclick', () => {
            this.showFortune();
        });
    }

    show() {
        this.enabled = true;
        this.container.style.display = 'block';

        // Start at random position
        this.x = Math.random() * (window.innerWidth - this.width);
        this.y = Math.random() * (window.innerHeight - this.height - 100); // Above taskbar

        this.updatePosition();

        // Start animation loop
        if (!this.animationId) {
            this.animate();
        }
    }

    hide() {
        this.enabled = false;
        this.container.style.display = 'none';

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    toggle(enabled) {
        if (enabled) {
            this.show();
        } else {
            this.hide();
        }
        StateManager.setState('settings.pet.enabled', enabled, true);
    }

    // Dragging
    startDrag(e) {
        this.isDragging = true;
        this.state = STATES.DRAGGING;
        this.dragOffsetX = e.clientX - this.x;
        this.dragOffsetY = e.clientY - this.y;
        this.vx = 0;
        this.vy = 0;
        this.container.style.cursor = 'grabbing';
    }

    updateDrag(e) {
        if (this.isDragging) {
            this.x = e.clientX - this.dragOffsetX;
            this.y = e.clientY - this.dragOffsetY;
            this.updatePosition();
        }
    }

    endDrag() {
        this.isDragging = false;
        this.container.style.cursor = 'pointer';
        this.state = STATES.FALLING;
        this.vy = 2; // Small drop velocity
    }

    // Animation loop
    animate() {
        if (!this.enabled) return;

        this.update();
        this.render();

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    // Update logic
    update() {
        // Update frame animation
        this.frameTimer++;
        if (this.frameTimer >= this.frameDelay) {
            this.frameTimer = 0;
            this.frame++;
        }

        // Update state timer
        this.stateTimer++;

        // Don't update physics or AI while dragging
        if (this.state === STATES.DRAGGING) {
            return;
        }

        // Apply physics
        this.applyPhysics();

        // Update AI behavior
        this.updateBehavior();

        // Keep in bounds
        this.constrainToBounds();

        // Update DOM position
        this.updatePosition();
    }

    applyPhysics() {
        const ground = window.innerHeight - 100 - this.height; // Above taskbar

        // Apply gravity if not on ground
        if (this.y < ground) {
            this.vy += this.gravity;
            if (this.state !== STATES.JUMPING) {
                this.state = STATES.FALLING;
            }
        } else {
            // On ground
            this.y = ground;

            if (this.state === STATES.FALLING || this.state === STATES.JUMPING) {
                // Bounce
                if (Math.abs(this.vy) > 2) {
                    this.vy = -this.vy * this.bounce;
                } else {
                    this.vy = 0;
                    this.state = STATES.IDLE;
                    this.stateTimer = 0;
                }
            }
        }

        // Apply velocity
        this.x += this.vx;
        this.y += this.vy;

        // Friction
        this.vx *= 0.95;
    }

    updateBehavior() {
        const ground = window.innerHeight - 100 - this.height;

        // Don't change behavior while in air
        if (this.y < ground - 5) {
            return;
        }

        // Random behavior changes
        const rand = Math.random();

        switch (this.state) {
            case STATES.IDLE:
                if (this.stateTimer > 120) {
                    this.chooseNewBehavior();
                }
                break;

            case STATES.WALKING:
                // Walk in current direction
                this.vx = this.facing * 1.5;
                this.frame = this.frame % 4;

                if (this.stateTimer > 180 || rand < 0.005) {
                    this.chooseNewBehavior();
                }
                break;

            case STATES.RUNNING:
                // Run faster
                this.vx = this.facing * 3;
                this.frame = this.frame % 4;
                this.frameDelay = 4; // Faster animation

                if (this.stateTimer > 120 || rand < 0.01) {
                    this.chooseNewBehavior();
                }
                break;

            case STATES.SITTING:
                this.vx = 0;
                if (this.stateTimer > 240) {
                    this.chooseNewBehavior();
                }
                break;

            case STATES.SLEEPING:
                this.vx = 0;
                if (this.stateTimer > 480 || rand < 0.002) {
                    this.state = STATES.YAWNING;
                    this.stateTimer = 0;
                }
                break;

            case STATES.YAWNING:
                this.vx = 0;
                if (this.stateTimer > 40) {
                    this.state = STATES.IDLE;
                    this.stateTimer = 0;
                }
                break;

            case STATES.SCRATCHING:
                this.vx = 0;
                if (this.stateTimer > 60) {
                    this.state = STATES.IDLE;
                    this.stateTimer = 0;
                }
                break;

            case STATES.GROOMING:
                this.vx = 0;
                if (this.stateTimer > 120) {
                    this.state = STATES.IDLE;
                    this.stateTimer = 0;
                }
                break;

            case STATES.PLAYING:
                // Playful jumping
                if (this.stateTimer % 30 === 0 && rand < 0.5) {
                    this.vy = -8;
                }
                this.vx = Math.sin(this.stateTimer / 10) * 2;

                if (this.stateTimer > 180) {
                    this.state = STATES.IDLE;
                    this.stateTimer = 0;
                }
                break;

            case STATES.CURIOUS:
                // Follow cursor if nearby
                const dx = this.lastMouseX - this.x;
                const dy = this.lastMouseY - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 200 && distance > 40) {
                    this.facing = dx > 0 ? 1 : -1;
                    this.vx = this.facing * 2;
                } else {
                    this.vx *= 0.9;
                }

                if (this.stateTimer > 180 || distance < 40) {
                    this.state = STATES.IDLE;
                    this.stateTimer = 0;
                }
                break;
        }

        // Random events
        if (rand < 0.001) {
            // Random jump!
            if (this.state !== STATES.SLEEPING) {
                this.state = STATES.JUMPING;
                this.vy = -12;
                this.stateTimer = 0;
            }
        }

        // Occasionally chase cursor
        if (rand < 0.0005) {
            this.state = STATES.CURIOUS;
            this.stateTimer = 0;
        }
    }

    chooseNewBehavior() {
        const rand = Math.random();
        this.stateTimer = 0;
        this.frameDelay = 8;

        if (rand < 0.15) {
            this.state = STATES.WALKING;
            this.facing = Math.random() < 0.5 ? 1 : -1;
        } else if (rand < 0.25) {
            this.state = STATES.RUNNING;
            this.facing = Math.random() < 0.5 ? 1 : -1;
        } else if (rand < 0.35) {
            this.state = STATES.SITTING;
        } else if (rand < 0.45) {
            this.state = STATES.SLEEPING;
        } else if (rand < 0.55) {
            this.state = STATES.SCRATCHING;
        } else if (rand < 0.65) {
            this.state = STATES.GROOMING;
        } else if (rand < 0.75) {
            this.state = STATES.PLAYING;
        } else {
            this.state = STATES.IDLE;
        }
    }

    constrainToBounds() {
        const margin = 10;

        // Horizontal bounds
        if (this.x < -margin) {
            this.x = -margin;
            this.vx = Math.abs(this.vx);
            this.facing = 1;
        }

        if (this.x > window.innerWidth - this.width + margin) {
            this.x = window.innerWidth - this.width + margin;
            this.vx = -Math.abs(this.vx);
            this.facing = -1;
        }

        // Vertical bounds
        if (this.y < 0) {
            this.y = 0;
            this.vy = 0;
        }

        const ground = window.innerHeight - 100 - this.height;
        if (this.y > ground) {
            this.y = ground;
        }
    }

    updatePosition() {
        this.container.style.left = this.x + 'px';
        this.container.style.top = this.y + 'px';
    }

    // Rendering
    render() {
        if (!this.ctx) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw based on state
        this.drawPet();
    }

    drawPet() {
        const ctx = this.ctx;
        const centerX = this.width / 2;
        const centerY = this.height / 2;

        // Save context for transformations
        ctx.save();

        // Flip horizontally if facing left
        if (this.facing < 0) {
            ctx.translate(this.width, 0);
            ctx.scale(-1, 1);
        }

        // Draw different sprites based on state
        switch (this.state) {
            case STATES.IDLE:
                this.drawIdleSprite(ctx);
                break;
            case STATES.WALKING:
            case STATES.RUNNING:
                this.drawWalkSprite(ctx);
                break;
            case STATES.SITTING:
                this.drawSitSprite(ctx);
                break;
            case STATES.SLEEPING:
                this.drawSleepSprite(ctx);
                break;
            case STATES.JUMPING:
            case STATES.FALLING:
            case STATES.DRAGGING:
                this.drawJumpSprite(ctx);
                break;
            case STATES.SCRATCHING:
                this.drawScratchSprite(ctx);
                break;
            case STATES.YAWNING:
                this.drawYawnSprite(ctx);
                break;
            case STATES.GROOMING:
                this.drawGroomSprite(ctx);
                break;
            case STATES.PLAYING:
            case STATES.CURIOUS:
                this.drawPlaySprite(ctx);
                break;
            default:
                this.drawIdleSprite(ctx);
        }

        ctx.restore();
    }

    // Pixel art drawing functions
    drawIdleSprite(ctx) {
        const bob = Math.sin(this.stateTimer / 20) * 1; // Gentle bobbing

        // Body (dog-like)
        ctx.fillStyle = '#8B4513'; // Brown
        ctx.fillRect(8, 16 + bob, 16, 10); // Body

        // Head
        ctx.fillRect(18, 10 + bob, 10, 10); // Head

        // Ears
        ctx.fillRect(18, 8 + bob, 3, 4); // Left ear
        ctx.fillRect(25, 8 + bob, 3, 4); // Right ear

        // Legs
        ctx.fillRect(10, 26 + bob, 3, 6); // Front left
        ctx.fillRect(15, 26 + bob, 3, 6); // Front right
        ctx.fillRect(18, 26 + bob, 3, 6); // Back left
        ctx.fillRect(23, 26 + bob, 3, 6); // Back right

        // Tail
        ctx.fillRect(6, 18 + bob, 4, 3);

        // Eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(22, 13 + bob, 2, 2); // Eye

        // Nose
        ctx.fillRect(26, 16 + bob, 2, 2);

        // Highlights
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(9, 17 + bob, 6, 3);
        ctx.fillRect(19, 11 + bob, 4, 3);
    }

    drawWalkSprite(ctx) {
        const walkCycle = Math.floor(this.frame) % 4;
        const legOffset = [0, 2, 0, -2][walkCycle];

        // Body
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(8, 16, 16, 10);

        // Head bobbing
        const headBob = [0, -1, 0, 1][walkCycle];
        ctx.fillRect(18, 10 + headBob, 10, 10);

        // Ears
        ctx.fillRect(18, 8 + headBob, 3, 4);
        ctx.fillRect(25, 8 + headBob, 3, 4);

        // Animated legs
        ctx.fillRect(10, 26 + legOffset, 3, 6); // Front left
        ctx.fillRect(15, 26 - legOffset, 3, 6); // Front right
        ctx.fillRect(18, 26 - legOffset, 3, 6); // Back left
        ctx.fillRect(23, 26 + legOffset, 3, 6); // Back right

        // Tail wagging
        const tailWag = [0, 2, 0, -2][walkCycle];
        ctx.fillRect(6, 18 + tailWag, 4, 3);

        // Eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(22, 13 + headBob, 2, 2);

        // Nose
        ctx.fillRect(26, 16 + headBob, 2, 2);

        // Highlights
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(9, 17, 6, 3);
        ctx.fillRect(19, 11 + headBob, 4, 3);
    }

    drawSitSprite(ctx) {
        // Body sitting
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(12, 20, 12, 12); // Body

        // Head
        ctx.fillRect(16, 14, 10, 10);

        // Ears
        ctx.fillRect(16, 12, 3, 4);
        ctx.fillRect(23, 12, 3, 4);

        // Front legs
        ctx.fillRect(14, 28, 3, 4);
        ctx.fillRect(19, 28, 3, 4);

        // Tail curled
        ctx.fillRect(10, 24, 4, 3);

        // Eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(20, 17, 2, 2);

        // Nose
        ctx.fillRect(24, 20, 2, 2);

        // Highlights
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(13, 21, 4, 3);
        ctx.fillRect(17, 15, 4, 3);
    }

    drawSleepSprite(ctx) {
        // Body lying down
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(6, 24, 20, 8); // Body

        // Head on ground
        ctx.fillRect(20, 22, 10, 8);

        // Ears flat
        ctx.fillRect(20, 21, 3, 3);
        ctx.fillRect(27, 21, 3, 3);

        // Tail
        ctx.fillRect(4, 26, 4, 3);

        // Closed eyes (lines)
        ctx.fillStyle = '#000000';
        ctx.fillRect(24, 25, 3, 1);

        // Z's for sleeping
        const zOffset = (this.stateTimer % 60) / 15;
        ctx.fillStyle = '#666666';
        ctx.fillRect(28, 16 - zOffset, 2, 2);
        ctx.fillRect(26, 12 - zOffset, 2, 2);
        ctx.fillRect(28, 8 - zOffset, 2, 2);

        // Highlights
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(7, 25, 6, 2);
    }

    drawJumpSprite(ctx) {
        // Body in air
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(10, 14, 14, 10);

        // Head
        ctx.fillRect(18, 10, 10, 8);

        // Ears up
        ctx.fillRect(18, 8, 3, 4);
        ctx.fillRect(25, 8, 3, 4);

        // Legs tucked
        ctx.fillRect(12, 22, 3, 4);
        ctx.fillRect(17, 22, 3, 4);

        // Tail up
        ctx.fillRect(8, 12, 4, 6);

        // Eyes wide
        ctx.fillStyle = '#000000';
        ctx.fillRect(22, 13, 2, 2);

        // Nose
        ctx.fillRect(26, 15, 2, 2);

        // Highlights
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(11, 15, 4, 3);
    }

    drawScratchSprite(ctx) {
        const scratchFrame = Math.floor(this.stateTimer / 5) % 2;

        // Body
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(12, 18, 14, 10);

        // Head tilted
        ctx.fillRect(18, 14, 10, 8);

        // Ears
        ctx.fillRect(18, 12, 3, 4);
        ctx.fillRect(25, 12, 3, 4);

        // One leg up scratching
        const legY = scratchFrame === 0 ? 20 : 18;
        ctx.fillRect(20, legY, 3, 6);

        // Other legs
        ctx.fillRect(14, 26, 3, 4);
        ctx.fillRect(24, 26, 3, 4);

        // Tail
        ctx.fillRect(10, 20, 4, 3);

        // Eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(22, 17, 2, 2);

        // Scratch marks
        ctx.fillStyle = '#666666';
        if (scratchFrame === 1) {
            ctx.fillRect(22, 15, 1, 3);
            ctx.fillRect(24, 14, 1, 3);
        }
    }

    drawYawnSprite(ctx) {
        // Body
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(10, 18, 14, 10);

        // Head tilted back
        ctx.fillRect(18, 12, 10, 10);

        // Ears
        ctx.fillRect(18, 10, 3, 4);
        ctx.fillRect(25, 10, 3, 4);

        // Legs
        ctx.fillRect(12, 26, 3, 6);
        ctx.fillRect(17, 26, 3, 6);
        ctx.fillRect(20, 26, 3, 6);

        // Tail
        ctx.fillRect(8, 20, 4, 3);

        // Eyes closed
        ctx.fillStyle = '#000000';
        ctx.fillRect(22, 15, 2, 1);

        // Mouth open (yawn)
        ctx.fillRect(24, 17, 3, 4);
        ctx.fillStyle = '#FFB6C1';
        ctx.fillRect(25, 18, 1, 2);
    }

    drawGroomSprite(ctx) {
        const groomFrame = Math.floor(this.stateTimer / 8) % 2;

        // Body
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(10, 20, 16, 8);

        // Head bent down
        const headY = groomFrame === 0 ? 18 : 20;
        ctx.fillRect(18, headY, 10, 8);

        // Ears
        ctx.fillRect(18, headY - 2, 3, 3);
        ctx.fillRect(25, headY - 2, 3, 3);

        // Legs
        ctx.fillRect(12, 26, 3, 4);
        ctx.fillRect(21, 26, 3, 4);

        // Tail
        ctx.fillRect(8, 22, 4, 3);

        // Licking motion
        if (groomFrame === 1) {
            ctx.fillStyle = '#FFB6C1';
            ctx.fillRect(16, 24, 3, 2);
        }
    }

    drawPlaySprite(ctx) {
        const playFrame = Math.floor(this.stateTimer / 6) % 3;
        const bounce = [0, -2, 0][playFrame];

        // Body
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(10, 16 + bounce, 14, 10);

        // Head
        ctx.fillRect(18, 12 + bounce, 10, 8);

        // Ears perked
        ctx.fillRect(18, 10 + bounce, 3, 4);
        ctx.fillRect(25, 10 + bounce, 3, 4);

        // Legs in playful stance
        const legBounce = bounce / 2;
        ctx.fillRect(12, 24 + legBounce, 3, 6);
        ctx.fillRect(17, 26 - legBounce, 3, 6);
        ctx.fillRect(20, 26 - legBounce, 3, 6);
        ctx.fillRect(23, 24 + legBounce, 3, 6);

        // Tail wagging fast
        const tailWag = Math.sin(this.stateTimer / 3) * 3;
        ctx.fillRect(8, 18 + tailWag + bounce, 4, 3);

        // Eyes bright
        ctx.fillStyle = '#000000';
        ctx.fillRect(22, 15 + bounce, 2, 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(23, 15 + bounce, 1, 1); // Sparkle

        // Tongue out
        ctx.fillStyle = '#FFB6C1';
        ctx.fillRect(26, 18 + bounce, 3, 2);
    }

    showFortune() {
        const fortune = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];

        // Create alert dialog
        const overlay = document.createElement('div');
        overlay.className = 'dialog-overlay active';
        overlay.innerHTML = `
            <div class="dialog-box">
                <div class="dialog-icon">🔮</div>
                <div class="dialog-text">Your pet says:<br><br>"${fortune}"</div>
                <div class="dialog-buttons">
                    <button class="btn btn-primary">Thanks!</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.querySelector('button').onclick = () => overlay.remove();

        StateManager.unlockAchievement('fortune_teller');

        // Pet reacts
        this.state = STATES.PLAYING;
        this.stateTimer = 0;
    }

    getAvailablePets() {
        return ['Dog']; // For now, just the dog sprite
    }
}

const DesktopPet = new DesktopPetClass();
export default DesktopPet;
