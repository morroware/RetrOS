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
        this.selectionBox = null;
        this.selectionStart = null;

        // Bound handlers for selection box
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

            // Use a FIXED starting position for file icons to prevent them from
            // shifting when app icons are moved. This ensures file icons have
            // stable positions independent of app icon positions.
            const FILE_ICONS_START_X = 120;
            const FILE_ICONS_START_Y = 10;
            const FILE_ICON_SPACING = 90;

            let positionsUpdated = false;

            realFiles.forEach((file, index) => {
                const fileId = `file_${file.name}`;

                let x, y;

                // Use saved position if it exists
                if (filePositions[fileId]) {
                    x = filePositions[fileId].x;
                    y = filePositions[fileId].y;
                } else {
                    // Calculate initial position using fixed starting point
                    x = FILE_ICONS_START_X;
                    y = FILE_ICONS_START_Y + (index * FILE_ICON_SPACING);

                    // Save this position immediately so it persists across re-renders
                    filePositions[fileId] = { x, y };
                    positionsUpdated = true;
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

            // Persist new file positions if any were added
            if (positionsUpdated) {
                StateManager.setState('filePositions', filePositions, true);
            }
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
        iconEl.draggable = true;

        // Store icon data for drag operations
        iconEl.dataset.iconType = icon.type || 'app';
        if (icon.filePath) {
            iconEl.dataset.filePath = JSON.stringify(icon.filePath);
            iconEl.dataset.fileType = icon.fileType || 'file';
        }

        // Store full icon data for reference
        iconEl._iconData = icon;

        iconEl.innerHTML = `
            <div class="icon-image">${icon.emoji}</div>
            <div class="icon-label">${icon.label}</div>
        `;

        // Double-click to open
        iconEl.addEventListener('dblclick', () => this.handleIconOpen(icon));
        iconEl.addEventListener('contextmenu', (e) => this.showIconContextMenu(e, icon));
        iconEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.handleIconOpen(icon);
        });

        // HTML5 drag start - set transfer data
        iconEl.addEventListener('dragstart', (e) => {
            // Store the icon being dragged for repositioning
            this.draggedIcon = { element: iconEl, data: icon };

            // Calculate offset from mouse to icon top-left
            const rect = iconEl.getBoundingClientRect();
            this.dragOffset = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };

            e.dataTransfer.effectAllowed = 'copyMove';

            // Set custom drag image (the icon itself)
            const dragImage = iconEl.cloneNode(true);
            dragImage.style.position = 'absolute';
            dragImage.style.top = '-1000px';
            dragImage.style.opacity = '0.8';
            document.body.appendChild(dragImage);
            e.dataTransfer.setDragImage(dragImage, this.dragOffset.x, this.dragOffset.y);
            setTimeout(() => dragImage.remove(), 0);

            // Set transfer data for inter-component drag
            if (icon.type === 'file' && icon.filePath) {
                e.dataTransfer.setData('application/retros-file', JSON.stringify({
                    filePath: icon.filePath,
                    fileName: icon.label,
                    fileType: icon.fileType || 'file',
                    extension: icon.extension || ''
                }));
            } else {
                e.dataTransfer.setData('application/retros-shortcut', JSON.stringify({
                    id: icon.id,
                    label: icon.label,
                    emoji: icon.emoji,
                    type: icon.type || 'app',
                    url: icon.url || null
                }));
                e.dataTransfer.setData('application/retros-file', JSON.stringify({
                    filePath: null,
                    fileName: icon.label,
                    fileType: 'shortcut',
                    isShortcut: true,
                    shortcutTarget: icon.type === 'link' ? icon.url : icon.id,
                    shortcutType: icon.type || 'app',
                    shortcutIcon: icon.emoji
                }));
            }

            // Set desktop icon ID for repositioning
            e.dataTransfer.setData('application/retros-desktop-icon', JSON.stringify({
                id: icon.id,
                type: icon.type
            }));

            iconEl.classList.add('dragging');
            EventBus.emit(Events.DRAG_START, { type: 'icon', id: icon.id });
        });

        iconEl.addEventListener('dragend', () => {
            iconEl.classList.remove('dragging');
            this.draggedIcon = null;
            EventBus.emit(Events.DRAG_END, { type: 'icon', id: icon.id });
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

        // HTML5 Drag and Drop - Desktop is a drop zone
        this.desktop.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Check if this is a desktop icon being repositioned
            const isDesktopIcon = e.dataTransfer.types.includes('application/retros-desktop-icon');
            const isFileData = e.dataTransfer.types.includes('application/retros-file');

            if (isDesktopIcon || isFileData) {
                e.dataTransfer.dropEffect = 'move';
                // Only show drop-target for external files (from MyComputer), not for repositioning
                if (!isDesktopIcon && isFileData) {
                    this.desktop.classList.add('drop-target');
                }
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

            // Check if this is a desktop icon being repositioned
            const desktopIconData = e.dataTransfer.getData('application/retros-desktop-icon');
            if (desktopIconData) {
                this.handleDesktopIconDrop(e, desktopIconData);
                return;
            }

            // Otherwise handle as file drop from MyComputer
            this.handleFileDrop(e);
        });
    }

    /**
     * Handle desktop icon repositioning via drop
     * @param {DragEvent} e - Drag event
     * @param {string} desktopIconData - JSON string with icon data
     */
    handleDesktopIconDrop(e, desktopIconData) {
        try {
            const iconInfo = JSON.parse(desktopIconData);
            const desktopRect = this.desktop.getBoundingClientRect();

            // Calculate new position
            let x = e.clientX - desktopRect.left - this.dragOffset.x;
            let y = e.clientY - desktopRect.top - this.dragOffset.y;

            // Keep on screen
            x = Math.max(0, Math.min(x, desktopRect.width - 100));
            y = Math.max(0, Math.min(y, desktopRect.height - 100));

            // Snap to grid
            const gridSize = 20;
            x = Math.round(x / gridSize) * gridSize;
            y = Math.round(y / gridSize) * gridSize;

            // Find and update the icon element
            const iconEl = this.desktop.querySelector(`[data-icon-id="${iconInfo.id}"]`);
            if (iconEl) {
                iconEl.style.left = `${x}px`;
                iconEl.style.top = `${y}px`;
            }

            // Save position based on icon type
            if (iconInfo.type === 'file') {
                this.saveFilePosition(iconInfo.id, x, y);
            } else {
                StateManager.updateIconPosition(iconInfo.id, x, y);
            }

            EventBus.emit(Events.ICON_MOVE, { id: iconInfo.id, x, y });
        } catch (err) {
            console.error('Failed to reposition desktop icon:', err);
        }
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
                this.showDropFeedback('File is already on desktop', 'info');
                return;
            }

            // Move the file to desktop
            try {
                FileSystemManager.moveItem(filePath, desktopPath);
                EventBus.emit(Events.SOUND_PLAY, { type: 'notify' });
                this.showDropFeedback(`Moved "${fileName}" to Desktop`, 'success');
            } catch (err) {
                console.error('Failed to move file:', err.message);
                EventBus.emit(Events.SOUND_PLAY, { type: 'error' });
                this.showDropFeedback(`Failed to move file: ${err.message}`, 'error');
            }
        } catch (err) {
            console.error('Failed to parse drop data:', err);
        }
    }

    /**
     * Show feedback toast for drag and drop operations
     * @param {string} message - Message to display
     * @param {string} type - 'success', 'error', or 'info'
     */
    showDropFeedback(message, type = 'info') {
        // Remove any existing feedback
        const existing = document.querySelector('.drop-feedback');
        if (existing) existing.remove();

        const feedback = document.createElement('div');
        feedback.className = `drop-feedback drop-feedback-${type}`;
        feedback.textContent = message;
        document.body.appendChild(feedback);

        // Animate in
        requestAnimationFrame(() => {
            feedback.classList.add('active');
        });

        // Remove after delay
        setTimeout(() => {
            feedback.classList.remove('active');
            setTimeout(() => feedback.remove(), 300);
        }, 2000);
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
