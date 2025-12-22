/**
 * Minesweeper Game (Final)
 * Classic Windows 95 implementation.
 * Features: First-click safety, Chording, Accurate Timer, Win95 Visuals.
 */

import AppBase from './AppBase.js';
import StateManager from '../core/StateManager.js';
import { Events } from '../core/scripted-events/SemanticEvents.js';

class Minesweeper extends AppBase {
    constructor() {
        super({
            id: 'minesweeper',
            name: 'Minesweeper',
            icon: '💣',
            width: 234,
            height: 'auto',
            resizable: false,
            singleton: true, // One game at a time
            category: 'games'
        });

        this.rows = 9;
        this.cols = 9;
        this.mines = 10;
        this.grid = [];
        this.gameOver = false;
        this.timer = null;
        this.time = 0;
        this.isFirstClick = true;
    }

    onOpen() {
        return `
            <div class="minesweeper-window">
                <div class="ms-header-inset">
                    <div class="mine-info">
                        <div class="digital-display inset-border" id="mineCount">010</div>
                        <button class="mine-face-btn" id="mineFace">
                            <span class="face-icon">😀</span>
                        </button>
                        <div class="digital-display inset-border" id="mineTimer">000</div>
                    </div>
                </div>
                <div class="mine-grid-wrapper inset-border">
                    <div class="mine-grid" id="mineGrid"></div>
                </div>
            </div>
        `;
    }

    onMount() {
        this.getElement('#mineFace')?.addEventListener('click', () => this.initGame());
        this.initGame();
    }

    onClose() {
        this.stopTimer();
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    initGame() {
        this.stopTimer();
        this.time = 0;
        this.gameOver = false;
        this.isFirstClick = true;
        this.grid = [];

        // Emit game started event
        this.emit(Events.MINESWEEPER_STARTED, {
            difficulty: 'beginner',
            rows: this.rows,
            cols: this.cols,
            mines: this.mines
        });
        this.emit(Events.GAME_STARTED, { appId: 'minesweeper', difficulty: 'beginner' });
        
        // Reset UI
        this.updateFace('😀');
        this.updateTimerDisplay();
        this.updateMineCounter(this.mines);

        const gridEl = this.getElement('#mineGrid');
        if (!gridEl) return;
        
        gridEl.innerHTML = '';
        // 24px is the standard Win95 cell size
        gridEl.style.gridTemplateColumns = `repeat(${this.cols}, 24px)`; 

        // Generate Grid
        for (let r = 0; r < this.rows; r++) {
            this.grid[r] = [];
            for (let c = 0; c < this.cols; c++) {
                const cellElement = document.createElement('div');
                cellElement.className = 'mine-cell';
                
                const cell = {
                    r, c,
                    mine: false,
                    revealed: false,
                    flagged: false,
                    question: false,
                    count: 0,
                    element: cellElement
                };

                this.attachCellEvents(cellElement, r, c);
                
                this.grid[r][c] = cell;
                gridEl.appendChild(cellElement);
            }
        }
    }

    attachCellEvents(el, r, c) {
        // Mouse Down (Face reaction)
        el.addEventListener('mousedown', (e) => {
            if (this.gameOver || this.grid[r][c].revealed) return;
            if (e.button === 0) this.updateFace('😮');
        });

        // Global Mouse Up (Reset face)
        document.addEventListener('mouseup', () => {
            if (!this.gameOver) this.updateFace('😀');
        }, { once: true });

        // Left Click (Reveal or Chord)
        el.addEventListener('click', () => {
            if (this.grid[r][c].revealed) {
                this.attemptChord(r, c);
            } else {
                this.reveal(r, c);
            }
        });

        // Right Click (Flag)
        el.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.toggleFlag(r, c);
        });
    }

    placeMines(safeR, safeC) {
        let placed = 0;
        while (placed < this.mines) {
            const r = Math.floor(Math.random() * this.rows);
            const c = Math.floor(Math.random() * this.cols);
            
            // Protect first click and its immediate neighbors
            if (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) continue;

            if (!this.grid[r][c].mine) {
                this.grid[r][c].mine = true;
                placed++;
            }
        }

        // Calculate neighbor counts
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (!this.grid[r][c].mine) {
                    this.grid[r][c].count = this.countNeighbors(r, c, (cell) => cell.mine);
                }
            }
        }
    }

    countNeighbors(r, c, predicate) {
        let count = 0;
        for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
                if (di === 0 && dj === 0) continue;
                const ni = r + di, nj = c + dj;
                if (this.isValid(ni, nj) && predicate(this.grid[ni][nj])) {
                    count++;
                }
            }
        }
        return count;
    }

    isValid(r, c) {
        return r >= 0 && r < this.rows && c >= 0 && c < this.cols;
    }

    startTimer() {
        if (this.timer) return;
        this.timer = setInterval(() => {
            this.time++;
            if (this.time > 999) this.time = 999;
            this.updateTimerDisplay();
            this.emit(Events.MINESWEEPER_TIMER_TICK, { time: this.time });
        }, 1000);
    }

    updateTimerDisplay() {
        const el = this.getElement('#mineTimer');
        if (el) el.textContent = String(this.time).padStart(3, '0');
    }

    reveal(r, c) {
        if (this.gameOver) return;
        
        const cell = this.grid[r][c];
        if (cell.revealed || cell.flagged) return;

        // First click safety
        if (this.isFirstClick) {
            this.isFirstClick = false;
            this.placeMines(r, c);
            this.startTimer();
        }

        cell.revealed = true;
        cell.element.classList.add('revealed');

        // Emit cell revealed event
        this.emit(Events.MINESWEEPER_CELL_REVEALED, {
            row: r,
            col: c,
            value: cell.mine ? 'mine' : cell.count,
            isFirstClick: !this.timer // First click just started the timer
        });

        if (cell.mine) {
            this.triggerGameOver(false, cell); // Pass the killing cell
            return;
        }

        if (cell.count > 0) {
            cell.element.textContent = cell.count;
            cell.element.classList.add(`val-${cell.count}`);
        } else {
            // Flood fill empty cells
            for (let di = -1; di <= 1; di++) {
                for (let dj = -1; dj <= 1; dj++) {
                    const ni = r + di, nj = c + dj;
                    if (this.isValid(ni, nj)) {
                        this.reveal(ni, nj);
                    }
                }
            }
        }

        this.checkWinCondition();
    }

    attemptChord(r, c) {
        const cell = this.grid[r][c];
        if (cell.count === 0) return;

        const flagCount = this.countNeighbors(r, c, (n) => n.flagged);

        if (flagCount === cell.count) {
            let cellsRevealed = 0;
            for (let di = -1; di <= 1; di++) {
                for (let dj = -1; dj <= 1; dj++) {
                    const ni = r + di, nj = c + dj;
                    if (this.isValid(ni, nj)) {
                        const neighbor = this.grid[ni][nj];
                        if (!neighbor.revealed && !neighbor.flagged) {
                            this.reveal(ni, nj);
                            cellsRevealed++;
                        }
                    }
                }
            }
            // Emit chord event
            if (cellsRevealed > 0) {
                this.emit(Events.MINESWEEPER_CHORD, { row: r, col: c, cellsRevealed });
            }
        }
    }

    toggleFlag(r, c) {
        if (this.gameOver) return;
        const cell = this.grid[r][c];
        if (cell.revealed) return;

        cell.flagged = !cell.flagged;
        cell.element.classList.toggle('flagged', cell.flagged);

        // Emit flag event
        this.emit(Events.MINESWEEPER_CELL_FLAGGED, {
            row: r,
            col: c,
            flagged: cell.flagged
        });

        const totalFlagged = this.grid.flat().filter(c => c.flagged).length;
        this.updateMineCounter(this.mines - totalFlagged);
    }

    updateMineCounter(count) {
        const el = this.getElement('#mineCount');
        if (el) el.textContent = String(Math.max(-99, Math.min(999, count))).padStart(3, '0');
    }

    triggerGameOver(win, killingCell = null) {
        this.gameOver = true;
        this.stopTimer();

        const totalFlagged = this.grid.flat().filter(c => c.flagged).length;

        if (win) {
            this.updateFace('😎');
            this.flagAllMines();
            StateManager.unlockAchievement('mine_sweeper');

            // Emit win events
            this.emit(Events.MINESWEEPER_WIN, {
                time: this.time,
                difficulty: 'beginner',
                flagsUsed: totalFlagged
            });
            this.emit(Events.GAME_WIN, {
                appId: 'minesweeper',
                time: this.time,
                difficulty: 'beginner'
            });
        } else {
            this.updateFace('😵');

            // Emit lose events
            this.emit(Events.MINESWEEPER_LOSE, {
                time: this.time,
                row: killingCell?.r,
                col: killingCell?.c
            });
            this.emit(Events.GAME_LOSE, {
                appId: 'minesweeper',
                time: this.time,
                reason: 'hit_mine'
            });

            // Highlight ONLY the mine that killed you
            if (killingCell) {
                killingCell.element.classList.add('mine-hit');
            }

            this.revealAllMines();
            this.playSound('error');
        }
    }

    checkWinCondition() {
        let revealedCount = 0;
        for (let row of this.grid) {
            for (let cell of row) {
                if (cell.revealed) revealedCount++;
            }
        }

        const safeCells = (this.rows * this.cols) - this.mines;
        if (revealedCount === safeCells) {
            this.triggerGameOver(true);
        }
    }

    revealAllMines() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = this.grid[r][c];
                
                // Show unflagged mines
                if (cell.mine && !cell.flagged) {
                    cell.element.classList.add('revealed', 'mine');
                    cell.element.textContent = '💣';
                }
                
                // Show false flags (crossed out)
                if (!cell.mine && cell.flagged) {
                    cell.element.classList.add('false-flag');
                }
            }
        }
    }

    flagAllMines() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = this.grid[r][c];
                if (cell.mine && !cell.flagged) {
                    cell.flagged = true;
                    cell.element.classList.add('flagged');
                }
            }
        }
        this.updateMineCounter(0);
    }

    updateFace(face) {
        const el = this.getElement('#mineFace span');
        if (el) el.textContent = face;
    }
}

export default Minesweeper;