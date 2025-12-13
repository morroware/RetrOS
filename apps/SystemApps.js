/**
 * My Computer App
 * Shows system information and drives
 */

import AppBase from './AppBase.js';
import EventBus from '../core/EventBus.js';
import StateManager from '../core/StateManager.js';

export class MyComputer extends AppBase {
    constructor() {
        super({
            id: 'mycomputer',
            name: 'My Computer',
            icon: '💻',
            width: 400,
            height: 350
        });
    }

    onOpen() {
        return `
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; padding: 10px;">
                <div class="icon" style="position: static;" data-action="floppy">
                    <div class="icon-image">💾</div>
                    <div class="icon-label" style="color: #000; text-shadow: none;">3½ Floppy (A:)</div>
                </div>
                <div class="icon" style="position: static;" data-action="cdrom">
                    <div class="icon-image">💿</div>
                    <div class="icon-label" style="color: #000; text-shadow: none;">(D:) CD-ROM</div>
                </div>
                <div class="icon" style="position: static;" data-action="control">
                    <div class="icon-image">🎛️</div>
                    <div class="icon-label" style="color: #000; text-shadow: none;">Control Panel</div>
                </div>
            </div>
            <hr style="border: 1px inset #ccc; margin: 10px 0;">
            <div style="padding: 10px; font-size: 16px;">
                <strong>System Information:</strong><br>
                Processor: 100% Nostalgia Core @ âˆž GHz<br>
                RAM: 640 KB (Should be enough for anyone)<br>
                Storage: Unlimited Cloud Storage<br>
                OS: Seth Morrow OS v95.0<br>
                Achievements: ${StateManager.getState('achievements').length} unlocked
            </div>
        `;
    }

    onMount() {
        this.getElement('[data-action="floppy"]')?.addEventListener('dblclick', () => {
            this.alert('💾 3.5 Floppy: Empty');
        });
        this.getElement('[data-action="cdrom"]')?.addEventListener('dblclick', () => {
            this.alert('💿 CD Drive: No disc');
        });
        this.getElement('[data-action="control"]')?.addEventListener('dblclick', () => {
            EventBus.emit('app:launch', { id: 'controlpanel' });
        });
    }
}

/**
 * Recycle Bin App
 * Shows deleted items with restore/delete options
 */
export class RecycleBin extends AppBase {
    constructor() {
        super({
            id: 'recyclebin',
            name: 'Recycle Bin',
            icon: '🗑️',
            width: 400,
            height: 350
        });
    }

    onOpen() {
        const items = StateManager.getState('recycledItems') || [];
        
        const itemsHTML = items.length === 0
            ? '<p style="color: #666; text-align: center; padding: 50px;">Recycle Bin is empty</p>'
            : items.map((item, i) => `
                <div class="icon-list-item" data-index="${i}">
                    <span>${item.emoji} ${item.label}</span>
                    <div>
                        <button class="btn" data-action="restore">Restore</button>
                        <button class="btn btn-danger" data-action="delete">Delete</button>
                    </div>
                </div>
            `).join('');

        return `
            <div class="form-group">
                <div class="icon-list" id="recycleList">${itemsHTML}</div>
            </div>
            <button class="btn btn-danger" id="btnEmpty" ${items.length === 0 ? 'disabled' : ''}>
                🗑️ Empty Recycle Bin
            </button>
        `;
    }

    onMount() {
        this.getElement('#btnEmpty')?.addEventListener('click', () => this.emptyBin());
        
        this.getElements('.icon-list-item').forEach(el => {
            const index = parseInt(el.dataset.index);
            el.querySelector('[data-action="restore"]')?.addEventListener('click', () => {
                this.restoreItem(index);
            });
            el.querySelector('[data-action="delete"]')?.addEventListener('click', () => {
                this.deleteItem(index);
            });
        });
    }

    restoreItem(index) {
        StateManager.restoreIcon(index);
        EventBus.emit('desktop:render');
        this.refresh();
    }

    deleteItem(index) {
        if (confirm('Permanently delete this item?')) {
            const items = StateManager.getState('recycledItems');
            items.splice(index, 1);
            StateManager.setState('recycledItems', items, true);
            this.refresh();
        }
    }

    emptyBin() {
        if (confirm('Empty the Recycle Bin? This cannot be undone.')) {
            StateManager.setState('recycledItems', [], true);
            this.refresh();
        }
    }

    refresh() {
        this.setContent(this.generateContent());
        this.onMount();
    }

    generateContent() {
        const items = StateManager.getState('recycledItems') || [];
        
        const itemsHTML = items.length === 0
            ? '<p style="color: #666; text-align: center; padding: 50px;">Recycle Bin is empty</p>'
            : items.map((item, i) => `
                <div class="icon-list-item" data-index="${i}">
                    <span>${item.emoji} ${item.label}</span>
                    <div>
                        <button class="btn" data-action="restore">Restore</button>
                        <button class="btn btn-danger" data-action="delete">Delete</button>
                    </div>
                </div>
            `).join('');

        return `
            <div class="form-group">
                <div class="icon-list" id="recycleList">${itemsHTML}</div>
            </div>
            <button class="btn btn-danger" id="btnEmpty" ${items.length === 0 ? 'disabled' : ''}>
                🗑️ Empty Recycle Bin
            </button>
        `;
    }
}

/**
 * Task Manager App
 * Shows running processes
 */
export class TaskManager extends AppBase {
    constructor() {
        super({
            id: 'taskmgr',
            name: 'Task Manager',
            icon: '📝',
            width: 400,
            height: 400
        });
    }

    onOpen() {
        return this.generateContent();
    }

    onMount() {
        this.getElement('#btnEndAll')?.addEventListener('click', () => this.closeAllWindows());
        
        this.getElements('[data-action="end"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.windowId;
                EventBus.emit('window:close', { id });
                setTimeout(() => this.refresh(), 100);
            });
        });
    }

    generateContent() {
        const windows = StateManager.getState('windows') || [];
        const cpu = Math.floor(Math.random() * 30 + 10);
        const uptime = Math.floor((Date.now() - performance.now()) / 60000);

        const taskList = windows.length === 0
            ? '<p style="padding: 10px; color: #666;">No tasks running</p>'
            : windows.map(w => `
                <div class="icon-list-item">
                    <span>${w.title}</span>
                    <button class="btn btn-danger" data-action="end" data-window-id="${w.id}">End Task</button>
                </div>
            `).join('');

        return `
            <div style="padding: 10px;">
                <h3>Running Processes</h3>
                <div class="icon-list" id="taskList">${taskList}</div>
                <div style="margin-top: 15px; padding: 10px; background: #e0e0e0; border: 1px solid #999;">
                    <strong>System Performance</strong><br>
                    CPU Usage: ${cpu}%<br>
                    Memory: ${windows.length} windows (${(windows.length * 2.75).toFixed(1)}MB)<br>
                    Processes: ${windows.length + 15}<br>
                    Uptime: ${uptime} minutes
                </div>
                <button class="btn btn-danger" id="btnEndAll" style="margin-top: 10px;">End All Tasks</button>
            </div>
        `;
    }

    closeAllWindows() {
        if (confirm('Close all windows?')) {
            const windows = StateManager.getState('windows') || [];
            windows.forEach(w => {
                if (w.id !== 'taskmgr') {
                    EventBus.emit('window:close', { id: w.id });
                }
            });
            setTimeout(() => this.refresh(), 100);
        }
    }

    refresh() {
        this.setContent(this.generateContent());
        this.onMount();
    }
}
