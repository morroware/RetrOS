/**
 * Notepad App
 * Simple text editor with save/load functionality
 */

import AppBase from './AppBase.js';
import StorageManager from '../core/StorageManager.js';
import FileSystemManager from '../core/FileSystemManager.js';
import SystemDialogs from '../features/SystemDialogs.js';

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

    onOpen(params = {}) {
        // Check if we're opening a specific file
        const filePath = params.filePath;
        let content = '';
        let fileName = 'Untitled';

        if (filePath) {
            try {
                content = FileSystemManager.readFile(filePath);
                fileName = filePath[filePath.length - 1];
                this.setInstanceState('currentFile', filePath);
                this.setInstanceState('fileName', fileName);
            } catch (e) {
                console.error('Error loading file:', e);
                content = '';
            }
        } else {
            // Load from StorageManager (legacy support)
            content = StorageManager.get(this.storageKey) || '';
            this.setInstanceState('currentFile', null);
            this.setInstanceState('fileName', 'Untitled');
        }

        // Update window title
        this.updateTitle(fileName);

        return `
            <div class="notepad-toolbar">
                <button class="btn" id="btnNew">📄 New</button>
                <button class="btn" id="btnOpen">📂 Open</button>
                <button class="btn" id="btnSave">💾 Save</button>
                <button class="btn" id="btnSaveAs">💾 Save As</button>
                <button class="btn" id="btnDownload">📥 Download</button>
            </div>
            <div id="currentFilePath" style="padding: 4px 8px; background: #f0f0f0; font-size: 11px; border-bottom: 1px solid #808080;">
                File: <span id="filePathDisplay">${this.getInstanceState('currentFile') ? this.getInstanceState('currentFile').join('/') : 'Unsaved'}</span>
            </div>
            <textarea class="notepad-content" id="notepadText"
                placeholder="Start typing... (Ctrl+S to save)">${this.escapeHtml(content)}</textarea>
        `;
    }

    updateTitle(fileName) {
        const window = this.getWindow();
        if (window) {
            const titleBar = window.querySelector('.window-title');
            if (titleBar) {
                titleBar.textContent = `${fileName} - Notepad`;
            }
        }
    }

    onMount() {
        // Button handlers
        this.getElement('#btnNew')?.addEventListener('click', () => this.newDocument());
        this.getElement('#btnOpen')?.addEventListener('click', () => this.openFile());
        this.getElement('#btnSave')?.addEventListener('click', () => this.save());
        this.getElement('#btnSaveAs')?.addEventListener('click', () => this.saveAs());
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

    async openFile() {
        // Show file open dialog
        const result = await SystemDialogs.showFileOpen({
            title: 'Open',
            filter: 'txt',
            initialPath: ['C:', 'Users', 'Seth', 'Documents']
        });

        if (!result) return;

        try {
            const content = FileSystemManager.readFile(result.fullPath);
            const fileName = result.filename;

            const textarea = this.getElement('#notepadText');
            if (textarea) {
                textarea.value = content;
            }

            this.setInstanceState('currentFile', result.fullPath);
            this.setInstanceState('fileName', fileName);
            this.updateTitle(fileName);
            this.updateFilePathDisplay();
            this.alert('📂 File opened!');
        } catch (e) {
            await SystemDialogs.alert(`Error opening file: ${e.message}`, 'Error', 'error');
        }
    }

    async save() {
        const textarea = this.getElement('#notepadText');
        if (!textarea) return;

        const currentFile = this.getInstanceState('currentFile');

        if (currentFile) {
            // Save to existing file
            try {
                FileSystemManager.writeFile(currentFile, textarea.value);
                this.alert('💾 File saved!');
            } catch (e) {
                await SystemDialogs.alert(`Error saving file: ${e.message}`, 'Error', 'error');
            }
        } else {
            // No file selected, prompt for Save As
            this.saveAs();
        }

        // Also save to StorageManager for legacy support
        StorageManager.set(this.storageKey, textarea.value);
    }

    async saveAs() {
        const textarea = this.getElement('#notepadText');
        if (!textarea) return;

        // Generate a default filename with full timestamp (date + time) for unique names
        const now = new Date();
        const timestamp = now.toISOString().slice(0, 19).replace(/[T:]/g, '-');
        const defaultName = `note_${timestamp}.txt`;

        const result = await SystemDialogs.showFileSave({
            title: 'Save As',
            filter: 'txt',
            initialPath: ['C:', 'Users', 'Seth', 'Desktop'],
            defaultFilename: defaultName
        });

        if (!result) return;

        try {
            let fileName = result.filename;

            // Ensure .txt extension if no extension provided
            if (!fileName.includes('.')) {
                fileName += '.txt';
            }

            const fullPath = [...result.path, fileName];
            FileSystemManager.writeFile(fullPath, textarea.value);

            this.setInstanceState('currentFile', fullPath);
            this.setInstanceState('fileName', fileName);
            this.updateTitle(fileName);
            this.updateFilePathDisplay();
            this.alert('💾 File saved to ' + fullPath.join('/'));
        } catch (e) {
            await SystemDialogs.alert(`Error saving file: ${e.message}`, 'Error', 'error');
        }
    }

    updateFilePathDisplay() {
        const display = this.getElement('#filePathDisplay');
        const currentFile = this.getInstanceState('currentFile');
        if (display) {
            display.textContent = currentFile ? currentFile.join('/') : 'Unsaved';
        }
    }

    async newDocument() {
        // Check if there's unsaved content
        const textarea = this.getElement('#notepadText');
        if (textarea && textarea.value.trim()) {
            const confirmed = await SystemDialogs.confirm(
                'Create new document? Unsaved changes will be lost.',
                'New Document'
            );
            if (!confirmed) return;
        }

        // Reset file state - this is now a NEW untitled document
        this.setInstanceState('currentFile', null);
        this.setInstanceState('fileName', 'Untitled');

        // Clear textarea
        if (textarea) {
            textarea.value = '';
        }

        // Update UI
        this.updateTitle('Untitled');
        this.updateFilePathDisplay();

        // Clear legacy storage
        StorageManager.remove(this.storageKey);
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
