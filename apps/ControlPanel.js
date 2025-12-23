/**
 * Control Panel - Windows 95 Style System Settings
 * Provides access to system configuration and settings
 */

import AppBase from './AppBase.js';
import AppRegistry from './AppRegistry.js';
import StateManager from '../core/StateManager.js';
import StorageManager from '../core/StorageManager.js';
import EventBus from '../core/EventBus.js';

class ControlPanel extends AppBase {
    constructor() {
        super({
            id: 'controlpanel',
            name: 'Control Panel',
            icon: '⚙️',
            width: 600,
            height: 500,
            resizable: true,
            category: 'settings'
        });
    }

    onOpen() {
        console.log('[ControlPanel] Opening Control Panel...');
        const settings = StateManager.getState('settings');
        const desktopBg = StorageManager.get('desktopBg') || '#008080';
        console.log('[ControlPanel] Rendering with settings:', settings);

        return `
            <style>
                .control-panel {
                    padding: 10px;
                    background: #c0c0c0;
                    height: 100%;
                    overflow-y: auto;
                }
                .control-section {
                    background: white;
                    border: 2px groove #fff;
                    padding: 15px;
                    margin-bottom: 15px;
                }
                .control-section-title {
                    font-weight: bold;
                    font-size: 14px;
                    margin-bottom: 10px;
                    color: #000080;
                    border-bottom: 1px solid #c0c0c0;
                    padding-bottom: 5px;
                }
                .control-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 8px 0;
                    border-bottom: 1px dotted #c0c0c0;
                }
                .control-item:last-child {
                    border-bottom: none;
                }
                .control-item-icon {
                    font-size: 24px;
                    width: 32px;
                    text-align: center;
                }
                .control-item-info {
                    flex: 1;
                }
                .control-item-label {
                    font-weight: bold;
                    font-size: 12px;
                }
                .control-item-desc {
                    font-size: 11px;
                    color: #666;
                }
                .control-link {
                    cursor: pointer;
                    transition: background 0.1s;
                }
                .control-link:hover {
                    background: #e8e8ff;
                }
                .control-link:active {
                    background: #d0d0ff;
                }
                .control-toggle {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }
                .control-toggle input[type="checkbox"] {
                    width: 16px;
                    height: 16px;
                }
                .control-color-picker {
                    width: 80px;
                    height: 30px;
                    border: 2px inset #fff;
                    cursor: pointer;
                }
                .control-button {
                    padding: 6px 20px;
                    background: #c0c0c0;
                    border: 2px outset #fff;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: bold;
                }
                .control-button:active {
                    border-style: inset;
                }
                .control-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                    gap: 15px;
                    padding: 10px;
                }
                .control-grid-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    padding: 15px 10px;
                    background: white;
                    border: 2px groove #fff;
                    cursor: pointer;
                    transition: background 0.1s;
                }
                .control-grid-item:hover {
                    background: #e0e0e0;
                }
                .control-grid-item:active {
                    background: #d0d0d0;
                    border-style: ridge;
                }
                .control-grid-icon {
                    font-size: 32px;
                }
                .control-grid-label {
                    font-size: 11px;
                    text-align: center;
                    font-weight: bold;
                }
                .pet-selector {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                    margin-top: 10px;
                }
                .pet-option {
                    font-size: 32px;
                    padding: 10px;
                    border: 2px outset #fff;
                    cursor: pointer;
                    background: #c0c0c0;
                }
                .pet-option.selected {
                    border-style: inset;
                    background: #a0a0a0;
                }
            </style>

            <div class="control-panel">
                <div class="control-section">
                    <div class="control-section-title">🖥️ Display Settings</div>

                    <div class="control-item">
                        <div class="control-item-icon">🎨</div>
                        <div class="control-item-info">
                            <div class="control-item-label">Desktop Background Color</div>
                            <div class="control-item-desc">Customize your desktop appearance</div>
                        </div>
                        <div>
                            <input type="color" class="control-color-picker" id="bg-color" value="${desktopBg}">
                        </div>
                    </div>

                    <div class="control-item">
                        <div class="control-item-icon">📺</div>
                        <div class="control-item-info">
                            <div class="control-item-label">CRT Effect</div>
                            <div class="control-item-desc">Enable retro monitor scanlines</div>
                        </div>
                        <div class="control-toggle">
                            <input type="checkbox" id="crt-effect" ${settings.crtEffect ? 'checked' : ''}>
                            <label for="crt-effect">${settings.crtEffect ? 'On' : 'Off'}</label>
                        </div>
                    </div>
                </div>

                <div class="control-section">
                    <div class="control-section-title">🔊 Sound Settings</div>

                    <div class="control-item">
                        <div class="control-item-icon">🔔</div>
                        <div class="control-item-info">
                            <div class="control-item-label">System Sounds</div>
                            <div class="control-item-desc">Enable retro sound effects</div>
                        </div>
                        <div class="control-toggle">
                            <input type="checkbox" id="sound-toggle" ${settings.sound ? 'checked' : ''}>
                            <label for="sound-toggle">${settings.sound ? 'On' : 'Off'}</label>
                        </div>
                    </div>
                </div>

                <div class="control-section">
                    <div class="control-section-title">🐾 Desktop Pet</div>

                    <div class="control-item">
                        <div class="control-item-icon">🦮</div>
                        <div class="control-item-info">
                            <div class="control-item-label">Enable Desktop Pet</div>
                            <div class="control-item-desc">Show animated companion on desktop</div>
                        </div>
                        <div class="control-toggle">
                            <input type="checkbox" id="pet-toggle" ${settings.pet.enabled ? 'checked' : ''}>
                            <label for="pet-toggle">${settings.pet.enabled ? 'On' : 'Off'}</label>
                        </div>
                    </div>

                    <div class="control-item">
                        <div class="control-item-icon">🎭</div>
                        <div class="control-item-info">
                            <div class="control-item-label">Choose Pet</div>
                            <div class="control-item-desc">Select your desktop companion</div>
                        </div>
                    </div>
                    <div class="pet-selector">
                        ${['🐕', '🐈', '🐇', '🐹', '🦊', '🦝', '🐿️', '🦔'].map(pet => `
                            <div class="pet-option ${settings.pet.type === pet ? 'selected' : ''}" data-pet="${pet}">
                                ${pet}
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="control-section">
                    <div class="control-section-title">💤 Screensaver</div>

                    <div class="control-item">
                        <div class="control-item-icon">⏱️</div>
                        <div class="control-item-info">
                            <div class="control-item-label">Screensaver Delay</div>
                            <div class="control-item-desc">Minutes until screensaver activates</div>
                        </div>
                        <div>
                            <select id="screensaver-delay" style="padding: 4px; border: 2px inset #fff;">
                                <option value="60000" ${settings.screensaverDelay === 60000 ? 'selected' : ''}>1 minute</option>
                                <option value="180000" ${settings.screensaverDelay === 180000 ? 'selected' : ''}>3 minutes</option>
                                <option value="300000" ${settings.screensaverDelay === 300000 ? 'selected' : ''}>5 minutes</option>
                                <option value="600000" ${settings.screensaverDelay === 600000 ? 'selected' : ''}>10 minutes</option>
                                <option value="9999999" ${settings.screensaverDelay === 9999999 ? 'selected' : ''}>Never</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="control-section">
                    <div class="control-section-title">📋 System Information</div>

                    <div class="control-item">
                        <div class="control-item-icon">💾</div>
                        <div class="control-item-info">
                            <div class="control-item-label">Storage Used</div>
                            <div class="control-item-desc">LocalStorage data usage</div>
                        </div>
                        <div id="storage-info" style="font-size: 11px; font-weight: bold;">
                            Calculating...
                        </div>
                    </div>

                    <div class="control-item">
                        <div class="control-item-icon">🏆</div>
                        <div class="control-item-info">
                            <div class="control-item-label">Achievements Unlocked</div>
                            <div class="control-item-desc">Your progress in RetrOS</div>
                        </div>
                        <div style="font-size: 11px; font-weight: bold;">
                            ${StateManager.getState('achievements').length} achievements
                        </div>
                    </div>
                </div>

                <div class="control-section">
                    <div class="control-section-title">📋 More Settings</div>

                    <div class="control-item control-link" data-app="display">
                        <div class="control-item-icon">🖥️</div>
                        <div class="control-item-info">
                            <div class="control-item-label">Display Properties</div>
                            <div class="control-item-desc">Wallpaper, themes, and visual effects</div>
                        </div>
                        <span style="color: #666;">▶</span>
                    </div>

                    <div class="control-item control-link" data-app="sounds">
                        <div class="control-item-icon">🔊</div>
                        <div class="control-item-info">
                            <div class="control-item-label">Sound Settings</div>
                            <div class="control-item-desc">Volume, sound effects, and audio</div>
                        </div>
                        <span style="color: #666;">▶</span>
                    </div>

                    <div class="control-item control-link" data-app="features-settings">
                        <div class="control-item-icon">⚡</div>
                        <div class="control-item-info">
                            <div class="control-item-label">System Features</div>
                            <div class="control-item-desc">Enable/disable features like Clippy, Easter Eggs</div>
                        </div>
                        <span style="color: #666;">▶</span>
                    </div>
                </div>

                <div class="control-section">
                    <div class="control-section-title">⚠️ Advanced Options</div>

                    <div class="control-item">
                        <div class="control-item-icon">🔄</div>
                        <div class="control-item-info">
                            <div class="control-item-label">Reset RetrOS</div>
                            <div class="control-item-desc">Clear all data and restore defaults</div>
                        </div>
                        <button class="control-button" id="reset-button">Reset</button>
                    </div>

                    <div class="control-item">
                        <div class="control-item-icon">📤</div>
                        <div class="control-item-info">
                            <div class="control-item-label">Export Settings</div>
                            <div class="control-item-desc">Backup your configuration</div>
                        </div>
                        <button class="control-button" id="export-button">Export</button>
                    </div>

                    <div class="control-item">
                        <div class="control-item-icon">📥</div>
                        <div class="control-item-info">
                            <div class="control-item-label">Import Settings</div>
                            <div class="control-item-desc">Restore from backup</div>
                        </div>
                        <button class="control-button" id="import-button">Import</button>
                    </div>
                </div>
            </div>
        `;
    }

    onMount() {
        // Background color picker
        const bgColorPicker = this.getElement('#bg-color');
        if (bgColorPicker) {
            this.addHandler(bgColorPicker, 'change', (e) => {
                const color = e.target.value;
                StorageManager.set('desktopBg', color);
                document.body.style.setProperty('--desktop-bg', color);
                EventBus.emit('desktop:bg-change', { color });
            });
        }

        // CRT effect toggle
        const crtToggle = this.getElement('#crt-effect');
        if (crtToggle) {
            this.addHandler(crtToggle, 'change', (e) => {
                const enabled = e.target.checked;
                StateManager.setState('settings.crtEffect', enabled, true);
                const overlay = document.querySelector('.crt-overlay');
                if (overlay) {
                    overlay.style.display = enabled ? 'block' : 'none';
                }
                e.target.nextElementSibling.textContent = enabled ? 'On' : 'Off';
            });
        }

        // Sound toggle
        const soundToggle = this.getElement('#sound-toggle');
        if (soundToggle) {
            this.addHandler(soundToggle, 'change', (e) => {
                const enabled = e.target.checked;
                StateManager.setState('settings.sound', enabled, true);
                e.target.nextElementSibling.textContent = enabled ? 'On' : 'Off';
            });
        }

        // Pet toggle
        const petToggle = this.getElement('#pet-toggle');
        if (petToggle) {
            this.addHandler(petToggle, 'change', (e) => {
                const enabled = e.target.checked;
                StateManager.setState('settings.pet.enabled', enabled, true);
                EventBus.emit('pet:toggle', { enabled });
                e.target.nextElementSibling.textContent = enabled ? 'On' : 'Off';
            });
        }

        // Pet selector
        const petOptions = this.getElements('.pet-option');
        petOptions.forEach(option => {
            this.addHandler(option, 'click', (e) => {
                const pet = e.currentTarget.dataset.pet;
                StateManager.setState('settings.pet.type', pet, true);
                EventBus.emit('pet:change', { type: pet });

                // Update selection
                petOptions.forEach(opt => opt.classList.remove('selected'));
                e.currentTarget.classList.add('selected');
            });
        });

        // Screensaver delay
        const screensaverDelay = this.getElement('#screensaver-delay');
        if (screensaverDelay) {
            this.addHandler(screensaverDelay, 'change', (e) => {
                const delay = parseInt(e.target.value);
                StateManager.setState('settings.screensaverDelay', delay, true);
                EventBus.emit('screensaver:update-delay', { delay });
            });
        }

        // Storage info
        this.updateStorageInfo();

        // Settings app links
        const settingsLinks = this.getElements('.control-link');
        console.log('[ControlPanel] Found', settingsLinks.length, 'settings links:', Array.from(settingsLinks).map(l => l.dataset.app));
        settingsLinks.forEach(link => {
            this.addHandler(link, 'click', (e) => {
                const appId = e.currentTarget.dataset.app;
                console.log('[ControlPanel] Settings link clicked:', appId);
                if (appId) {
                    AppRegistry.launch(appId);
                }
            });
        });

        // Reset button
        const resetButton = this.getElement('#reset-button');
        if (resetButton) {
            this.addHandler(resetButton, 'click', () => {
                if (confirm('This will delete all your data and reset RetrOS to defaults. Continue?')) {
                    StateManager.reset();
                }
            });
        }

        // Export button - Complete System Snapshot
        const exportButton = this.getElement('#export-button');
        if (exportButton) {
            this.addHandler(exportButton, 'click', () => {
                const data = StateManager.exportCompleteState();
                const json = JSON.stringify(data, null, 2);
                const blob = new Blob([json], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                // Include timestamp in filename for versioning
                const timestamp = new Date().toISOString().split('T')[0];
                a.download = `retros-snapshot-${timestamp}.json`;
                a.click();
                URL.revokeObjectURL(url);

                // Show success message with snapshot info
                const sizeKB = (json.length / 1024).toFixed(2);
                alert(`Complete system snapshot exported!\n\nIncludes:\n• Desktop icons & positions\n• File system\n• Display settings\n• App data (calendar, games, etc.)\n• All preferences\n\nSize: ${sizeKB} KB`);
            });
        }

        // Import button - Complete System Snapshot
        const importButton = this.getElement('#import-button');
        if (importButton) {
            this.addHandler(importButton, 'click', () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'application/json';
                input.onchange = (e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    const reader = new FileReader();
                    reader.onload = (event) => {
                        try {
                            const data = JSON.parse(event.target.result);
                            const result = StateManager.importCompleteState(data);

                            if (result.success) {
                                let message = 'System snapshot restored successfully!';
                                if (result.legacy) {
                                    message = 'Legacy backup imported (partial restore).';
                                } else if (result.meta) {
                                    message = `Snapshot restored!\n\nFrom: ${result.meta.timestamp}\nVersion: ${result.meta.version}`;
                                }
                                if (result.warnings && result.warnings.length > 0) {
                                    message += '\n\nWarnings:\n• ' + result.warnings.join('\n• ');
                                }
                                alert(message + '\n\nReloading...');
                                window.location.reload();
                            } else {
                                alert('Failed to import snapshot: ' + result.error);
                            }
                        } catch (err) {
                            alert('Failed to import snapshot: ' + err.message);
                        }
                    };
                    reader.readAsText(file);
                };
                input.click();
            });
        }
    }

    updateStorageInfo() {
        const storageInfo = this.getElement('#storage-info');
        if (!storageInfo) return;

        let totalSize = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                totalSize += localStorage[key].length + key.length;
            }
        }

        const sizeKB = (totalSize / 1024).toFixed(2);
        storageInfo.textContent = `${sizeKB} KB`;
    }
}

export default ControlPanel;
