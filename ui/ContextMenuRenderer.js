/**
 * ContextMenuRenderer - Manages all context menus
 * Singleton pattern
 */

import EventBus, { Events } from '../core/EventBus.js';
import StateManager from '../core/StateManager.js';
import AppRegistry from '../apps/AppRegistry.js';
import WindowManager from '../core/WindowManager.js';

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
                    <div class="context-item" data-action="new-text">📄 Text Document</div>
                </div>
            </div>
            <div class="context-divider"></div>
            <div class="context-item" data-action="properties">Properties</div>
        `;
    }

    iconMenu(context) {
        const icon = context.icon;
        return `
            <div class="context-item" data-action="open"><strong>Open</strong></div>
            <div class="context-divider"></div>
            <div class="context-item" data-action="delete">Delete</div>
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

        switch (action) {
            case 'arrange':
                EventBus.emit('desktop:arrange');
                break;
            case 'refresh':
                EventBus.emit('desktop:refresh');
                break;
            case 'new-text':
                AppRegistry.launch('notepad');
                break;
            case 'properties':
                AppRegistry.launch('display');
                break;
            case 'open':
                if (context?.icon) {
                    if (context.icon.type === 'link') {
                        window.open(context.icon.url, '_blank');
                    } else {
                        AppRegistry.launch(context.icon.id);
                    }
                }
                break;
            case 'delete':
                if (context?.icon) {
                    StateManager.recycleIcon(context.icon.id);
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
}

const ContextMenuRenderer = new ContextMenuRendererClass();
export default ContextMenuRenderer;
