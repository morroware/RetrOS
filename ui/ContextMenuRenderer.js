/**
 * ContextMenuRenderer - Manages all context menus
 * Singleton pattern
 */

import EventBus, { Events } from '../core/EventBus.js';
import StateManager from '../core/StateManager.js';
import AppRegistry from '../apps/AppRegistry.js';
import WindowManager from '../core/WindowManager.js';
import FileSystemManager from '../core/FileSystemManager.js';
import SystemDialogs from '../features/SystemDialogs.js';

class ContextMenuRendererClass {
    constructor() {
        this.element = null;
        this.currentContext = null;
    }

    initialize() {
        this.element = document.getElementById('contextMenu');
        if (!this.element) {
            console.error('[ContextMenuRenderer] Menu element not found');
            return;
        }

        // Close on click outside
        document.addEventListener('click', (e) => {
            if (this.element && !this.element.contains(e.target)) {
                this.hide();
            }
        });

        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.hide();
        });

        // Listen for show events
        EventBus.on(Events.CONTEXT_MENU_SHOW, ({ x, y, type, icon, windowId }) => {
            this.show(x, y, type, { icon, windowId });
        });

        // Listen for desktop actions
        EventBus.on('desktop:arrange', () => {
            import('./DesktopRenderer.js').then(m => m.default.arrangeIcons());
        });
        EventBus.on('desktop:refresh', () => {
            import('./DesktopRenderer.js').then(m => m.default.refresh());
        });

        console.log('[ContextMenuRenderer] Initialized');
    }

    show(x, y, type, context = {}) {
        if (!this.element) return;

        this.currentContext = { type, ...context };
        
        // Generate menu
        this.element.innerHTML = this.generateMenu(type, context);
        
        // Position (keep on screen)
        x = Math.min(x, window.innerWidth - 200);
        y = Math.min(y, window.innerHeight - 200);
        
        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;
        this.element.classList.add('active');
        
        this.attachHandlers();
    }

    hide() {
        if (this.element) {
            this.element.classList.remove('active');
        }
        this.currentContext = null;
    }

    generateMenu(type, context) {
        switch (type) {
            case 'desktop': return this.desktopMenu();
            case 'icon': return this.iconMenu(context);
            case 'taskbar': return this.taskbarMenu(context);
            default: return this.desktopMenu();
        }
    }

    desktopMenu() {
        return `
            <div class="context-item" data-action="arrange">Arrange Icons</div>
            <div class="context-item" data-action="refresh">Refresh</div>
            <div class="context-divider"></div>
            <div class="context-item submenu-trigger">
                New
                <span class="submenu-arrow">▶</span>
                <div class="context-submenu">
                    <div class="context-item" data-action="new-folder">📁 Folder</div>
                    <div class="context-divider"></div>
                    <div class="context-item" data-action="new-text">📝 Text Document</div>
                    <div class="context-item" data-action="new-image">🖼️ Bitmap Image</div>
                </div>
            </div>
            <div class="context-divider"></div>
            <div class="context-item" data-action="open-terminal">💻 Open Terminal Here</div>
            <div class="context-divider"></div>
            <div class="context-item" data-action="properties">Properties</div>
        `;
    }

    iconMenu(context) {
        const icon = context.icon;

        // Different menu for files vs apps
        if (icon.type === 'file') {
            const isTextFile = ['txt', 'md', 'log'].includes(icon.extension);
            const isImageFile = ['png', 'jpg', 'bmp'].includes(icon.extension);

            return `
                <div class="context-item" data-action="open"><strong>Open</strong></div>
                ${isTextFile ? '<div class="context-item" data-action="edit-notepad">Edit with Notepad</div>' : ''}
                ${isImageFile ? '<div class="context-item" data-action="edit-paint">Edit with Paint</div>' : ''}
                <div class="context-divider"></div>
                <div class="context-item" data-action="rename">Rename</div>
                <div class="context-item" data-action="delete">Delete</div>
                <div class="context-divider"></div>
                <div class="context-item" data-action="properties">Properties</div>
            `;
        }

        // App icons
        return `
            <div class="context-item" data-action="open"><strong>Open</strong></div>
            <div class="context-divider"></div>
            <div class="context-item" data-action="delete">Remove from Desktop</div>
            <div class="context-item" data-action="properties">Properties</div>
        `;
    }

    taskbarMenu(context) {
        return `
            <div class="context-item" data-action="restore">Restore</div>
            <div class="context-item" data-action="minimize">Minimize</div>
            <div class="context-item" data-action="maximize">Maximize</div>
            <div class="context-divider"></div>
            <div class="context-item" data-action="close">Close</div>
        `;
    }

    attachHandlers() {
        this.element.querySelectorAll('[data-action]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleAction(item.dataset.action);
            });
        });
    }

    handleAction(action) {
        const context = this.currentContext;
        this.hide();

        const desktopPath = ['C:', 'Users', 'Seth', 'Desktop'];

        switch (action) {
            case 'arrange':
                EventBus.emit('desktop:arrange');
                break;
            case 'refresh':
                EventBus.emit('desktop:refresh');
                break;
            case 'new-folder':
                this.createNewFolder(desktopPath);
                break;
            case 'new-text':
                this.createNewTextFile(desktopPath);
                break;
            case 'new-image':
                AppRegistry.launch('paint');
                break;
            case 'open-terminal':
                AppRegistry.launch('terminal');
                break;
            case 'properties':
                AppRegistry.launch('display');
                break;
            case 'open':
                if (context?.icon) {
                    if (context.icon.type === 'link') {
                        AppRegistry.launch('browser', { url: context.icon.url });
                    } else if (context.icon.type === 'file') {
                        // Open file in appropriate app
                        this.openFileIcon(context.icon);
                    } else {
                        AppRegistry.launch(context.icon.id);
                    }
                }
                break;
            case 'edit-notepad':
                if (context?.icon?.filePath) {
                    AppRegistry.launch('notepad', { filePath: context.icon.filePath });
                }
                break;
            case 'edit-paint':
                if (context?.icon?.filePath) {
                    AppRegistry.launch('paint', { filePath: context.icon.filePath });
                }
                break;
            case 'rename':
                if (context?.icon?.type === 'file') {
                    this.renameFileIcon(context.icon);
                }
                break;
            case 'delete':
                if (context?.icon) {
                    // If it's a file from the filesystem, delete it
                    if (context.icon.type === 'file' && context.icon.filePath) {
                        this.deleteFileIcon(context.icon);
                    } else {
                        StateManager.recycleIcon(context.icon.id);
                    }
                    EventBus.emit('desktop:render');
                }
                break;
            case 'restore':
                if (context?.windowId) WindowManager.restore(context.windowId);
                break;
            case 'minimize':
                if (context?.windowId) WindowManager.minimize(context.windowId);
                break;
            case 'maximize':
                if (context?.windowId) WindowManager.maximize(context.windowId);
                break;
            case 'close':
                if (context?.windowId) WindowManager.close(context.windowId);
                break;
        }
    }

    async createNewFolder(basePath) {
        const name = await SystemDialogs.prompt('Enter folder name:', 'New Folder', 'New Folder');
        if (!name) return;

        try {
            const folderPath = [...basePath, name];
            FileSystemManager.createDirectory(folderPath);
            EventBus.emit('desktop:refresh');
        } catch (e) {
            await SystemDialogs.alert(`Error creating folder: ${e.message}`, 'Error', 'error');
        }
    }

    async createNewTextFile(basePath) {
        const name = await SystemDialogs.prompt('Enter file name:', 'New Text Document.txt', 'New File');
        if (!name) return;

        try {
            let fileName = name;
            if (!fileName.includes('.')) {
                fileName += '.txt';
            }
            const filePath = [...basePath, fileName];
            FileSystemManager.writeFile(filePath, '', 'txt');

            // Open in Notepad
            AppRegistry.launch('notepad', { filePath });
        } catch (e) {
            await SystemDialogs.alert(`Error creating file: ${e.message}`, 'Error', 'error');
        }
    }

    openFileIcon(icon) {
        const { filePath, extension, fileType } = icon;

        if (fileType === 'directory') {
            AppRegistry.launch('mycomputer', { initialPath: filePath });
        } else if (extension === 'txt' || extension === 'md' || extension === 'log') {
            AppRegistry.launch('notepad', { filePath });
        } else if (extension === 'png' || extension === 'jpg' || extension === 'bmp') {
            AppRegistry.launch('paint', { filePath });
        }
    }

    async deleteFileIcon(icon) {
        const { filePath, fileType } = icon;

        const confirmed = await SystemDialogs.confirm(`Delete "${icon.label}"?`, 'Confirm Delete');
        if (!confirmed) return;

        try {
            if (fileType === 'directory') {
                // Try normal delete first
                try {
                    FileSystemManager.deleteDirectory(filePath);
                } catch (e) {
                    if (e.message.includes('not empty')) {
                        // Ask if user wants to delete recursively
                        const deleteAll = await SystemDialogs.confirm(
                            `"${icon.label}" is not empty. Delete all contents?`,
                            'Confirm Delete'
                        );
                        if (deleteAll) {
                            FileSystemManager.deleteDirectory(filePath, true);
                        }
                    } else {
                        throw e;
                    }
                }
            } else {
                FileSystemManager.deleteFile(filePath);
            }
        } catch (e) {
            await SystemDialogs.alert(`Error deleting: ${e.message}`, 'Error', 'error');
        }
    }

    async renameFileIcon(icon) {
        const { filePath, fileType } = icon;
        const oldName = icon.label;

        const newName = await SystemDialogs.prompt(`Rename "${oldName}" to:`, oldName, 'Rename');
        if (!newName || newName === oldName) return;

        try {
            // Read the content
            const content = FileSystemManager.readFile(filePath);
            const info = FileSystemManager.getInfo(filePath);

            // Create new file path
            const parentPath = filePath.slice(0, -1);
            const newFilePath = [...parentPath, newName];

            // Write to new location
            FileSystemManager.writeFile(newFilePath, content, info.extension);

            // Delete old file
            FileSystemManager.deleteFile(filePath);

            EventBus.emit('desktop:refresh');
        } catch (e) {
            await SystemDialogs.alert(`Error renaming: ${e.message}`, 'Error', 'error');
        }
    }
}

const ContextMenuRenderer = new ContextMenuRendererClass();
export default ContextMenuRenderer;
