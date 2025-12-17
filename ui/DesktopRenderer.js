/**
 * DesktopRenderer - Renders and manages desktop icons
 * Handles icon display, drag & drop, and desktop interactions
 */

import EventBus, { Events } from '../core/EventBus.js';
import StateManager from '../core/StateManager.js';
import AppRegistry from '../apps/AppRegistry.js';
import FileSystemManager from '../core/FileSystemManager.js';

class DesktopRendererClass {
    constructor() {
        this.desktop = null;
        this.draggedIcon = null;
        this.dragOffset = { x: 0, y: 0 };
        this.dragStarted = false;
        this.selectionBox = null;
        this.selectionStart = null;
        this.isExternalDrag = false; // Track if drag came from another component

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

        // Listen for file system changes
        EventBus.on('filesystem:changed', () => this.render());
        EventBus.on('filesystem:file:changed', () => this.render());
        EventBus.on('filesystem:directory:changed', () => this.render());

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

        // Render app/link icons from StateManager
        icons.forEach(icon => this.renderIcon(icon));

        // Render file icons from Desktop folder
        this.renderFileIcons();
    }

    /**
     * Render file icons from the Desktop folder
     * Skips .lnk files since those are already rendered from StateManager icons
     */
    renderFileIcons() {
        try {
            const desktopPath = ['C:', 'Users', 'Seth', 'Desktop'];
            const files = FileSystemManager.listDirectory(desktopPath);

            // Filter out .lnk files - those are shortcuts synced from StateManager
            // and are already displayed as icons on the desktop
            const realFiles = files.filter(file => file.extension !== 'lnk');

            // Get saved file positions
            const filePositions = StateManager.getState('filePositions') || {};

            // Calculate next available position for new files
            let nextX = 10;
            let nextY = 10;
            const existingIcons = StateManager.getState('icons') || [];

            // Find the rightmost column of app icons
            if (existingIcons.length > 0) {
                const maxX = Math.max(...existingIcons.map(i => i.x || 0));
                nextX = maxX + 100; // Start file icons in next column
            }

            realFiles.forEach((file, index) => {
                const fileId = `file_${file.name}`;

                // Use saved position or calculate new one
                let x = nextX;
                let y = nextY + (index * 90);

                if (filePositions[fileId]) {
                    x = filePositions[fileId].x;
                    y = filePositions[fileId].y;
                }

                const fileIcon = {
                    id: fileId,
                    emoji: this.getFileEmoji(file),
                    label: file.name,
                    type: 'file',
                    filePath: [...desktopPath, file.name],
                    fileType: file.type,
                    extension: file.extension,
                    x: x,
                    y: y
                };

                this.renderIcon(fileIcon);
            });
        } catch (e) {
            console.log('Desktop folder empty or not found:', e.message);
        }
    }

    /**
     * Get emoji icon for file based on type
     * @param {Object} file - File metadata
     * @returns {string} Emoji
     */
    getFileEmoji(file) {
        if (file.type === 'directory') {
            return '📁';
        } else if (file.type === 'file') {
            switch (file.extension) {
                case 'txt':
                case 'md':
                    return '📝';
                case 'png':
                case 'jpg':
                case 'bmp':
                    return '🖼️';
                case 'exe':
                    return '⚙️';
                case 'log':
                    return '📋';
                default:
                    return '📄';
            }
        }
        return '📄';
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

        // Make file icons draggable via HTML5 drag and drop
        if (icon.type === 'file' && icon.filePath) {
            iconEl.draggable = true;
            iconEl.dataset.filePath = JSON.stringify(icon.filePath);
            iconEl.dataset.fileType = icon.fileType || 'file';
        }

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

        // HTML5 drag events for file icons
        if (icon.type === 'file' && icon.filePath) {
            iconEl.addEventListener('dragstart', (e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('application/retros-file', JSON.stringify({
                    filePath: icon.filePath,
                    fileName: icon.label,
                    fileType: icon.fileType || 'file',
                    extension: icon.extension || ''
                }));
                iconEl.classList.add('dragging');
                this.isExternalDrag = true;
            });

            iconEl.addEventListener('dragend', () => {
                iconEl.classList.remove('dragging');
                this.isExternalDrag = false;
            });
        }

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
            AppRegistry.launch('browser', { url: icon.url });
        } else if (icon.type === 'app') {
            AppRegistry.launch(icon.id);
        } else if (icon.type === 'file') {
            // Open file in appropriate app
            this.openFile(icon);
        }
    }

    /**
     * Open a file in the appropriate application
     * @param {Object} icon - File icon data
     */
    openFile(icon) {
        const { filePath, extension, fileType } = icon;

        if (fileType === 'directory') {
            // Open directory in My Computer
            AppRegistry.launch('mycomputer', { initialPath: filePath });
        } else {
            // Open file based on extension
            if (extension === 'txt' || extension === 'md' || extension === 'log') {
                AppRegistry.launch('notepad', { filePath });
            } else if (extension === 'png' || extension === 'jpg' || extension === 'bmp') {
                AppRegistry.launch('paint', { filePath });
            } else {
                console.log('No app registered for file type:', extension);
            }
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

        // HTML5 Drag and Drop - Drop zone for receiving files from other components
        this.desktop.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            // Only show drop indicator for external drags (from MyComputer)
            const dragData = e.dataTransfer.types.includes('application/retros-file');
            if (dragData) {
                e.dataTransfer.dropEffect = 'move';
                this.desktop.classList.add('drop-target');
            }
        });

        this.desktop.addEventListener('dragleave', (e) => {
            // Only remove if actually leaving the desktop
            if (e.target === this.desktop) {
                this.desktop.classList.remove('drop-target');
            }
        });

        this.desktop.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.desktop.classList.remove('drop-target');
            this.handleFileDrop(e);
        });
    }

    /**
     * Handle file drop from other components
     * @param {DragEvent} e - Drag event
     */
    handleFileDrop(e) {
        const data = e.dataTransfer.getData('application/retros-file');
        if (!data) return;

        try {
            const fileData = JSON.parse(data);
            const { filePath, fileName, fileType } = fileData;

            if (!filePath || !Array.isArray(filePath)) {
                console.error('Invalid file path in drop data');
                return;
            }

            // Desktop folder path
            const desktopPath = ['C:', 'Users', 'Seth', 'Desktop'];

            // Check if already on desktop
            const sourceDir = filePath.slice(0, -1);
            if (JSON.stringify(sourceDir) === JSON.stringify(desktopPath)) {
                console.log('File is already on desktop');
                return;
            }

            // Move the file to desktop
            try {
                FileSystemManager.moveItem(filePath, desktopPath);
                EventBus.emit(Events.SOUND_PLAY, { type: 'notify' });
                console.log(`Moved ${fileName} to Desktop`);
            } catch (err) {
                console.error('Failed to move file:', err.message);
                EventBus.emit(Events.SOUND_PLAY, { type: 'error' });
            }
        } catch (err) {
            console.error('Failed to parse drop data:', err);
        }
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

        // Prevent HTML5 drag from interfering with mouse-based drag
        e.preventDefault();

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

        if (data.type === 'file') {
            // Save file icon position to filePositions state
            this.saveFilePosition(data.id, x, y);
        } else {
            // Save app icon position to icons state
            StateManager.updateIconPosition(data.id, x, y);
        }

        EventBus.emit(Events.DRAG_END, { type: 'icon', id: data.id });
        EventBus.emit(Events.ICON_MOVE, { id: data.id, x, y });

        this.draggedIcon = null;
        document.removeEventListener('mousemove', this.boundDrag);
        document.removeEventListener('mouseup', this.boundDragEnd);
    }

    /**
     * Save file icon position
     * @param {string} fileId - File icon ID
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    saveFilePosition(fileId, x, y) {
        const filePositions = StateManager.getState('filePositions') || {};
        filePositions[fileId] = { x, y };
        StateManager.setState('filePositions', filePositions, true);
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
