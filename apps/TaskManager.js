/**
 * Task Manager - Windows 95 Style Process Manager
 * Monitor running processes, system performance, and end tasks
 */

import AppBase from './AppBase.js';
import WindowManager from '../core/WindowManager.js';
import StateManager from '../core/StateManager.js';
import EventBus from '../core/EventBus.js';

class TaskManager extends AppBase {
    constructor() {
        super({
            id: 'taskmgr',
            name: 'Task Manager',
            icon: '📊',
            width: 450,
            height: 400,
            resizable: true,
            singleton: true
        });

        this.updateInterval = null;
        this.cpuHistory = [];
        this.memHistory = [];
        this.maxHistoryPoints = 60;
        this.currentTab = 'applications';
    }

    onOpen() {
        return `
            <style>
                .taskmgr-container {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    background: #c0c0c0;
                    font-size: 11px;
                }
                .taskmgr-tabs {
                    display: flex;
                    padding: 2px 4px 0 4px;
                    background: #c0c0c0;
                }
                .taskmgr-tab {
                    padding: 4px 12px;
                    background: #c0c0c0;
                    border: 2px solid;
                    border-color: #fff #808080 #c0c0c0 #fff;
                    cursor: pointer;
                    margin-right: 2px;
                    font-size: 11px;
                }
                .taskmgr-tab.active {
                    background: #c0c0c0;
                    border-bottom-color: #c0c0c0;
                    position: relative;
                    z-index: 1;
                    margin-bottom: -2px;
                    padding-bottom: 6px;
                }
                .taskmgr-tab:hover:not(.active) {
                    background: #d4d4d4;
                }
                .taskmgr-content {
                    flex: 1;
                    border: 2px solid;
                    border-color: #fff #808080 #808080 #fff;
                    background: #c0c0c0;
                    margin: 0 4px;
                    padding: 8px;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }
                .taskmgr-panel {
                    display: none;
                    flex-direction: column;
                    height: 100%;
                }
                .taskmgr-panel.active {
                    display: flex;
                }
                .taskmgr-list {
                    flex: 1;
                    background: white;
                    border: 2px inset #fff;
                    overflow-y: auto;
                }
                .taskmgr-list-header {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr;
                    background: #c0c0c0;
                    border-bottom: 2px solid #808080;
                    font-weight: bold;
                    padding: 3px 0;
                    position: sticky;
                    top: 0;
                }
                .taskmgr-list-header div {
                    padding: 2px 8px;
                    border-right: 1px solid #808080;
                }
                .taskmgr-list-item {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr;
                    padding: 2px 0;
                    cursor: pointer;
                    border-bottom: 1px solid #e0e0e0;
                }
                .taskmgr-list-item:hover {
                    background: #e0e0ff;
                }
                .taskmgr-list-item.selected {
                    background: #000080;
                    color: white;
                }
                .taskmgr-list-item div {
                    padding: 2px 8px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .taskmgr-footer {
                    padding: 8px 4px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .taskmgr-btn {
                    padding: 4px 16px;
                    background: #c0c0c0;
                    border: 2px outset #fff;
                    cursor: pointer;
                    font-size: 11px;
                }
                .taskmgr-btn:active:not(:disabled) {
                    border-style: inset;
                }
                .taskmgr-btn:disabled {
                    color: #808080;
                    cursor: not-allowed;
                }
                .taskmgr-status {
                    display: flex;
                    gap: 20px;
                    font-size: 10px;
                }
                .taskmgr-status-item {
                    display: flex;
                    gap: 5px;
                }
                .perf-container {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                    height: 100%;
                }
                .perf-box {
                    background: white;
                    border: 2px inset #fff;
                    padding: 8px;
                    display: flex;
                    flex-direction: column;
                }
                .perf-title {
                    font-weight: bold;
                    margin-bottom: 5px;
                    color: #000080;
                }
                .perf-graph {
                    flex: 1;
                    background: #000;
                    border: 1px solid #808080;
                    position: relative;
                    min-height: 80px;
                }
                .perf-graph canvas {
                    width: 100%;
                    height: 100%;
                }
                .perf-value {
                    margin-top: 5px;
                    font-size: 12px;
                    font-weight: bold;
                }
                .perf-details {
                    margin-top: 8px;
                    font-size: 10px;
                    color: #444;
                }
                .proc-list-header {
                    grid-template-columns: 2fr 1fr 1fr 1fr;
                }
                .proc-list-item {
                    grid-template-columns: 2fr 1fr 1fr 1fr;
                }
            </style>

            <div class="taskmgr-container">
                <div class="taskmgr-tabs">
                    <div class="taskmgr-tab active" data-tab="applications">Applications</div>
                    <div class="taskmgr-tab" data-tab="processes">Processes</div>
                    <div class="taskmgr-tab" data-tab="performance">Performance</div>
                </div>

                <div class="taskmgr-content">
                    <!-- Applications Tab -->
                    <div class="taskmgr-panel active" id="panel-applications">
                        <div class="taskmgr-list" id="app-list">
                            <div class="taskmgr-list-header">
                                <div>Task</div>
                                <div>Status</div>
                                <div>Memory</div>
                            </div>
                            <div id="app-list-body"></div>
                        </div>
                        <div style="margin-top: 8px; display: flex; gap: 8px;">
                            <button class="taskmgr-btn" id="btn-end-task" disabled>End Task</button>
                            <button class="taskmgr-btn" id="btn-switch-to" disabled>Switch To</button>
                            <button class="taskmgr-btn" id="btn-new-task">New Task...</button>
                        </div>
                    </div>

                    <!-- Processes Tab -->
                    <div class="taskmgr-panel" id="panel-processes">
                        <div class="taskmgr-list" id="proc-list">
                            <div class="taskmgr-list-header proc-list-header">
                                <div>Image Name</div>
                                <div>PID</div>
                                <div>CPU</div>
                                <div>Memory</div>
                            </div>
                            <div id="proc-list-body"></div>
                        </div>
                        <div style="margin-top: 8px; display: flex; gap: 8px;">
                            <button class="taskmgr-btn" id="btn-end-process" disabled>End Process</button>
                            <label style="margin-left: auto; display: flex; align-items: center; gap: 5px;">
                                <input type="checkbox" id="show-all-proc"> Show processes from all users
                            </label>
                        </div>
                    </div>

                    <!-- Performance Tab -->
                    <div class="taskmgr-panel" id="panel-performance">
                        <div class="perf-container">
                            <div class="perf-box">
                                <div class="perf-title">CPU Usage</div>
                                <div class="perf-graph">
                                    <canvas id="cpu-graph"></canvas>
                                </div>
                                <div class="perf-value" id="cpu-value">0%</div>
                            </div>
                            <div class="perf-box">
                                <div class="perf-title">Memory Usage</div>
                                <div class="perf-graph">
                                    <canvas id="mem-graph"></canvas>
                                </div>
                                <div class="perf-value" id="mem-value">0 MB / 640 KB</div>
                            </div>
                        </div>
                        <div class="perf-details" id="perf-details">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
                                <div>
                                    <strong>Totals:</strong><br>
                                    Handles: <span id="stat-handles">0</span><br>
                                    Threads: <span id="stat-threads">0</span><br>
                                    Processes: <span id="stat-processes">0</span>
                                </div>
                                <div>
                                    <strong>Physical Memory (K):</strong><br>
                                    Total: <span id="stat-total-mem">655360</span><br>
                                    Available: <span id="stat-avail-mem">0</span><br>
                                    System Cache: <span id="stat-cache">0</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="taskmgr-footer">
                    <div class="taskmgr-status">
                        <div class="taskmgr-status-item">
                            <span>Processes:</span>
                            <span id="footer-processes">0</span>
                        </div>
                        <div class="taskmgr-status-item">
                            <span>CPU Usage:</span>
                            <span id="footer-cpu">0%</span>
                        </div>
                        <div class="taskmgr-status-item">
                            <span>Memory:</span>
                            <span id="footer-mem">0K</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    onMount() {
        // Tab switching
        const tabs = this.getElements('.taskmgr-tab');
        tabs.forEach(tab => {
            this.addHandler(tab, 'click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentTab = tab.dataset.tab;

                const panels = this.getElements('.taskmgr-panel');
                panels.forEach(p => p.classList.remove('active'));
                const targetPanel = this.getElement(`#panel-${tab.dataset.tab}`);
                if (targetPanel) targetPanel.classList.add('active');

                if (tab.dataset.tab === 'performance') {
                    this.initGraphs();
                }
            });
        });

        // Button handlers
        this.addHandler(this.getElement('#btn-end-task'), 'click', () => this.endSelectedTask());
        this.addHandler(this.getElement('#btn-switch-to'), 'click', () => this.switchToSelected());
        this.addHandler(this.getElement('#btn-new-task'), 'click', () => this.newTask());
        this.addHandler(this.getElement('#btn-end-process'), 'click', () => this.endSelectedProcess());

        // Start update loop
        this.updateInterval = setInterval(() => this.update(), 1000);
        this.update();
    }

    onClose() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    update() {
        this.updateApplicationsList();
        this.updateProcessesList();
        this.updatePerformance();
        this.updateFooter();
    }

    updateApplicationsList() {
        const listBody = this.getElement('#app-list-body');
        if (!listBody) return;

        // Get all open windows from WindowManager
        const windows = WindowManager.getOpenWindows ? WindowManager.getOpenWindows() : [];
        const openWindowEls = document.querySelectorAll('.window.open:not(.minimized)');

        listBody.innerHTML = '';

        openWindowEls.forEach((windowEl, index) => {
            const titleEl = windowEl.querySelector('.title-text');
            const title = titleEl ? titleEl.textContent.trim() : 'Unknown';
            const windowId = windowEl.id.replace('window-', '');

            // Simulate memory usage
            const memUsage = Math.floor(Math.random() * 5000 + 500);

            const item = document.createElement('div');
            item.className = 'taskmgr-list-item';
            item.dataset.windowId = windowId;
            item.innerHTML = `
                <div>📄 ${title}</div>
                <div>Running</div>
                <div>${memUsage} K</div>
            `;

            item.addEventListener('click', () => {
                listBody.querySelectorAll('.taskmgr-list-item').forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
                this.getElement('#btn-end-task').disabled = false;
                this.getElement('#btn-switch-to').disabled = false;
            });

            item.addEventListener('dblclick', () => {
                WindowManager.focus(windowId);
            });

            listBody.appendChild(item);
        });

        if (openWindowEls.length === 0) {
            listBody.innerHTML = '<div style="padding: 10px; color: #666; text-align: center;">No running applications</div>';
        }
    }

    updateProcessesList() {
        const listBody = this.getElement('#proc-list-body');
        if (!listBody) return;

        // Simulate system processes
        const processes = [
            { name: 'System', pid: 4, cpu: '0%', mem: '24 K' },
            { name: 'smss.exe', pid: 156, cpu: '0%', mem: '160 K' },
            { name: 'csrss.exe', pid: 184, cpu: '1%', mem: '1,240 K' },
            { name: 'winlogon.exe', pid: 208, cpu: '0%', mem: '2,100 K' },
            { name: 'services.exe', pid: 252, cpu: '0%', mem: '1,800 K' },
            { name: 'lsass.exe', pid: 264, cpu: '0%', mem: '1,400 K' },
            { name: 'explorer.exe', pid: 1024, cpu: `${Math.floor(Math.random() * 5)}%`, mem: '8,420 K' },
            { name: 'taskmgr.exe', pid: 2048, cpu: `${Math.floor(Math.random() * 3)}%`, mem: '2,840 K' }
        ];

        // Add running windows as processes
        const openWindowEls = document.querySelectorAll('.window.open');
        openWindowEls.forEach((windowEl, index) => {
            const titleEl = windowEl.querySelector('.title-text');
            const title = titleEl ? titleEl.textContent.trim().split(' ')[0].toLowerCase() : 'app';
            processes.push({
                name: `${title}.exe`,
                pid: 3000 + index,
                cpu: `${Math.floor(Math.random() * 10)}%`,
                mem: `${Math.floor(Math.random() * 5000 + 500)} K`
            });
        });

        listBody.innerHTML = '';

        processes.forEach(proc => {
            const item = document.createElement('div');
            item.className = 'taskmgr-list-item proc-list-item';
            item.dataset.processName = proc.name;
            item.innerHTML = `
                <div>${proc.name}</div>
                <div>${proc.pid}</div>
                <div>${proc.cpu}</div>
                <div>${proc.mem}</div>
            `;

            item.addEventListener('click', () => {
                listBody.querySelectorAll('.taskmgr-list-item').forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
                this.getElement('#btn-end-process').disabled = false;
            });

            listBody.appendChild(item);
        });

        // Update stats
        const statProcesses = this.getElement('#stat-processes');
        if (statProcesses) statProcesses.textContent = processes.length;
    }

    updatePerformance() {
        // Generate simulated CPU and memory usage
        const cpuUsage = Math.floor(Math.random() * 30 + 5);
        const memUsage = Math.floor(Math.random() * 40 + 20);

        // Update history
        this.cpuHistory.push(cpuUsage);
        this.memHistory.push(memUsage);

        if (this.cpuHistory.length > this.maxHistoryPoints) {
            this.cpuHistory.shift();
            this.memHistory.shift();
        }

        // Update values
        const cpuValue = this.getElement('#cpu-value');
        const memValue = this.getElement('#mem-value');

        if (cpuValue) cpuValue.textContent = `${cpuUsage}%`;
        if (memValue) memValue.textContent = `${Math.floor(640 * memUsage / 100)} KB / 640 KB`;

        // Update stats
        const handles = this.getElement('#stat-handles');
        const threads = this.getElement('#stat-threads');
        const availMem = this.getElement('#stat-avail-mem');
        const cache = this.getElement('#stat-cache');

        if (handles) handles.textContent = Math.floor(Math.random() * 1000 + 500);
        if (threads) threads.textContent = Math.floor(Math.random() * 100 + 50);
        if (availMem) availMem.textContent = Math.floor(655360 * (100 - memUsage) / 100);
        if (cache) cache.textContent = Math.floor(Math.random() * 100000 + 50000);

        // Draw graphs if performance tab is active
        if (this.currentTab === 'performance') {
            this.drawGraph('cpu-graph', this.cpuHistory, '#00ff00');
            this.drawGraph('mem-graph', this.memHistory, '#ffff00');
        }
    }

    initGraphs() {
        this.drawGraph('cpu-graph', this.cpuHistory, '#00ff00');
        this.drawGraph('mem-graph', this.memHistory, '#ffff00');
    }

    drawGraph(canvasId, data, color) {
        const canvas = this.getElement(`#${canvasId}`);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const rect = canvas.parentElement.getBoundingClientRect();

        canvas.width = rect.width - 2;
        canvas.height = rect.height - 2;

        const width = canvas.width;
        const height = canvas.height;

        // Clear
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);

        // Draw grid
        ctx.strokeStyle = '#003300';
        ctx.lineWidth = 1;

        for (let i = 0; i < 10; i++) {
            const y = (height / 10) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        for (let i = 0; i < 12; i++) {
            const x = (width / 12) * i;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        // Draw data line
        if (data.length > 1) {
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();

            const step = width / (this.maxHistoryPoints - 1);
            const startX = width - (data.length - 1) * step;

            for (let i = 0; i < data.length; i++) {
                const x = startX + i * step;
                const y = height - (data[i] / 100) * height;

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }

            ctx.stroke();

            // Fill under the line
            ctx.lineTo(startX + (data.length - 1) * step, height);
            ctx.lineTo(startX, height);
            ctx.closePath();
            ctx.fillStyle = color.replace('#', '#') + '33';
            ctx.fill();
        }
    }

    updateFooter() {
        const processes = document.querySelectorAll('.window.open').length + 8; // +8 for system processes
        const cpu = this.cpuHistory.length > 0 ? this.cpuHistory[this.cpuHistory.length - 1] : 0;
        const mem = this.memHistory.length > 0 ? this.memHistory[this.memHistory.length - 1] : 0;

        const footerProcesses = this.getElement('#footer-processes');
        const footerCpu = this.getElement('#footer-cpu');
        const footerMem = this.getElement('#footer-mem');

        if (footerProcesses) footerProcesses.textContent = processes;
        if (footerCpu) footerCpu.textContent = `${cpu}%`;
        if (footerMem) footerMem.textContent = `${Math.floor(640 * mem / 100)}K / 640K`;
    }

    endSelectedTask() {
        const selected = this.getElement('#app-list-body .taskmgr-list-item.selected');
        if (!selected) return;

        const windowId = selected.dataset.windowId;
        if (windowId) {
            WindowManager.close(windowId);
            this.update();
            this.getElement('#btn-end-task').disabled = true;
            this.getElement('#btn-switch-to').disabled = true;
        }
    }

    switchToSelected() {
        const selected = this.getElement('#app-list-body .taskmgr-list-item.selected');
        if (!selected) return;

        const windowId = selected.dataset.windowId;
        if (windowId) {
            WindowManager.focus(windowId);
        }
    }

    newTask() {
        EventBus.emit('app:open', { id: 'run' });
    }

    endSelectedProcess() {
        const selected = this.getElement('#proc-list-body .taskmgr-list-item.selected');
        if (!selected) return;

        const processName = selected.dataset.processName;

        // Check for system processes
        const systemProcesses = ['system', 'smss.exe', 'csrss.exe', 'winlogon.exe', 'services.exe', 'lsass.exe'];
        if (systemProcesses.includes(processName.toLowerCase())) {
            EventBus.emit('dialog:alert', {
                message: 'Unable to terminate process. This is a critical system process.',
                icon: 'error',
                title: 'Task Manager Warning'
            });
            return;
        }

        // For other processes, try to close related window
        EventBus.emit('dialog:alert', {
            message: `Process "${processName}" has been terminated.`,
            icon: 'info',
            title: 'Task Manager'
        });

        this.update();
        this.getElement('#btn-end-process').disabled = true;
    }
}

export default TaskManager;
