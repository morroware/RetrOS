/**
 * Display Properties - Windows 95 Style Display Settings
 * Configure wallpaper, colors, screensaver, and appearance
 */

import AppBase from './AppBase.js';
import StateManager from '../core/StateManager.js';
import StorageManager from '../core/StorageManager.js';
import EventBus from '../core/EventBus.js';

class DisplayProperties extends AppBase {
    constructor() {
        super({
            id: 'display',
            name: 'Display Properties',
            icon: '🖥️',
            width: 420,
            height: 480,
            resizable: false,
            singleton: true,
            category: 'settings'
        });

        this.currentTab = 'background';
        this.selectedWallpaper = '';
        this.selectedColor = '#008080';
        this.previewColor = '#008080';
    }

    onOpen() {
        const currentBg = StorageManager.get('desktopBg') || '#008080';
        const wallpaper = StorageManager.get('desktopWallpaper') || '';
        const crtEffect = StateManager.getState('settings.crtEffect');
        const screensaverDelay = StateManager.getState('settings.screensaverDelay') || 300000;

        this.selectedColor = currentBg;
        this.selectedWallpaper = wallpaper;

        return `
            <style>
                .display-props {
                    background: #c0c0c0;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    font-size: 11px;
                }
                .display-tabs {
                    display: flex;
                    padding: 4px 4px 0 4px;
                }
                .display-tab {
                    padding: 4px 12px;
                    background: #c0c0c0;
                    border: 2px solid;
                    border-color: #fff #808080 #c0c0c0 #fff;
                    cursor: pointer;
                    margin-right: 2px;
                }
                .display-tab.active {
                    border-bottom-color: #c0c0c0;
                    margin-bottom: -2px;
                    padding-bottom: 6px;
                    z-index: 1;
                }
                .display-content {
                    flex: 1;
                    border: 2px solid;
                    border-color: #fff #808080 #808080 #fff;
                    margin: 0 4px;
                    padding: 10px;
                    overflow: hidden;
                }
                .display-panel {
                    display: none;
                    height: 100%;
                    flex-direction: column;
                }
                .display-panel.active {
                    display: flex;
                }
                .display-preview {
                    width: 180px;
                    height: 130px;
                    margin: 0 auto 15px;
                    border: 2px inset #fff;
                    position: relative;
                    overflow: hidden;
                }
                .preview-monitor {
                    width: 100%;
                    height: 100%;
                    background: var(--preview-bg, #008080);
                    display: flex;
                    align-items: flex-end;
                    justify-content: center;
                    position: relative;
                }
                .preview-monitor.crt {
                    background-image: repeating-linear-gradient(
                        0deg,
                        rgba(0, 0, 0, 0.1) 0px,
                        rgba(0, 0, 0, 0.1) 1px,
                        transparent 1px,
                        transparent 2px
                    );
                }
                .preview-taskbar {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 14px;
                    background: #c0c0c0;
                    border-top: 1px solid #fff;
                    display: flex;
                    align-items: center;
                    padding: 0 2px;
                }
                .preview-start {
                    font-size: 8px;
                    padding: 1px 4px;
                    background: #c0c0c0;
                    border: 1px outset #fff;
                }
                .preview-window {
                    position: absolute;
                    top: 15px;
                    left: 20px;
                    width: 80px;
                    height: 60px;
                    background: #c0c0c0;
                    border: 1px solid #000;
                }
                .preview-window-title {
                    background: linear-gradient(90deg, #000080, #1084d0);
                    height: 10px;
                }
                .display-group {
                    background: white;
                    border: 2px groove #fff;
                    padding: 10px;
                    margin-bottom: 10px;
                }
                .display-group-title {
                    font-weight: bold;
                    margin-bottom: 8px;
                    color: #000080;
                }
                .wallpaper-list {
                    height: 100px;
                    overflow-y: auto;
                    background: white;
                    border: 2px inset #fff;
                    margin-bottom: 10px;
                }
                .wallpaper-item {
                    padding: 3px 8px;
                    cursor: pointer;
                }
                .wallpaper-item:hover {
                    background: #e0e0ff;
                }
                .wallpaper-item.selected {
                    background: #000080;
                    color: white;
                }
                .color-grid {
                    display: grid;
                    grid-template-columns: repeat(8, 1fr);
                    gap: 3px;
                    margin-top: 10px;
                }
                .color-swatch {
                    width: 100%;
                    aspect-ratio: 1;
                    border: 2px outset #fff;
                    cursor: pointer;
                }
                .color-swatch.selected {
                    border: 2px inset #000;
                }
                .display-footer {
                    padding: 10px 4px;
                    display: flex;
                    justify-content: flex-end;
                    gap: 8px;
                }
                .display-btn {
                    padding: 4px 20px;
                    background: #c0c0c0;
                    border: 2px outset #fff;
                    cursor: pointer;
                    min-width: 70px;
                }
                .display-btn:active {
                    border-style: inset;
                }
                .display-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 8px;
                }
                .display-row label {
                    min-width: 100px;
                }
                .display-row select {
                    flex: 1;
                    padding: 3px;
                    border: 2px inset #fff;
                }
                .display-check {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin: 8px 0;
                }
                .screensaver-preview {
                    width: 100%;
                    height: 100px;
                    background: #000;
                    border: 2px inset #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 10px;
                    position: relative;
                    overflow: hidden;
                }
                .screensaver-preview-text {
                    color: #333;
                    font-size: 10px;
                }
                .flying-preview {
                    position: absolute;
                    font-size: 20px;
                    animation: fly-preview 4s linear infinite;
                }
                @keyframes fly-preview {
                    from { transform: translateX(100px) translateY(-20px); }
                    to { transform: translateX(-100px) translateY(80px); }
                }
                .appearance-scheme {
                    height: 80px;
                    overflow-y: auto;
                    background: white;
                    border: 2px inset #fff;
                    margin-bottom: 10px;
                }
                .scheme-item {
                    padding: 3px 8px;
                    cursor: pointer;
                }
                .scheme-item:hover {
                    background: #e0e0ff;
                }
                .scheme-item.selected {
                    background: #000080;
                    color: white;
                }
            </style>

            <div class="display-props">
                <div class="display-tabs">
                    <div class="display-tab active" data-tab="background">Background</div>
                    <div class="display-tab" data-tab="screensaver">Screen Saver</div>
                    <div class="display-tab" data-tab="appearance">Appearance</div>
                    <div class="display-tab" data-tab="effects">Effects</div>
                </div>

                <div class="display-content">
                    <!-- Background Tab -->
                    <div class="display-panel active" id="panel-background">
                        <div class="display-preview">
                            <div class="preview-monitor" id="preview-monitor" style="--preview-bg: ${currentBg}">
                                <div class="preview-window">
                                    <div class="preview-window-title"></div>
                                </div>
                                <div class="preview-taskbar">
                                    <div class="preview-start">Start</div>
                                </div>
                            </div>
                        </div>

                        <div class="display-group">
                            <div class="display-group-title">Wallpaper</div>
                            <div class="wallpaper-list" id="wallpaper-list">
                                <div class="wallpaper-item ${!wallpaper ? 'selected' : ''}" data-wallpaper="">(None)</div>
                                <div class="wallpaper-item" data-wallpaper="clouds">Clouds</div>
                                <div class="wallpaper-item" data-wallpaper="tiles">Tiles</div>
                                <div class="wallpaper-item" data-wallpaper="waves">Waves</div>
                                <div class="wallpaper-item" data-wallpaper="forest">Forest</div>
                                <div class="wallpaper-item" data-wallpaper="space">Space</div>
                            </div>
                            <button class="display-btn" id="btn-browse">Browse...</button>
                        </div>

                        <div class="display-group">
                            <div class="display-group-title">Background Color</div>
                            <div class="color-grid" id="color-grid">
                                ${this.generateColorGrid(currentBg)}
                            </div>
                        </div>
                    </div>

                    <!-- Screen Saver Tab -->
                    <div class="display-panel" id="panel-screensaver">
                        <div class="screensaver-preview" id="screensaver-preview">
                            <span class="flying-preview">🍞</span>
                            <span class="flying-preview" style="animation-delay: 1s; top: 30px;">🍞</span>
                            <span class="flying-preview" style="animation-delay: 2s; top: 60px;">🍞</span>
                        </div>

                        <div class="display-group">
                            <div class="display-group-title">Screen Saver</div>
                            <div class="display-row">
                                <label>Screen saver:</label>
                                <select id="screensaver-type">
                                    <option value="toasters">Flying Toasters</option>
                                    <option value="starfield">Starfield</option>
                                    <option value="marquee">Marquee</option>
                                    <option value="none">(None)</option>
                                </select>
                            </div>
                            <div class="display-row">
                                <label>Wait:</label>
                                <select id="screensaver-wait">
                                    <option value="60000" ${screensaverDelay === 60000 ? 'selected' : ''}>1 minute</option>
                                    <option value="180000" ${screensaverDelay === 180000 ? 'selected' : ''}>3 minutes</option>
                                    <option value="300000" ${screensaverDelay === 300000 ? 'selected' : ''}>5 minutes</option>
                                    <option value="600000" ${screensaverDelay === 600000 ? 'selected' : ''}>10 minutes</option>
                                    <option value="9999999" ${screensaverDelay >= 9999999 ? 'selected' : ''}>Never</option>
                                </select>
                            </div>
                            <button class="display-btn" id="btn-preview-ss">Preview</button>
                        </div>

                        <div class="display-group">
                            <div class="display-group-title">Energy saving features</div>
                            <div class="display-check">
                                <input type="checkbox" id="energy-monitor">
                                <label for="energy-monitor">Turn off monitor after 15 minutes</label>
                            </div>
                        </div>
                    </div>

                    <!-- Appearance Tab -->
                    <div class="display-panel" id="panel-appearance">
                        <div class="display-preview">
                            <div class="preview-monitor" id="appearance-preview" style="--preview-bg: ${currentBg}">
                                <div class="preview-window">
                                    <div class="preview-window-title"></div>
                                </div>
                                <div class="preview-taskbar">
                                    <div class="preview-start">Start</div>
                                </div>
                            </div>
                        </div>

                        <div class="display-group">
                            <div class="display-group-title">Scheme</div>
                            <div class="appearance-scheme" id="scheme-list">
                                <div class="scheme-item selected" data-scheme="win95">Windows Standard</div>
                                <div class="scheme-item" data-scheme="highcontrast">High Contrast Black</div>
                                <div class="scheme-item" data-scheme="desert">Desert</div>
                                <div class="scheme-item" data-scheme="ocean">Ocean</div>
                                <div class="scheme-item" data-scheme="rose">Rose</div>
                                <div class="scheme-item" data-scheme="slate">Slate</div>
                            </div>
                        </div>

                        <div class="display-group">
                            <div class="display-row">
                                <label>Item:</label>
                                <select id="appearance-item">
                                    <option value="desktop">Desktop</option>
                                    <option value="window">Window</option>
                                    <option value="titlebar">Active Title Bar</option>
                                    <option value="menu">Menu</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Effects Tab -->
                    <div class="display-panel" id="panel-effects">
                        <div class="display-group">
                            <div class="display-group-title">Visual effects</div>
                            <div class="display-check">
                                <input type="checkbox" id="effect-crt" ${crtEffect ? 'checked' : ''}>
                                <label for="effect-crt">CRT scanline effect</label>
                            </div>
                            <div class="display-check">
                                <input type="checkbox" id="effect-animations" checked>
                                <label for="effect-animations">Animate windows when minimizing</label>
                            </div>
                            <div class="display-check">
                                <input type="checkbox" id="effect-shadows" checked>
                                <label for="effect-shadows">Show shadows under menus</label>
                            </div>
                            <div class="display-check">
                                <input type="checkbox" id="effect-smooth" checked>
                                <label for="effect-smooth">Use smooth scrolling</label>
                            </div>
                        </div>

                        <div class="display-group">
                            <div class="display-group-title">Desktop icons</div>
                            <div class="display-row">
                                <label>Icon size:</label>
                                <select id="icon-size">
                                    <option value="small">Small</option>
                                    <option value="medium" selected>Medium</option>
                                    <option value="large">Large</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="display-footer">
                    <button class="display-btn" id="btn-ok">OK</button>
                    <button class="display-btn" id="btn-cancel">Cancel</button>
                    <button class="display-btn" id="btn-apply">Apply</button>
                </div>
            </div>
        `;
    }

    generateColorGrid(currentColor) {
        const colors = [
            '#008080', '#000080', '#800000', '#008000',
            '#800080', '#808000', '#000000', '#808080',
            '#c0c0c0', '#0000ff', '#ff0000', '#00ff00',
            '#ff00ff', '#ffff00', '#ffffff', '#00ffff',
            '#004040', '#000040', '#400000', '#004000',
            '#400040', '#404000', '#c0c0c0', '#404040'
        ];

        return colors.map(color => `
            <div class="color-swatch ${color === currentColor ? 'selected' : ''}"
                 style="background: ${color}"
                 data-color="${color}"></div>
        `).join('');
    }

    onMount() {
        // Tab switching
        const tabs = this.getElements('.display-tab');
        tabs.forEach(tab => {
            this.addHandler(tab, 'click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentTab = tab.dataset.tab;

                const panels = this.getElements('.display-panel');
                panels.forEach(p => p.classList.remove('active'));
                const targetPanel = this.getElement(`#panel-${tab.dataset.tab}`);
                if (targetPanel) targetPanel.classList.add('active');
            });
        });

        // Wallpaper selection
        const wallpaperItems = this.getElements('.wallpaper-item');
        wallpaperItems.forEach(item => {
            this.addHandler(item, 'click', () => {
                wallpaperItems.forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
                this.selectedWallpaper = item.dataset.wallpaper;
                this.updatePreview();
            });
        });

        // Color selection
        const colorSwatches = this.getElements('.color-swatch');
        colorSwatches.forEach(swatch => {
            this.addHandler(swatch, 'click', () => {
                colorSwatches.forEach(s => s.classList.remove('selected'));
                swatch.classList.add('selected');
                this.selectedColor = swatch.dataset.color;
                this.updatePreview();
            });
        });

        // Scheme selection
        const schemeItems = this.getElements('.scheme-item');
        schemeItems.forEach(item => {
            this.addHandler(item, 'click', () => {
                schemeItems.forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
            });
        });

        // Screensaver wait
        const screensaverWait = this.getElement('#screensaver-wait');
        if (screensaverWait) {
            this.addHandler(screensaverWait, 'change', (e) => {
                const delay = parseInt(e.target.value);
                StateManager.setState('settings.screensaverDelay', delay, true);
                EventBus.emit('screensaver:update-delay', { delay });
            });
        }

        // CRT effect toggle
        const crtToggle = this.getElement('#effect-crt');
        if (crtToggle) {
            this.addHandler(crtToggle, 'change', (e) => {
                const enabled = e.target.checked;
                StateManager.setState('settings.crtEffect', enabled, true);
                const overlay = document.querySelector('.crt-overlay');
                if (overlay) {
                    overlay.classList.toggle('active', enabled);
                }
            });
        }

        // Preview button
        const previewBtn = this.getElement('#btn-preview-ss');
        if (previewBtn) {
            this.addHandler(previewBtn, 'click', () => {
                EventBus.emit('screensaver:start');
            });
        }

        // Footer buttons
        this.addHandler(this.getElement('#btn-ok'), 'click', () => {
            this.applySettings();
            this.close();
        });

        this.addHandler(this.getElement('#btn-cancel'), 'click', () => {
            this.close();
        });

        this.addHandler(this.getElement('#btn-apply'), 'click', () => {
            this.applySettings();
        });
    }

    updatePreview() {
        const preview = this.getElement('#preview-monitor');
        const appearancePreview = this.getElement('#appearance-preview');

        if (preview) {
            preview.style.setProperty('--preview-bg', this.selectedColor);
        }
        if (appearancePreview) {
            appearancePreview.style.setProperty('--preview-bg', this.selectedColor);
        }
    }

    applySettings() {
        // Apply background color
        StorageManager.set('desktopBg', this.selectedColor);
        document.body.style.setProperty('--desktop-bg', this.selectedColor);
        document.querySelector('.desktop').style.backgroundColor = this.selectedColor;

        // Apply wallpaper if any
        StorageManager.set('desktopWallpaper', this.selectedWallpaper);

        EventBus.emit('desktop:bg-change', { color: this.selectedColor, wallpaper: this.selectedWallpaper });
        EventBus.emit('sound:play', { type: 'click' });
    }
}

export default DisplayProperties;
