/**
 * My Computer - Windows 95 Style File Explorer
 * Browse drives, folders, and system information
 */

import AppBase from './AppBase.js';
import StateManager from '../core/StateManager.js';
import AppRegistry from './AppRegistry.js';

class MyComputer extends AppBase {
    constructor() {
        super({
            id: 'mycomputer',
            name: 'My Computer',
            icon: '💻',
            width: 700,
            height: 500,
            resizable: true,
            singleton: true,
            category: 'system'
        });

        // Virtual file system
        this.drives = [
            {
                id: 'c',
                letter: 'C:',
                label: 'Local Disk',
                icon: '💾',
                type: 'hard',
                used: 2.4,
                total: 10,
                folders: [
                    { name: 'Windows', icon: '🪟', size: '1.2 GB', modified: '1995-08-24' },
                    { name: 'Program Files', icon: '📁', size: '800 MB', modified: '1995-11-15' },
                    { name: 'Users', icon: '👥', size: '400 MB', modified: '2025-12-14' },
                    { name: 'Temp', icon: '🗑️', size: '50 MB', modified: '2025-12-14' }
                ]
            },
            {
                id: 'd',
                letter: 'D:',
                label: 'CD-ROM',
                icon: '💿',
                type: 'cdrom',
                isEmpty: true
            },
            {
                id: 'a',
                letter: 'A:',
                label: 'Floppy Disk',
                icon: '💾',
                type: 'floppy',
                isEmpty: true
            }
        ];

        this.systemFolders = [
            { name: 'My Documents', icon: '📄', app: 'notepad', desc: 'Personal files and documents' },
            { name: 'My Pictures', icon: '🖼️', app: 'paint', desc: 'Image files and photos' },
            { name: 'My Music', icon: '🎵', app: null, desc: 'Audio files and playlists' },
            { name: 'Control Panel', icon: '⚙️', app: 'controlpanel', desc: 'System settings and configuration' },
            { name: 'Recycle Bin', icon: '🗑️', app: 'recyclebin', desc: 'Deleted files and folders' }
        ];
    }

    onOpen() {
        return `
            <style>
                .mycomputer-app {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    background: #c0c0c0;
                }
                .mycomputer-toolbar {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 4px;
                    background: #c0c0c0;
                    border-bottom: 2px groove #fff;
                }
                .mycomputer-btn {
                    padding: 4px 12px;
                    border: 2px outset #fff;
                    background: #c0c0c0;
                    cursor: pointer;
                    font-size: 11px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .mycomputer-btn:active {
                    border-style: inset;
                }
                .mycomputer-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .mycomputer-address {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    margin-left: 8px;
                }
                .mycomputer-address-label {
                    font-size: 11px;
                    font-weight: bold;
                }
                .mycomputer-address-bar {
                    flex: 1;
                    padding: 4px 8px;
                    border: 2px inset #fff;
                    background: white;
                    font-size: 11px;
                }
                .mycomputer-content {
                    flex: 1;
                    background: white;
                    overflow-y: auto;
                    padding: 15px;
                }
                .mycomputer-view-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                    gap: 20px;
                }
                .mycomputer-view-list {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                .mycomputer-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    padding: 10px;
                    cursor: pointer;
                    border: 2px solid transparent;
                }
                .mycomputer-item:hover {
                    background: #e0e0e0;
                }
                .mycomputer-item.selected {
                    background: #000080;
                    color: white;
                }
                .mycomputer-item-icon {
                    font-size: 32px;
                }
                .mycomputer-item-label {
                    font-size: 11px;
                    text-align: center;
                    word-break: break-word;
                }
                .mycomputer-item-desc {
                    font-size: 10px;
                    text-align: center;
                    color: #666;
                }
                .mycomputer-item.selected .mycomputer-item-desc {
                    color: #ccc;
                }
                .mycomputer-list-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 4px 8px;
                    cursor: pointer;
                    border: 1px solid transparent;
                }
                .mycomputer-list-item:hover {
                    background: #e0e0e0;
                }
                .mycomputer-list-item.selected {
                    background: #000080;
                    color: white;
                }
                .mycomputer-list-icon {
                    font-size: 16px;
                    width: 20px;
                }
                .mycomputer-list-name {
                    flex: 1;
                    font-size: 11px;
                }
                .mycomputer-list-size {
                    font-size: 11px;
                    min-width: 80px;
                }
                .mycomputer-list-date {
                    font-size: 11px;
                    min-width: 100px;
                }
                .mycomputer-status {
                    padding: 4px 8px;
                    background: #c0c0c0;
                    border-top: 2px groove #fff;
                    font-size: 11px;
                    display: flex;
                    justify-content: space-between;
                }
                .mycomputer-drive-info {
                    background: #f0f0f0;
                    border: 2px groove #fff;
                    padding: 15px;
                    margin-bottom: 20px;
                }
                .mycomputer-drive-header {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    margin-bottom: 15px;
                }
                .mycomputer-drive-icon {
                    font-size: 48px;
                }
                .mycomputer-drive-details h3 {
                    margin: 0 0 5px 0;
                    font-size: 14px;
                    color: #000080;
                }
                .mycomputer-drive-details p {
                    margin: 0;
                    font-size: 11px;
                    color: #666;
                }
                .mycomputer-progress {
                    width: 100%;
                    height: 20px;
                    background: white;
                    border: 2px inset #fff;
                    position: relative;
                }
                .mycomputer-progress-bar {
                    height: 100%;
                    background: linear-gradient(90deg, #0000ff 0%, #0080ff 100%);
                }
                .mycomputer-progress-text {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 10px;
                    font-weight: bold;
                    color: black;
                    text-shadow: 0 0 3px white;
                }
            </style>

            <div class="mycomputer-app">
                <div class="mycomputer-toolbar">
                    <button class="mycomputer-btn" id="back-btn" disabled>
                        ◀ Back
                    </button>
                    <button class="mycomputer-btn" id="up-btn" disabled>
                        ▲ Up
                    </button>
                    <div style="width: 2px; height: 20px; background: #808080; margin: 0 4px;"></div>
                    <button class="mycomputer-btn" id="view-btn">
                        📋 View
                    </button>
                    <div class="mycomputer-address">
                        <span class="mycomputer-address-label">Address:</span>
                        <div class="mycomputer-address-bar" id="address-bar">My Computer</div>
                    </div>
                </div>

                <div class="mycomputer-content" id="content">
                    ${this.renderRootView()}
                </div>

                <div class="mycomputer-status">
                    <span id="status-text">My Computer</span>
                    <span id="status-items"></span>
                </div>
            </div>
        `;
    }

    onMount() {
        // Initialize view state
        this.setInstanceState('currentView', 'root');
        this.setInstanceState('viewMode', 'grid');
        this.setInstanceState('history', []);

        // Setup toolbar buttons
        this.setupToolbarHandlers();

        // Update status
        this.updateStatus();
    }

    renderRootView() {
        const { drives, systemFolders } = this;

        return `
            <h3 style="margin: 0 0 15px 0; font-size: 14px; color: #000080;">💻 My Computer</h3>
            <div class="mycomputer-view-grid">
                ${drives.map(drive => `
                    <div class="mycomputer-item drive-item" data-drive="${drive.id}">
                        <div class="mycomputer-item-icon">${drive.icon}</div>
                        <div class="mycomputer-item-label">${drive.label} (${drive.letter})</div>
                    </div>
                `).join('')}
            </div>

            <h3 style="margin: 30px 0 15px 0; font-size: 14px; color: #000080;">📁 System Folders</h3>
            <div class="mycomputer-view-grid">
                ${systemFolders.map(folder => `
                    <div class="mycomputer-item folder-item" data-folder="${folder.app || folder.name}">
                        <div class="mycomputer-item-icon">${folder.icon}</div>
                        <div class="mycomputer-item-label">${folder.name}</div>
                        <div class="mycomputer-item-desc">${folder.desc}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderDriveView(driveId) {
        const drive = this.drives.find(d => d.id === driveId);
        if (!drive) return '<div>Drive not found</div>';

        if (drive.isEmpty) {
            return `
                <div style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 64px; margin-bottom: 20px;">${drive.icon}</div>
                    <div style="font-size: 14px; color: #666;">
                        There is no disk in the drive.<br>
                        Please insert a disk into drive ${drive.letter}
                    </div>
                </div>
            `;
        }

        const usedPercent = (drive.used / drive.total * 100).toFixed(1);

        return `
            <div class="mycomputer-drive-info">
                <div class="mycomputer-drive-header">
                    <div class="mycomputer-drive-icon">${drive.icon}</div>
                    <div class="mycomputer-drive-details">
                        <h3>${drive.label} (${drive.letter})</h3>
                        <p>Type: ${drive.type === 'hard' ? 'Local Disk' : 'Removable Disk'}</p>
                        <p>File System: FAT32</p>
                    </div>
                </div>
                <div style="margin-top: 15px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 11px;">
                        <span>Used: ${drive.used} GB</span>
                        <span>Free: ${(drive.total - drive.used).toFixed(1)} GB</span>
                    </div>
                    <div class="mycomputer-progress">
                        <div class="mycomputer-progress-bar" style="width: ${usedPercent}%"></div>
                        <div class="mycomputer-progress-text">${usedPercent}% used</div>
                    </div>
                    <div style="margin-top: 5px; font-size: 11px; text-align: right;">
                        Capacity: ${drive.total} GB
                    </div>
                </div>
            </div>

            <h3 style="margin: 0 0 15px 0; font-size: 14px; color: #000080;">📁 Folders</h3>
            ${this.getInstanceState('viewMode') === 'grid' ? this.renderGridView(drive.folders) : this.renderListView(drive.folders)}
        `;
    }

    renderGridView(items) {
        return `
            <div class="mycomputer-view-grid">
                ${items.map((item, idx) => `
                    <div class="mycomputer-item file-item" data-index="${idx}">
                        <div class="mycomputer-item-icon">${item.icon}</div>
                        <div class="mycomputer-item-label">${item.name}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderListView(items) {
        return `
            <div class="mycomputer-view-list">
                ${items.map((item, idx) => `
                    <div class="mycomputer-list-item file-item" data-index="${idx}">
                        <div class="mycomputer-list-icon">${item.icon}</div>
                        <div class="mycomputer-list-name">${item.name}</div>
                        <div class="mycomputer-list-size">${item.size || ''}</div>
                        <div class="mycomputer-list-date">${item.modified || ''}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    setupToolbarHandlers() {
        // Back button
        const backBtn = this.getElement('#back-btn');
        if (backBtn) {
            this.addHandler(backBtn, 'click', () => {
                this.navigateBack();
            });
        }

        // Up button
        const upBtn = this.getElement('#up-btn');
        if (upBtn) {
            this.addHandler(upBtn, 'click', () => {
                this.navigateUp();
            });
        }

        // View button
        const viewBtn = this.getElement('#view-btn');
        if (viewBtn) {
            this.addHandler(viewBtn, 'click', () => {
                const currentMode = this.getInstanceState('viewMode');
                const newMode = currentMode === 'grid' ? 'list' : 'grid';
                this.setInstanceState('viewMode', newMode);
                this.refreshView();
            });
        }

        // Setup content click handlers
        this.setupContentHandlers();
    }

    setupContentHandlers() {
        // Drive items
        const driveItems = this.getElements('.drive-item');
        driveItems.forEach(item => {
            this.addHandler(item, 'dblclick', (e) => {
                const driveId = e.currentTarget.dataset.drive;
                this.navigateToDrive(driveId);
            });
        });

        // Folder items
        const folderItems = this.getElements('.folder-item');
        folderItems.forEach(item => {
            this.addHandler(item, 'dblclick', (e) => {
                const appId = e.currentTarget.dataset.folder;
                if (appId && AppRegistry) {
                    AppRegistry.launch(appId);
                }
            });
        });

        // File items (for selection)
        const fileItems = this.getElements('.file-item, .drive-item, .folder-item');
        fileItems.forEach(item => {
            this.addHandler(item, 'click', (e) => {
                fileItems.forEach(fi => fi.classList.remove('selected'));
                e.currentTarget.classList.add('selected');
            });
        });
    }

    navigateToDrive(driveId) {
        const drive = this.drives.find(d => d.id === driveId);
        if (!drive) return;

        // Save current view to history
        const history = this.getInstanceState('history') || [];
        history.push(this.getInstanceState('currentView'));
        this.setInstanceState('history', history);

        // Navigate to drive
        this.setInstanceState('currentView', `drive:${driveId}`);
        this.refreshView();
    }

    navigateBack() {
        const history = this.getInstanceState('history') || [];
        if (history.length === 0) return;

        const previousView = history.pop();
        this.setInstanceState('history', history);
        this.setInstanceState('currentView', previousView);
        this.refreshView();
    }

    navigateUp() {
        this.setInstanceState('currentView', 'root');
        this.setInstanceState('history', []);
        this.refreshView();
    }

    refreshView() {
        const currentView = this.getInstanceState('currentView');
        const content = this.getElement('#content');
        const addressBar = this.getElement('#address-bar');
        const backBtn = this.getElement('#back-btn');
        const upBtn = this.getElement('#up-btn');

        let html = '';
        let address = 'My Computer';

        if (currentView === 'root') {
            html = this.renderRootView();
            address = 'My Computer';
            backBtn.disabled = true;
            upBtn.disabled = true;
        } else if (currentView.startsWith('drive:')) {
            const driveId = currentView.split(':')[1];
            const drive = this.drives.find(d => d.id === driveId);
            html = this.renderDriveView(driveId);
            address = `My Computer\\${drive ? drive.label : driveId}`;
            backBtn.disabled = false;
            upBtn.disabled = false;
        }

        if (content) content.innerHTML = html;
        if (addressBar) addressBar.textContent = address;

        // Re-setup handlers for new content
        this.setupContentHandlers();
        this.updateStatus();
    }

    updateStatus() {
        const statusText = this.getElement('#status-text');
        const statusItems = this.getElement('#status-items');
        const currentView = this.getInstanceState('currentView');

        if (!statusText || !statusItems) return;

        if (currentView === 'root') {
            const totalDrives = this.drives.length;
            statusText.textContent = 'My Computer';
            statusItems.textContent = `${totalDrives} drive(s)`;
        } else if (currentView.startsWith('drive:')) {
            const driveId = currentView.split(':')[1];
            const drive = this.drives.find(d => d.id === driveId);
            if (drive && !drive.isEmpty) {
                statusText.textContent = `${drive.label} (${drive.letter})`;
                statusItems.textContent = `${drive.folders.length} item(s)`;
            }
        }
    }
}

export default MyComputer;
