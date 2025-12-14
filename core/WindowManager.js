/**
 * WindowManager - Central window lifecycle management
 * Handles create, focus, minimize, maximize, close, drag, resize
 * All window operations go through this manager
 */

import EventBus, { Events } from './EventBus.js';
import StateManager from './StateManager.js';

class WindowManagerClass {
    constructor() {
        // Currently dragging window
        this.draggedWindow = null;
        // Currently resizing window
        this.resizingWindow = null;
        // Drag offset
        this.dragOffset = { x: 0, y: 0 };
        // Window counter for z-index
        this.zCounter = 1000;
        // Minimum window dimensions
        this.minWidth = 300;
        this.minHeight = 200;
        // Bound handlers for cleanup
        this.boundDragMove = this.handleDragMove.bind(this);
        this.boundDragEnd = this.handleDragEnd.bind(this);
        this.boundResizeMove = this.handleResizeMove.bind(this);
        this.boundResizeEnd = this.handleResizeEnd.bind(this);
    }

    /**
     * Initialize window manager
     */
    initialize() {
        // Listen for state changes to update taskbar
        StateManager.subscribe('windows', () => {
            EventBus.emit(Events.TASKBAR_UPDATE);
        });
    }

    /**
     * Create a new window
     * @param {Object} config - Window configuration
     * @returns {HTMLElement} Window element
     */
    create(config) {
        const {
            id,
            title,
            content,
            width = 500,
            height = 'auto',
            icon = '&#128196;',  // HTML entity for page emoji - safe encoding
            resizable = true,
            onClose = null
        } = config;

        // Check if window already exists
        const existing = document.getElementById(`window-${id}`);
        if (existing) {
            this.focus(id);
            return existing;
        }

        // Play open sound
        EventBus.emit(Events.SOUND_PLAY, { type: 'open' });

        // Create window element
        const windowEl = document.createElement('div');
        windowEl.id = `window-${id}`;
        windowEl.className = 'window open active'; // 'open' = visible, 'active' = focused
        windowEl.style.width = typeof width === 'number' ? `${width}px` : width;
        if (height !== 'auto') {
            windowEl.style.height = typeof height === 'number' ? `${height}px` : height;
        }

        // Calculate position (cascade from previous windows)
        const windowCount = StateManager.getState('windows').length;
        const left = Math.max(50, (window.innerWidth - (typeof width === 'number' ? width : 500)) / 2 + (windowCount * 20));
        const top = Math.max(50, 100 + (windowCount * 20));
        windowEl.style.left = `${left}px`;
        windowEl.style.top = `${top}px`;
        windowEl.style.zIndex = ++this.zCounter;

        // Build window HTML - using ASCII-safe characters for buttons
        windowEl.innerHTML = `
            <div class="title-bar" data-window-id="${id}">
                <span class="title-text">
                    <span style="margin-right: 5px;">${icon}</span>
                    ${title}
                </span>
            <div class="window-controls">
                    <button class="window-button" data-action="minimize" title="Minimize">_</button>
                    <button class="window-button" data-action="maximize" title="Maximize">[ ]</button>
                    <button class="window-button" data-action="close" title="Close">X</button>
                </div>
            </div>
            <div class="window-content">${content}</div>
            ${resizable ? '<div class="resize-handle" data-window-id="' + id + '"></div>' : ''}
        `;

        // Add to DOM
        document.body.appendChild(windowEl);

        // Setup event listeners
        this.setupWindowEvents(windowEl, id, onClose);

        // Add to state
        StateManager.addWindow({
            id,
            title: `${icon} ${title}`,
            element: windowEl,
            onClose
        });

        // Emit open event
        EventBus.emit(Events.WINDOW_OPEN, { id, title });

        // Check achievement
        if (StateManager.getState('windows').length >= 10) {
            StateManager.unlockAchievement('multitasker');
        }

        return windowEl;
    }

    /**
     * Setup event listeners for a window
     * @param {HTMLElement} windowEl - Window element
     * @param {string} id - Window ID
     * @param {Function} onClose - Close callback
     */
    setupWindowEvents(windowEl, id, onClose) {
        const titleBar = windowEl.querySelector('.title-bar');
        const controls = windowEl.querySelector('.window-controls');
        const resizeHandle = windowEl.querySelector('.resize-handle');

        // Title bar drag
        titleBar.addEventListener('mousedown', (e) => {
            if (e.target.closest('.window-controls')) return;
            this.startDrag(e, id);
        });

        // Double-click to maximize
        titleBar.addEventListener('dblclick', () => this.maximize(id));

        // Window controls
        controls.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            if (action === 'minimize') this.minimize(id);
            else if (action === 'maximize') this.maximize(id);
            else if (action === 'close') this.close(id);
        });

        // Resize handle
        if (resizeHandle) {
            resizeHandle.addEventListener('mousedown', (e) => this.startResize(e, id));
        }

        // Click to focus
        windowEl.addEventListener('mousedown', () => this.focus(id));
    }

    /**
     * Focus a window (bring to front)
     * @param {string} id - Window ID
     */
    focus(id) {
        const windowEl = document.getElementById(`window-${id}`);
        if (!windowEl) return;

        // Remove active from all windows
        document.querySelectorAll('.window').forEach(w => {
            w.classList.remove('active');
        });

        // Activate this window
        windowEl.classList.add('active');
        windowEl.style.zIndex = ++this.zCounter;

        // Update state
        StateManager.focusWindow(id);

        // Emit focus event
        EventBus.emit(Events.WINDOW_FOCUS, { id });
    }

    /**
     * Minimize a window
     * @param {string} id - Window ID
     */
    minimize(id) {
        const windowEl = document.getElementById(`window-${id}`);
        if (!windowEl) return;

        windowEl.classList.add('minimizing');

        setTimeout(() => {
            windowEl.classList.remove('active', 'minimizing');
            windowEl.classList.add('minimized'); // Hide the window
            StateManager.updateWindow(id, { minimized: true });
            EventBus.emit(Events.WINDOW_MINIMIZE, { id });
        }, 300);

        EventBus.emit(Events.SOUND_PLAY, { type: 'click' });
    }

    /**
     * Restore a minimized window
     * @param {string} id - Window ID
     */
    restore(id) {
        const windowEl = document.getElementById(`window-${id}`);
        if (!windowEl) return;

        windowEl.classList.remove('minimized'); // Show the window
        windowEl.classList.add('restoring');

        setTimeout(() => {
            windowEl.classList.remove('restoring');
        }, 300);

        StateManager.updateWindow(id, { minimized: false });
        this.focus(id);

        EventBus.emit(Events.WINDOW_RESTORE, { id });
    }

    /**
     * Toggle maximize state
     * @param {string} id - Window ID
     */
    maximize(id) {
        const windowEl = document.getElementById(`window-${id}`);
        if (!windowEl) return;

        windowEl.classList.toggle('maximized');
        const isMaximized = windowEl.classList.contains('maximized');
        
        StateManager.updateWindow(id, { maximized: isMaximized });
        EventBus.emit(Events.WINDOW_MAXIMIZE, { id, maximized: isMaximized });
    }

    /**
     * Close a window
     * @param {string} id - Window ID
     */
    close(id) {
        const windowEl = document.getElementById(`window-${id}`);
        if (!windowEl) return;

        // Get window data for callback
        const windowData = StateManager.getWindow(id);

        // Play close sound
        EventBus.emit(Events.SOUND_PLAY, { type: 'close' });

        // Animate out
        windowEl.classList.add('minimizing');

        setTimeout(() => {
            // Call onClose callback if provided
            if (windowData && windowData.onClose) {
                windowData.onClose();
            }

            // Remove from DOM
            windowEl.remove();

            // Remove from state
            StateManager.removeWindow(id);

            // Emit close event
            EventBus.emit(Events.WINDOW_CLOSE, { id });
        }, 200);
    }

    /**
     * Close all windows
     */
    closeAll() {
        const windows = [...StateManager.getState('windows')];
        windows.forEach(w => this.close(w.id));
    }

    // ===== DRAG HANDLING =====

    /**
     * Start dragging a window
     * @param {MouseEvent} e - Mouse event
     * @param {string} id - Window ID
     */
    startDrag(e, id) {
        const windowEl = document.getElementById(`window-${id}`);
        if (!windowEl) return;

        // If maximized, un-maximize first
        if (windowEl.classList.contains('maximized')) {
            windowEl.classList.remove('maximized');
        }

        this.draggedWindow = { element: windowEl, id };
        const rect = windowEl.getBoundingClientRect();
        this.dragOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };

        document.addEventListener('mousemove', this.boundDragMove);
        document.addEventListener('mouseup', this.boundDragEnd);

        EventBus.emit(Events.DRAG_START, { type: 'window', id });
    }

    /**
     * Handle window drag movement
     * @param {MouseEvent} e - Mouse event
     */
    handleDragMove(e) {
        if (!this.draggedWindow) return;

        let x = e.clientX - this.dragOffset.x;
        let y = e.clientY - this.dragOffset.y;

        // Keep on screen
        x = Math.max(0, Math.min(x, window.innerWidth - 100));
        y = Math.max(0, Math.min(y, window.innerHeight - 100));

        this.draggedWindow.element.style.left = `${x}px`;
        this.draggedWindow.element.style.top = `${y}px`;
    }

    /**
     * End window drag
     */
    handleDragEnd() {
        if (this.draggedWindow) {
            EventBus.emit(Events.DRAG_END, { type: 'window', id: this.draggedWindow.id });
        }

        this.draggedWindow = null;
        document.removeEventListener('mousemove', this.boundDragMove);
        document.removeEventListener('mouseup', this.boundDragEnd);
    }

    // ===== RESIZE HANDLING =====

    /**
     * Start resizing a window
     * @param {MouseEvent} e - Mouse event
     * @param {string} id - Window ID
     */
    startResize(e, id) {
        e.preventDefault();
        e.stopPropagation();

        const windowEl = document.getElementById(`window-${id}`);
        if (!windowEl) return;

        this.resizingWindow = { element: windowEl, id };

        document.addEventListener('mousemove', this.boundResizeMove);
        document.addEventListener('mouseup', this.boundResizeEnd);
    }

    /**
     * Handle resize movement
     * @param {MouseEvent} e - Mouse event
     */
    handleResizeMove(e) {
        if (!this.resizingWindow) return;

        const rect = this.resizingWindow.element.getBoundingClientRect();
        const width = Math.max(this.minWidth, e.clientX - rect.left);
        const height = Math.max(this.minHeight, e.clientY - rect.top);

        this.resizingWindow.element.style.width = `${width}px`;
        this.resizingWindow.element.style.height = `${height}px`;
    }

    /**
     * End resize
     */
    handleResizeEnd() {
        this.resizingWindow = null;
        document.removeEventListener('mousemove', this.boundResizeMove);
        document.removeEventListener('mouseup', this.boundResizeEnd);
    }

    // ===== UTILITY METHODS =====

    /**
     * Get window element by ID
     * @param {string} id - Window ID
     * @returns {HTMLElement|null}
     */
    getElement(id) {
        return document.getElementById(`window-${id}`);
    }

    /**
     * Check if window is open
     * @param {string} id - Window ID
     * @returns {boolean}
     */
    isOpen(id) {
        return !!document.getElementById(`window-${id}`);
    }

    /**
     * Check if window is minimized
     * @param {string} id - Window ID
     * @returns {boolean}
     */
    isMinimized(id) {
        const win = StateManager.getWindow(id);
        return win ? win.minimized : false;
    }

    /**
     * Toggle window visibility
     * @param {string} id - Window ID
     */
    toggle(id) {
        if (this.isMinimized(id)) {
            this.restore(id);
        } else if (this.isActive(id)) {
            this.minimize(id);
        } else {
            this.focus(id);
        }
    }

    /**
     * Check if window is active
     * @param {string} id - Window ID
     * @returns {boolean}
     */
    isActive(id) {
        return StateManager.getState('ui.activeWindow') === id;
    }

    /**
     * Get all open window IDs
     * @returns {string[]}
     */
    getOpenIds() {
        return StateManager.getState('windows').map(w => w.id);
    }
}

// Singleton instance
const WindowManager = new WindowManagerClass();

export default WindowManager;