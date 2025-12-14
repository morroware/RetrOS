/**
 * Recycle Bin - Deleted Items Manager
 * View and restore deleted desktop icons
 */

import AppBase from './AppBase.js';
import StateManager from '../core/StateManager.js';
import EventBus from '../core/EventBus.js';

class RecycleBin extends AppBase {
    constructor() {
        super({
            id: 'recyclebin',
            name: 'Recycle Bin',
            icon: '🗑️',
            width: 600,
            height: 450,
            resizable: true,
            singleton: true,
            category: 'system'
        });
    }

    onOpen() {
        const recycledItems = StateManager.getState('recycledItems') || [];

        return `
            <style>
                .recyclebin-app {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    background: #c0c0c0;
                }
                .recyclebin-toolbar {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 4px;
                    background: #c0c0c0;
                    border-bottom: 2px groove #fff;
                }
                .recyclebin-btn {
                    padding: 4px 12px;
                    border: 2px outset #fff;
                    background: #c0c0c0;
                    cursor: pointer;
                    font-size: 11px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-weight: bold;
                }
                .recyclebin-btn:active:not(:disabled) {
                    border-style: inset;
                }
                .recyclebin-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .recyclebin-btn.danger {
                    background: #d00;
                    color: white;
                }
                .recyclebin-content {
                    flex: 1;
                    background: white;
                    overflow-y: auto;
                }
                .recyclebin-empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    color: #666;
                }
                .recyclebin-empty-icon {
                    font-size: 96px;
                    margin-bottom: 20px;
                    opacity: 0.3;
                }
                .recyclebin-empty-text {
                    font-size: 14px;
                    font-weight: bold;
                }
                .recyclebin-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
                    gap: 20px;
                    padding: 20px;
                }
                .recyclebin-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    padding: 10px;
                    cursor: pointer;
                    border: 2px solid transparent;
                    position: relative;
                }
                .recyclebin-item:hover {
                    background: #e0e0e0;
                }
                .recyclebin-item.selected {
                    background: #000080;
                    color: white;
                    border-color: #000080;
                }
                .recyclebin-item-icon {
                    font-size: 32px;
                    position: relative;
                }
                .recyclebin-item-icon::after {
                    content: '❌';
                    position: absolute;
                    bottom: -5px;
                    right: -5px;
                    font-size: 16px;
                    filter: drop-shadow(0 0 2px white);
                }
                .recyclebin-item-label {
                    font-size: 11px;
                    text-align: center;
                    word-break: break-word;
                }
                .recyclebin-item-info {
                    font-size: 9px;
                    text-align: center;
                    color: #666;
                }
                .recyclebin-item.selected .recyclebin-item-info {
                    color: #ccc;
                }
                .recyclebin-status {
                    padding: 4px 8px;
                    background: #c0c0c0;
                    border-top: 2px groove #fff;
                    font-size: 11px;
                    display: flex;
                    justify-content: space-between;
                }
                .recyclebin-list {
                    padding: 10px;
                }
                .recyclebin-list-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 6px 10px;
                    border-bottom: 1px solid #e0e0e0;
                    cursor: pointer;
                }
                .recyclebin-list-item:hover {
                    background: #e0e0e0;
                }
                .recyclebin-list-item.selected {
                    background: #000080;
                    color: white;
                }
                .recyclebin-list-icon {
                    font-size: 24px;
                    position: relative;
                }
                .recyclebin-list-icon::after {
                    content: '❌';
                    position: absolute;
                    bottom: -3px;
                    right: -3px;
                    font-size: 12px;
                    filter: drop-shadow(0 0 2px white);
                }
                .recyclebin-list-details {
                    flex: 1;
                }
                .recyclebin-list-label {
                    font-size: 11px;
                    font-weight: bold;
                }
                .recyclebin-list-info {
                    font-size: 10px;
                    color: #666;
                }
                .recyclebin-list-item.selected .recyclebin-list-info {
                    color: #ccc;
                }
            </style>

            <div class="recyclebin-app">
                <div class="recyclebin-toolbar">
                    <button class="recyclebin-btn" id="restore-btn" disabled>
                        ↩️ Restore
                    </button>
                    <button class="recyclebin-btn danger" id="delete-btn" disabled>
                        🗑️ Delete
                    </button>
                    <div style="width: 2px; height: 20px; background: #808080; margin: 0 4px;"></div>
                    <button class="recyclebin-btn danger" id="empty-btn" ${recycledItems.length === 0 ? 'disabled' : ''}>
                        🔥 Empty Recycle Bin
                    </button>
                    <div style="flex: 1;"></div>
                    <button class="recyclebin-btn" id="view-btn">
                        📋 ${this.getInstanceState('viewMode', 'grid') === 'grid' ? 'List' : 'Grid'} View
                    </button>
                </div>

                <div class="recyclebin-content" id="content">
                    ${recycledItems.length === 0 ? this.renderEmptyView() : this.renderItemsView(recycledItems)}
                </div>

                <div class="recyclebin-status">
                    <span id="status-text">${recycledItems.length} item(s)</span>
                    <span id="status-selection"></span>
                </div>
            </div>
        `;
    }

    onMount() {
        // Initialize view mode
        if (this.getInstanceState('viewMode') === undefined) {
            this.setInstanceState('viewMode', 'grid');
        }

        // Setup toolbar handlers
        this.setupToolbarHandlers();

        // Setup item click handlers
        this.setupItemHandlers();

        // Subscribe to recycle bin updates
        this.onEvent('recyclebin:update', () => {
            this.refreshView();
        });
    }

    renderEmptyView() {
        return `
            <div class="recyclebin-empty">
                <div class="recyclebin-empty-icon">🗑️</div>
                <div class="recyclebin-empty-text">Recycle Bin is empty</div>
                <div style="font-size: 11px; margin-top: 10px; color: #888;">
                    Deleted items will appear here
                </div>
            </div>
        `;
    }

    renderItemsView(items) {
        const viewMode = this.getInstanceState('viewMode', 'grid');

        if (viewMode === 'grid') {
            return this.renderGridView(items);
        } else {
            return this.renderListView(items);
        }
    }

    renderGridView(items) {
        return `
            <div class="recyclebin-grid">
                ${items.map((item, index) => `
                    <div class="recyclebin-item" data-index="${index}">
                        <div class="recyclebin-item-icon">${item.emoji || '📄'}</div>
                        <div class="recyclebin-item-label">${item.label || item.id}</div>
                        <div class="recyclebin-item-info">${item.type || 'item'}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderListView(items) {
        return `
            <div class="recyclebin-list">
                ${items.map((item, index) => `
                    <div class="recyclebin-list-item" data-index="${index}">
                        <div class="recyclebin-list-icon">${item.emoji || '📄'}</div>
                        <div class="recyclebin-list-details">
                            <div class="recyclebin-list-label">${item.label || item.id}</div>
                            <div class="recyclebin-list-info">
                                Type: ${item.type || 'item'} •
                                ${item.url ? `URL: ${item.url}` : `ID: ${item.id}`}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    setupToolbarHandlers() {
        // Restore button
        const restoreBtn = this.getElement('#restore-btn');
        if (restoreBtn) {
            this.addHandler(restoreBtn, 'click', () => {
                this.restoreSelected();
            });
        }

        // Delete button
        const deleteBtn = this.getElement('#delete-btn');
        if (deleteBtn) {
            this.addHandler(deleteBtn, 'click', () => {
                this.deleteSelected();
            });
        }

        // Empty button
        const emptyBtn = this.getElement('#empty-btn');
        if (emptyBtn) {
            this.addHandler(emptyBtn, 'click', () => {
                this.emptyRecycleBin();
            });
        }

        // View toggle button
        const viewBtn = this.getElement('#view-btn');
        if (viewBtn) {
            this.addHandler(viewBtn, 'click', () => {
                const currentMode = this.getInstanceState('viewMode', 'grid');
                const newMode = currentMode === 'grid' ? 'list' : 'grid';
                this.setInstanceState('viewMode', newMode);
                this.refreshView();
            });
        }
    }

    setupItemHandlers() {
        const items = this.getElements('.recyclebin-item, .recyclebin-list-item');

        items.forEach(item => {
            // Single click - select
            this.addHandler(item, 'click', (e) => {
                // Clear previous selection
                items.forEach(i => i.classList.remove('selected'));

                // Select this item
                e.currentTarget.classList.add('selected');

                // Update toolbar buttons
                this.updateToolbarButtons(true);

                // Update status
                const index = parseInt(e.currentTarget.dataset.index);
                const recycledItems = StateManager.getState('recycledItems');
                const selectedItem = recycledItems[index];
                this.updateStatus(selectedItem);
            });

            // Double click - restore
            this.addHandler(item, 'dblclick', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                this.restoreItem(index);
            });
        });
    }

    updateToolbarButtons(hasSelection) {
        const restoreBtn = this.getElement('#restore-btn');
        const deleteBtn = this.getElement('#delete-btn');

        if (restoreBtn) restoreBtn.disabled = !hasSelection;
        if (deleteBtn) deleteBtn.disabled = !hasSelection;
    }

    updateStatus(selectedItem) {
        const statusSelection = this.getElement('#status-selection');
        if (!statusSelection) return;

        if (selectedItem) {
            statusSelection.textContent = `Selected: ${selectedItem.label || selectedItem.id}`;
        } else {
            statusSelection.textContent = '';
        }
    }

    getSelectedIndex() {
        const selected = this.getElement('.recyclebin-item.selected, .recyclebin-list-item.selected');
        return selected ? parseInt(selected.dataset.index) : -1;
    }

    restoreSelected() {
        const index = this.getSelectedIndex();
        if (index >= 0) {
            this.restoreItem(index);
        }
    }

    restoreItem(index) {
        const recycledItems = StateManager.getState('recycledItems');
        if (index < 0 || index >= recycledItems.length) return;

        const item = recycledItems[index];

        // Restore to desktop
        StateManager.restoreIcon(index);

        // Refresh desktop
        EventBus.emit('desktop:refresh');

        // Refresh this view
        this.refreshView();

        // Show notification
        this.playSound('restore');

        console.log(`[RecycleBin] Restored: ${item.label}`);
    }

    deleteSelected() {
        const index = this.getSelectedIndex();
        if (index >= 0) {
            this.deleteItem(index);
        }
    }

    deleteItem(index) {
        const recycledItems = StateManager.getState('recycledItems');
        if (index < 0 || index >= recycledItems.length) return;

        const item = recycledItems[index];

        if (confirm(`Permanently delete "${item.label}"?\n\nThis cannot be undone.`)) {
            // Remove from recycle bin
            const newRecycledItems = recycledItems.filter((_, i) => i !== index);
            StateManager.setState('recycledItems', newRecycledItems, true);

            // Refresh view
            this.refreshView();

            console.log(`[RecycleBin] Permanently deleted: ${item.label}`);
        }
    }

    emptyRecycleBin() {
        const recycledItems = StateManager.getState('recycledItems');
        if (recycledItems.length === 0) return;

        if (confirm(`Empty the Recycle Bin?\n\nThis will permanently delete all ${recycledItems.length} item(s).\n\nThis cannot be undone.`)) {
            // Clear recycle bin
            StateManager.setState('recycledItems', [], true);

            // Refresh view
            this.refreshView();

            console.log('[RecycleBin] Emptied recycle bin');
        }
    }

    refreshView() {
        const recycledItems = StateManager.getState('recycledItems') || [];
        const content = this.getElement('#content');
        const statusText = this.getElement('#status-text');
        const emptyBtn = this.getElement('#empty-btn');
        const viewBtn = this.getElement('#view-btn');

        if (content) {
            content.innerHTML = recycledItems.length === 0
                ? this.renderEmptyView()
                : this.renderItemsView(recycledItems);
        }

        if (statusText) {
            statusText.textContent = `${recycledItems.length} item(s)`;
        }

        if (emptyBtn) {
            emptyBtn.disabled = recycledItems.length === 0;
        }

        if (viewBtn) {
            const viewMode = this.getInstanceState('viewMode', 'grid');
            viewBtn.textContent = `📋 ${viewMode === 'grid' ? 'List' : 'Grid'} View`;
        }

        // Re-setup item handlers for new content
        this.setupItemHandlers();

        // Reset selection
        this.updateToolbarButtons(false);
        this.updateStatus(null);
    }
}

export default RecycleBin;
