/**
 * StartMenuRenderer - Renders and manages the Windows 95 style Start Menu
 * Updated to dynamically load apps by category
 */

import EventBus, { Events } from '../core/EventBus.js';
import StateManager from '../core/StateManager.js';
import AppRegistry from '../apps/AppRegistry.js';

class StartMenuRendererClass {
    constructor() {
        this.element = null;
        this.startButton = null;
        this.isOpen = false;
    }

    initialize() {
        this.element = document.getElementById('startMenu');
        this.startButton = document.getElementById('startButton');

        if (!this.element || !this.startButton) return;

        this.startButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
            EventBus.emit(Events.START_MENU_TOGGLE, { open: this.isOpen });
        });

        EventBus.on(Events.START_MENU_TOGGLE, (data) => {
            if (data && data.open !== undefined && data.open !== this.isOpen) {
                if (data.open) this.open(); else this.close();
            }
        });

        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.element.contains(e.target) && !this.startButton.contains(e.target)) {
                this.close();
            }
        });

        EventBus.on(Events.WINDOW_OPEN, () => this.close());
        StateManager.subscribe('menuItems', () => this.render());
        StateManager.subscribe('user.isAdmin', () => this.render());

        this.render();
    }

    toggle() { this.isOpen ? this.close() : this.open(); }

    open() {
        this.isOpen = true;
        this.element.classList.add('active');
        this.startButton.classList.add('active');
        EventBus.emit(Events.SOUND_PLAY, { type: 'click' });
    }

    close() {
        this.isOpen = false;
        this.element.classList.remove('active');
        this.startButton.classList.remove('active');
    }

    render() {
        if (!this.element) return;
        const isAdmin = StateManager.getState('user.isAdmin');

        this.element.innerHTML = `
            <div class="start-menu-sidebar">
                <span class="sidebar-text">Seth Morrow OS 95</span>
            </div>
            <div class="start-menu-content">
                <div class="start-menu-items">
                    ${this.renderProgramsSection()}
                    ${this.renderDocumentsSection()}
                    ${this.renderSettingsSection()}
                    ${this.renderQuickItems()}
                    <div class="start-menu-divider"></div>
                    ${this.renderAdminItem(isAdmin)}
                    <div class="start-menu-divider"></div>
                    ${this.renderShutdownItem()}
                </div>
            </div>
        `;
        this.attachEventHandlers();
    }

    renderProgramsSection() {
        // Dynamically fetch apps by category
        const accessories = AppRegistry.getByCategory('accessories').filter(a => a.showInMenu !== false);
        const games = AppRegistry.getByCategory('games').filter(a => a.showInMenu !== false);
        const multimedia = AppRegistry.getByCategory('multimedia').filter(a => a.showInMenu !== false);
        const internet = AppRegistry.getByCategory('internet').filter(a => a.showInMenu !== false);
        const systemtools = AppRegistry.getByCategory('systemtools').filter(a => a.showInMenu !== false);

        const links = (StateManager.getState('icons') || []).filter(i => i.type === 'link');

        const renderAppList = (list) => list.map(app => `
            <div class="start-menu-item" data-app="${app.id}">
                <span class="start-menu-icon">${app.icon}</span>
                <span>${app.name}</span>
            </div>
        `).join('');

        return `
            <div class="start-menu-item submenu-trigger">
                <span class="start-menu-icon">📂</span>
                <span>Programs</span>
                <span class="submenu-arrow">▶</span>
                <div class="start-submenu">
                    ${internet.length > 0 ? `
                    <div class="start-menu-item submenu-trigger">
                        <span class="start-menu-icon">🌐</span>
                        <span>Internet</span>
                        <span class="submenu-arrow">▶</span>
                        <div class="start-submenu">
                            ${renderAppList(internet)}
                        </div>
                    </div>
                    ` : ''}

                    ${multimedia.length > 0 ? `
                    <div class="start-menu-item submenu-trigger">
                        <span class="start-menu-icon">🎵</span>
                        <span>Multimedia</span>
                        <span class="submenu-arrow">▶</span>
                        <div class="start-submenu">
                            ${renderAppList(multimedia)}
                        </div>
                    </div>
                    ` : ''}

                    <div class="start-menu-item submenu-trigger">
                        <span class="start-menu-icon">📝</span>
                        <span>Accessories</span>
                        <span class="submenu-arrow">▶</span>
                        <div class="start-submenu">
                            ${renderAppList(accessories)}
                        </div>
                    </div>

                    ${systemtools.length > 0 ? `
                    <div class="start-menu-item submenu-trigger">
                        <span class="start-menu-icon">🔧</span>
                        <span>System Tools</span>
                        <span class="submenu-arrow">▶</span>
                        <div class="start-submenu">
                            ${renderAppList(systemtools)}
                        </div>
                    </div>
                    ` : ''}

                    <div class="start-menu-item submenu-trigger">
                        <span class="start-menu-icon">🎮</span>
                        <span>Games</span>
                        <span class="submenu-arrow">▶</span>
                        <div class="start-submenu">
                            ${renderAppList(games)}
                        </div>
                    </div>

                    ${links.length > 0 ? `
                        <div class="start-menu-divider"></div>
                        ${links.map(link => `
                            <div class="start-menu-item" data-link="${link.url}">
                                <span class="start-menu-icon">${link.emoji}</span>
                                <span>${link.label}</span>
                            </div>
                        `).join('')}
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderDocumentsSection() {
        return `
            <div class="start-menu-item submenu-trigger">
                <span class="start-menu-icon">📄</span>
                <span>Documents</span>
                <span class="submenu-arrow">▶</span>
                <div class="start-submenu">
                    <div class="start-menu-item" data-app="notepad">
                        <span class="start-menu-icon">📝</span>
                        <span>README.txt</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderSettingsSection() {
        return `
            <div class="start-menu-item submenu-trigger">
                <span class="start-menu-icon">⚙️</span>
                <span>Settings</span>
                <span class="submenu-arrow">▶</span>
                <div class="start-submenu">
                    <div class="start-menu-item" data-app="controlpanel">
                        <span class="start-menu-icon">🎛️</span>
                        <span>Control Panel</span>
                    </div>
                    <div class="start-menu-item" data-app="display">
                        <span class="start-menu-icon">🖥️</span>
                        <span>Display</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderQuickItems() {
        return `
            <div class="start-menu-item" data-app="find">
                <span class="start-menu-icon">🔍</span>
                <span>Find...</span>
            </div>
            <div class="start-menu-item" data-app="help">
                <span class="start-menu-icon">❓</span>
                <span>Help</span>
            </div>
            <div class="start-menu-item" data-app="run">
                <span class="start-menu-icon">▶️</span>
                <span>Run...</span>
            </div>
        `;
    }

    renderAdminItem(isAdmin) {
        return isAdmin ? `
            <div class="start-menu-item" data-app="adminpanel">
                <span class="start-menu-icon">⚙️</span>
                <span>Admin Panel</span>
            </div>` : `
            <div class="start-menu-item" data-app="adminpanel">
                <span class="start-menu-icon">🗝️</span>
                <span>Admin Login</span>
            </div>`;
    }

    renderShutdownItem() {
        return `
            <div class="start-menu-item" data-app="shutdown">
                <span class="start-menu-icon">⏻</span>
                <span>Shut Down...</span>
            </div>
        `;
    }

    attachEventHandlers() {
        this.element.querySelectorAll('[data-app]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                AppRegistry.launch(item.dataset.app);
                this.close();
            });
        });

        this.element.querySelectorAll('[data-link]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                AppRegistry.launch('browser', { url: item.dataset.link });
                this.close();
            });
        });

        // Attach submenu positioning handlers
        this.attachSubmenuPositioning();
    }

    /**
     * Attach hover handlers to reposition submenus that would go off-screen
     */
    attachSubmenuPositioning() {
        const submenuTriggers = this.element.querySelectorAll('.submenu-trigger');

        submenuTriggers.forEach(trigger => {
            trigger.addEventListener('mouseenter', () => {
                const submenu = trigger.querySelector(':scope > .start-submenu');
                if (submenu) {
                    this.positionSubmenu(trigger, submenu);
                }
            });

            trigger.addEventListener('mouseleave', () => {
                const submenu = trigger.querySelector(':scope > .start-submenu');
                if (submenu) {
                    // Reset positioning when leaving
                    submenu.style.left = '';
                    submenu.style.top = '';
                    submenu.style.maxHeight = '';
                }
            });
        });
    }

    /**
     * Position a submenu so it stays on screen
     * Uses fixed positioning to avoid clipping by overflow:auto parents
     * @param {HTMLElement} trigger - The parent menu item
     * @param {HTMLElement} submenu - The submenu element
     */
    positionSubmenu(trigger, submenu) {
        const triggerRect = trigger.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        const taskbarHeight = 50;
        const availableHeight = viewportHeight - taskbarHeight;

        // Position submenu to the right of the trigger
        let left = triggerRect.right;
        let top = triggerRect.top;

        // Temporarily show to measure
        const wasHidden = getComputedStyle(submenu).display === 'none';
        if (wasHidden) {
            submenu.style.visibility = 'hidden';
            submenu.style.display = 'block';
        }

        const submenuRect = submenu.getBoundingClientRect();

        // Check if submenu would overflow to the right
        if (left + submenuRect.width > viewportWidth) {
            // Position to the left of trigger instead
            left = triggerRect.left - submenuRect.width;
            if (left < 0) left = 0;
        }

        // Check if submenu would overflow below taskbar
        if (top + submenuRect.height > availableHeight) {
            // Shift up to fit
            top = availableHeight - submenuRect.height;
            if (top < 0) {
                // Submenu is taller than available space, pin to top and limit height
                top = 0;
                submenu.style.maxHeight = `${availableHeight - 10}px`;
            }
        }

        // Apply positioning
        submenu.style.left = `${left}px`;
        submenu.style.top = `${top}px`;

        // Restore visibility
        if (wasHidden) {
            submenu.style.visibility = '';
            submenu.style.display = '';
        }
    }
}

const StartMenuRenderer = new StartMenuRendererClass();
export default StartMenuRenderer;