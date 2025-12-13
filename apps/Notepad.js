/**
 * Notepad App
 * Simple text editor with save/load functionality
 */

import AppBase from './AppBase.js';
import StorageManager from '../core/StorageManager.js';

class Notepad extends AppBase {
    constructor() {
        super({
            id: 'notepad',
            name: 'Notepad',
            icon: '📝',
            width: 600,
            height: 500
        });

        this.storageKey = 'notepadContent';
    }

    onOpen() {
        const saved = StorageManager.get(this.storageKey) || '';
        
        return `
            <div class="notepad-toolbar">
                <button class="btn" id="btnSave">💾 Save</button>
                <button class="btn" id="btnClear">🗑️ Clear</button>
                <button class="btn" id="btnDownload">📥 Download</button>
            </div>
            <textarea class="notepad-content" id="notepadText" 
                placeholder="Start typing... (Ctrl+S to save)">${this.escapeHtml(saved)}</textarea>
        `;
    }

    onMount() {
        // Button handlers
        this.getElement('#btnSave')?.addEventListener('click', () => this.save());
        this.getElement('#btnClear')?.addEventListener('click', () => this.clear());
        this.getElement('#btnDownload')?.addEventListener('click', () => this.download());

        // Keyboard shortcut
        this.addHandler(document, 'keydown', this.handleKeypress);

        // Focus textarea
        setTimeout(() => {
            this.getElement('#notepadText')?.focus();
        }, 100);
    }

    handleKeypress(e) {
        if (!this.isOpen || !this.getWindow()?.classList.contains('active')) return;

        // Ctrl+S to save
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            this.save();
        }
    }

    save() {
        const textarea = this.getElement('#notepadText');
        if (textarea) {
            StorageManager.set(this.storageKey, textarea.value);
            this.alert('💾 Note saved!');
        }
    }

    clear() {
        if (confirm('Clear all text?')) {
            const textarea = this.getElement('#notepadText');
            if (textarea) {
                textarea.value = '';
            }
            StorageManager.remove(this.storageKey);
        }
    }

    download() {
        const textarea = this.getElement('#notepadText');
        if (!textarea) return;

        const blob = new Blob([textarea.value], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'note.txt';
        a.click();
        URL.revokeObjectURL(url);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

export default Notepad;
