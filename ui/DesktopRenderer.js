/**
 * DesktopRenderer - Renders and manages desktop icons
 * Handles icon display, drag & drop, and desktop interactions
 */

import EventBus, { Events } from '../core/EventBus.js';
import StateManager from '../core/StateManager.js';
import AppRegistry from '../apps/AppRegistry.js';

class DesktopRendererClass {
    constructor() {
        this.desktop = null;
        this.draggedIcon = null;
        this.dragOffset = { x: 0, y: 0 };
        this.dragStarted = false;
        this.selectionBox = null;
        this.selectionStart = null;

        // Bound handlers
        this.boundDrag = this.handleDrag.bind(this);
        this.boundDragEnd = this.handleDragEnd.bind(this);
        this.boundUpdateSelection = this.updateSelection.bind(this);
        this.boundEndSelection = this.endSelection.bind(this);
    }

    /**
     * Initialize desktop renderer
     */
    initialize() {
        this.desktop = document.getElementById('desktop');
        if (!this.desktop) {
            console.error('[DesktopRenderer] Desktop element not found');
            return;
        }

        // Initial render
        this.render();

        // Subscribe to state changes
        StateManager.subscribe('icons', () => this.render());

        // Listen for render requests
        EventBus.on('desktop:render', () => this.render());

        // Setup desktop events
        this.setupDesktopEvents();

        console.log('[DesktopRenderer] Initialized');
    }

    /**
     * Render all desktop icons
     */
    render() {
        if (!this.desktop) return;

        const icons = StateManager.getState('icons') || [];

        // Clear existing icons (preserve special elements)
        Array.from(this.desktop.children).forEach(child => {
            if (child.classList.contains('icon')) {
                child.remove();
            }
        });

        // Render icons
        icons.forEach(icon => this.renderIcon(icon));
    }

    /**
     * Render a single icon
     * @param {Object} icon - Icon data
     */
    renderIcon(icon) {
        const iconEl = document.createElement('div');
        iconEl.className = 'icon';
        iconEl.dataset.iconId = icon.id;
        iconEl.style.left = `${icon.x}px`;
        iconEl.style.top = `${icon.y}px`;
        iconEl.tabIndex = 0;

        iconEl.innerHTML = `
            <div class="icon-image">${icon.emoji}</div>
            <div class="icon-label">${icon.label}</div>
        `;

        // Events
        iconEl.addEventListener('mousedown', (e) => this.startDrag(e, icon));
        iconEl.addEventListener('dblclick', () => this.handleIconOpen(icon));
        iconEl.addEventListener('contextmenu', (e) => this.showIconContextMenu(e, icon));
        iconEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.handleIconOpen(icon);
        });

        this.desktop.appendChild(iconEl);
    }

    /**
     * Handle icon double-click
     * @param {Object} icon - Icon data
     */
    handleIconOpen(icon) {
        EventBus.emit(Events.SOUND_PLAY, { type: 'open' });
        EventBus.emit(Events.ICON_DBLCLICK, { icon });

        if (icon.type === 'link' && icon.url) {
            window.open(icon.url, '_blank');
        } else if (icon.type === 'app') {
            AppRegistry.launch(icon.id);
        }
    }

    /**
     * Setup desktop-level events
     */
    setupDesktopEvents() {
        // Context menu on desktop
        this.desktop.addEventListener('contextmenu', (e) => {
            if (e.target === this.desktop) {
                e.preventDefault();
                EventBus.emit(Events.CONTEXT_MENU_SHOW, {
                    x: e.clientX,
                    y: e.clientY,
                    type: 'desktop'
                });
            }
        });

        // Selection box
        this.desktop.addEventListener('mousedown', (e) => {
            if (e.target === this.desktop && e.button === 0) {
                this.startSelection(e);
            }
        });

        // Click to deselect
        this.desktop.addEventListener('click', (e) => {
            if (e.target === this.desktop) {
                this.deselectAll();
            }
        });
    }

    // ===== ICON DRAG & DROP =====

    /**
     * Start dragging an icon
     * @param {MouseEvent} e - Mouse event
     * @param {Object} icon - Icon data
     */
    startDrag(e, icon) {
        if (e.button !== 0) return; // Only left click
        e.stopPropagation();

        const iconEl = e.currentTarget;
        const startX = e.clientX;
        const startY = e.clientY;
        const dragThreshold = 5;

        this.dragStarted = false;

        const checkDrag = (moveEvent) => {
            const deltaX = Math.abs(moveEvent.clientX - startX);
            const deltaY = Math.abs(moveEvent.clientY - startY);

            if (!this.dragStarted && (deltaX > dragThreshold || deltaY > dragThreshold)) {
                this.dragStarted = true;

                this.draggedIcon = { element: iconEl, data: icon };
                const rect = iconEl.getBoundingClientRect();
                this.dragOffset = {
                    x: startX - rect.left,
                    y: startY - rect.top
                };

                iconEl.classList.add('dragging');

                document.removeEventListener('mousemove', checkDrag);
                document.removeEventListener('mouseup', cleanup);
                document.addEventListener('mousemove', this.boundDrag);
                document.addEventListener('mouseup', this.boundDragEnd);

                EventBus.emit(Events.DRAG_START, { type: 'icon', id: icon.id });
            }
        };

        const cleanup = () => {
            document.removeEventListener('mousemove', checkDrag);
            document.removeEventListener('mouseup', cleanup);
        };

        document.addEventListener('mousemove', checkDrag);
        document.addEventListener('mouseup', cleanup);
    }

    /**
     * Handle icon drag movement
     * @param {MouseEvent} e - Mouse event
     */
    handleDrag(e) {
        if (!this.draggedIcon) return;

        const desktopRect = this.desktop.getBoundingClientRect();
        let x = e.clientX - desktopRect.left - this.dragOffset.x;
        let y = e.clientY - desktopRect.top - this.dragOffset.y;

        // Keep on screen
        x = Math.max(0, Math.min(x, desktopRect.width - 100));
        y = Math.max(0, Math.min(y, desktopRect.height - 100));

        // Snap to grid
        const gridSize = 20;
        x = Math.round(x / gridSize) * gridSize;
        y = Math.round(y / gridSize) * gridSize;

        this.draggedIcon.element.style.left = `${x}px`;
        this.draggedIcon.element.style.top = `${y}px`;
    }

    /**
     * End icon drag
     */
    handleDragEnd() {
        if (!this.draggedIcon) return;

        const { element, data } = this.draggedIcon;
        element.classList.remove('dragging');

        // Save new position
        const x = parseInt(element.style.left);
        const y = parseInt(element.style.top);
        StateManager.updateIconPosition(data.id, x, y);

        EventBus.emit(Events.DRAG_END, { type: 'icon', id: data.id });
        EventBus.emit(Events.ICON_MOVE, { id: data.id, x, y });

        this.draggedIcon = null;
        document.removeEventListener('mousemove', this.boundDrag);
        document.removeEventListener('mouseup', this.boundDragEnd);
    }

    // ===== SELECTION BOX =====

    /**
     * Start selection box
     * @param {MouseEvent} e - Mouse event
     */
    startSelection(e) {
        this.deselectAll();

        this.selectionStart = { x: e.clientX, y: e.clientY };

        if (!this.selectionBox) {
            this.selectionBox = document.createElement('div');
            this.selectionBox.className = 'selection-box';
            document.body.appendChild(this.selectionBox);
        }

        this.selectionBox.style.left = `${e.clientX}px`;
        this.selectionBox.style.top = `${e.clientY}px`;
        this.selectionBox.style.width = '0px';
        this.selectionBox.style.height = '0px';
        this.selectionBox.classList.add('active');

        document.addEventListener('mousemove', this.boundUpdateSelection);
        document.addEventListener('mouseup', this.boundEndSelection);
    }

    /**
     * Update selection box
     * @param {MouseEvent} e - Mouse event
     */
    updateSelection(e) {
        if (!this.selectionStart || !this.selectionBox) return;

        const width = Math.abs(e.clientX - this.selectionStart.x);
        const height = Math.abs(e.clientY - this.selectionStart.y);
        const left = Math.min(e.clientX, this.selectionStart.x);
        const top = Math.min(e.clientY, this.selectionStart.y);

        this.selectionBox.style.left = `${left}px`;
        this.selectionBox.style.top = `${top}px`;
        this.selectionBox.style.width = `${width}px`;
        this.selectionBox.style.height = `${height}px`;
    }

    /**
     * End selection box
     */
    endSelection() {
        if (this.selectionBox && this.selectionStart) {
            const boxRect = this.selectionBox.getBoundingClientRect();

            // Select icons within bounds
            this.desktop.querySelectorAll('.icon').forEach(icon => {
                const iconRect = icon.getBoundingClientRect();
                const overlaps = !(
                    iconRect.right < boxRect.left ||
                    iconRect.left > boxRect.right ||
                    iconRect.bottom < boxRect.top ||
                    iconRect.top > boxRect.bottom
                );

                if (overlaps) {
                    icon.classList.add('selected');
                }
            });
        }

        if (this.selectionBox) {
            this.selectionBox.classList.remove('active');
        }

        this.selectionStart = null;
        document.removeEventListener('mousemove', this.boundUpdateSelection);
        document.removeEventListener('mouseup', this.boundEndSelection);
    }

    /**
     * Deselect all icons
     */
    deselectAll() {
        this.desktop.querySelectorAll('.icon.selected').forEach(icon => {
            icon.classList.remove('selected');
        });
    }

    /**
     * Show icon context menu
     * @param {MouseEvent} e - Mouse event
     * @param {Object} icon - Icon data
     */
    showIconContextMenu(e, icon) {
        e.preventDefault();
        e.stopPropagation();

        EventBus.emit(Events.CONTEXT_MENU_SHOW, {
            x: e.clientX,
            y: e.clientY,
            type: 'icon',
            icon
        });
    }

    /**
     * Arrange icons in grid
     */
    arrangeIcons() {
        const icons = StateManager.getState('icons') || [];
        let x = 20, y = 20;

        icons.forEach(icon => {
            icon.x = x;
            icon.y = y;
            y += 100;
            if (y > window.innerHeight - 200) {
                y = 20;
                x += 120;
            }
        });

        StateManager.setState('icons', icons, true);
        this.render();
    }

    /**
     * Refresh desktop with shake animation
     */
    refresh() {
        if (this.desktop) {
            this.desktop.classList.add('shake');
            setTimeout(() => this.desktop.classList.remove('shake'), 500);
        }
        this.render();
    }
}

// Singleton
const DesktopRenderer = new DesktopRendererClass();

export default DesktopRenderer;
