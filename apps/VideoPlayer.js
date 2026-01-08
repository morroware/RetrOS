/**
 * Video Player App
 * Full-featured video player with MP4/WebM support
 *
 * Features:
 * - Play video files from URLs or local paths
 * - Playlist management
 * - Volume control
 * - Seek/progress bar
 * - Fullscreen support
 * - Scriptable via RetroScript
 * - Emits events for ARG integration
 */

import AppBase from './AppBase.js';
import EventBus, { Events } from '../core/EventBus.js';
import SoundSystem from '../features/SoundSystem.js';
import StorageManager from '../core/StorageManager.js';

class VideoPlayer extends AppBase {
    constructor() {
        super({
            id: 'videoplayer',
            name: 'Video Player',
            icon: '📺',
            width: 640,
            height: 520,
            resizable: true,
            singleton: false,
            category: 'multimedia'
        });

        // Default playlist with sample videos
        this.defaultPlaylist = [
            {
                name: 'Sample Video',
                src: 'assets/videos/sample.mp4',
                duration: null
            }
        ];

        // Register semantic event commands for scriptability
        this.registerCommands();
        this.registerQueries();
    }

    /**
     * Register commands for script control
     */
    registerCommands() {
        // Play current video or resume
        this.registerCommand('play', () => {
            const video = this.getInstanceState('video');
            if (video) {
                video.play();
                this.setInstanceState('playing', true);
                EventBus.emit('videoplayer:play', {
                    appId: this.id,
                    windowId: this.getCurrentWindowId(),
                    video: this.getInstanceState('currentVideo'),
                    currentTime: video.currentTime,
                    timestamp: Date.now()
                });
                return { success: true };
            }
            return { success: false, error: 'No video loaded' };
        });

        // Pause playback
        this.registerCommand('pause', () => {
            const video = this.getInstanceState('video');
            if (video) {
                video.pause();
                this.setInstanceState('playing', false);
                EventBus.emit('videoplayer:pause', {
                    appId: this.id,
                    windowId: this.getCurrentWindowId(),
                    currentTime: video.currentTime,
                    timestamp: Date.now()
                });
                return { success: true };
            }
            return { success: false, error: 'No video loaded' };
        });

        // Stop playback
        this.registerCommand('stop', () => {
            const video = this.getInstanceState('video');
            if (video) {
                video.pause();
                video.currentTime = 0;
                this.setInstanceState('playing', false);
                EventBus.emit('videoplayer:stop', {
                    appId: this.id,
                    windowId: this.getCurrentWindowId(),
                    timestamp: Date.now()
                });
                return { success: true };
            }
            return { success: false, error: 'No video loaded' };
        });

        // Load and play a video by URL
        this.registerCommand('load', (src, name) => {
            if (src) {
                this.loadVideo(src, name || src.split('/').pop());
                return { success: true };
            }
            return { success: false, error: 'No source provided' };
        });

        // Next video
        this.registerCommand('next', () => {
            const playlist = this.getInstanceState('playlist') || [];
            const currentVideo = this.getInstanceState('currentVideo') || 0;
            const nextVideo = (currentVideo + 1) % playlist.length;
            this.playVideo(nextVideo);
            return { success: true, video: nextVideo };
        });

        // Previous video
        this.registerCommand('previous', () => {
            const playlist = this.getInstanceState('playlist') || [];
            const currentVideo = this.getInstanceState('currentVideo') || 0;
            const prevVideo = currentVideo === 0 ? playlist.length - 1 : currentVideo - 1;
            this.playVideo(prevVideo);
            return { success: true, video: prevVideo };
        });

        // Set volume (0-100)
        this.registerCommand('setVolume', (volume) => {
            const vol = Math.max(0, Math.min(100, parseInt(volume))) / 100;
            this.setInstanceState('volume', vol);
            const video = this.getInstanceState('video');
            if (video) video.volume = vol;
            EventBus.emit('videoplayer:volume:changed', {
                appId: this.id,
                volume: vol,
                timestamp: Date.now()
            });
            return { success: true, volume: vol };
        });

        // Seek to position (in seconds)
        this.registerCommand('seek', (position) => {
            const video = this.getInstanceState('video');
            if (video) {
                video.currentTime = Math.max(0, Math.min(video.duration || 0, position));
                EventBus.emit('videoplayer:seek', {
                    appId: this.id,
                    position: video.currentTime,
                    timestamp: Date.now()
                });
                return { success: true, position: video.currentTime };
            }
            return { success: false, error: 'No video loaded' };
        });

        // Toggle fullscreen
        this.registerCommand('fullscreen', () => {
            this.toggleFullscreen();
            return { success: true };
        });

        // Play specific video by index
        this.registerCommand('playVideo', (index) => {
            const playlist = this.getInstanceState('playlist') || [];
            const videoIndex = parseInt(index);
            if (videoIndex >= 0 && videoIndex < playlist.length) {
                this.playVideo(videoIndex);
                return { success: true, video: videoIndex };
            }
            return { success: false, error: 'Invalid video index' };
        });

        // Mute/unmute
        this.registerCommand('mute', () => {
            const video = this.getInstanceState('video');
            if (video) {
                video.muted = !video.muted;
                this.setInstanceState('muted', video.muted);
                EventBus.emit('videoplayer:mute', {
                    appId: this.id,
                    muted: video.muted,
                    timestamp: Date.now()
                });
                return { success: true, muted: video.muted };
            }
            return { success: false, error: 'No video loaded' };
        });
    }

    /**
     * Register queries for script inspection
     */
    registerQueries() {
        // Get current playback state
        this.registerQuery('getState', () => {
            const video = this.getInstanceState('video');
            return {
                playing: this.getInstanceState('playing'),
                currentVideo: this.getInstanceState('currentVideo'),
                currentTime: video ? video.currentTime : 0,
                duration: video ? video.duration : 0,
                volume: this.getInstanceState('volume'),
                muted: this.getInstanceState('muted'),
                loop: this.getInstanceState('loop'),
                fullscreen: this.getInstanceState('fullscreen')
            };
        });

        // Get playlist
        this.registerQuery('getPlaylist', () => {
            return { playlist: this.getInstanceState('playlist') || [] };
        });

        // Get current video info
        this.registerQuery('getCurrentVideo', () => {
            const playlist = this.getInstanceState('playlist') || [];
            const currentVideo = this.getInstanceState('currentVideo') || 0;
            const video = playlist[currentVideo];
            return {
                index: currentVideo,
                video: video || null
            };
        });
    }

    onOpen(params = {}) {
        // Load saved playlist or use default
        const savedPlaylist = StorageManager.get('videoPlayerPlaylist');
        const playlist = savedPlaylist || this.defaultPlaylist;
        this.setInstanceState('playlist', playlist);
        this.setInstanceState('currentVideo', 0);
        this.setInstanceState('playing', false);
        this.setInstanceState('currentTime', 0);
        this.setInstanceState('duration', 0);
        this.setInstanceState('volume', SoundSystem.getVolume());
        this.setInstanceState('video', null);
        this.setInstanceState('loop', false);
        this.setInstanceState('muted', false);
        this.setInstanceState('fullscreen', false);

        // Check for launch parameters (file to play)
        if (params.src) {
            setTimeout(() => this.loadVideo(params.src, params.name), 100);
        }

        const videoItems = playlist.map((video, i) => `
            <div class="video-playlist-item" data-video="${i}">
                <span class="video-icon">🎬</span>
                <span class="video-name">${this.escapeHtml(video.name)}</span>
                <span class="video-duration">${video.duration ? this.formatTime(video.duration) : '--:--'}</span>
                <button class="video-remove" data-remove="${i}" title="Remove">x</button>
            </div>
        `).join('');

        return `
            <div class="video-player">
                <div class="video-container">
                    <video id="videoElement" class="video-element">
                        <source src="" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                    <div class="video-overlay" id="videoOverlay">
                        <div class="video-overlay-text">Click to play or load a video</div>
                    </div>
                </div>

                <div class="video-progress-container">
                    <input type="range" class="video-progress" id="progressBar"
                           min="0" max="100" value="0" step="0.1">
                    <div class="video-time-display">
                        <span id="currentTime">0:00</span>
                        <span>/</span>
                        <span id="totalTime">0:00</span>
                    </div>
                </div>

                <div class="video-controls">
                    <button class="video-btn" id="btnPrev" title="Previous">|<</button>
                    <button class="video-btn video-btn-large" id="btnPlay" title="Play">></button>
                    <button class="video-btn" id="btnStop" title="Stop">[]</button>
                    <button class="video-btn" id="btnNext" title="Next">>|</button>
                    <div class="video-volume-container">
                        <span class="volume-icon" id="volumeIcon">Vol</span>
                        <input type="range" class="video-volume" id="volumeSlider"
                               min="0" max="100" value="${Math.round(this.getInstanceState('volume') * 100)}">
                    </div>
                    <button class="video-btn video-btn-small" id="btnLoop" title="Loop">Loop</button>
                    <button class="video-btn video-btn-small" id="btnFullscreen" title="Fullscreen">[ ]</button>
                </div>

                <div class="video-playlist-header">
                    <span>Playlist</span>
                    <div class="playlist-buttons">
                        <button class="playlist-btn" id="btnAddUrl" title="Add from URL">+URL</button>
                        <button class="playlist-btn" id="btnAddFile" title="Add from file">+File</button>
                        <button class="playlist-btn" id="btnClear" title="Clear playlist">Clear</button>
                    </div>
                </div>

                <div class="video-playlist" id="playlist">${videoItems}</div>

                <div class="video-status" id="status">Ready - Double-click a video to play</div>
            </div>
        `;
    }

    onMount() {
        const videoEl = this.getElement('#videoElement');
        this.setInstanceState('video', videoEl);

        // Video element event listeners
        this.addHandler(videoEl, 'loadedmetadata', () => {
            this.setInstanceState('duration', videoEl.duration);
            this.updateTotalTime(videoEl.duration);
            const playlist = this.getInstanceState('playlist');
            const currentVideo = this.getInstanceState('currentVideo');
            if (playlist[currentVideo]) {
                playlist[currentVideo].duration = videoEl.duration;
                this.setInstanceState('playlist', playlist);
                this.savePlaylist();
            }
            EventBus.emit('videoplayer:loaded', {
                appId: this.id,
                windowId: this.getCurrentWindowId(),
                duration: videoEl.duration,
                timestamp: Date.now()
            });
        });

        this.addHandler(videoEl, 'timeupdate', () => {
            this.setInstanceState('currentTime', videoEl.currentTime);
            this.updateProgress(videoEl.currentTime, videoEl.duration);
            EventBus.emit('videoplayer:timeupdate', {
                appId: this.id,
                currentTime: videoEl.currentTime,
                duration: videoEl.duration
            });
        });

        this.addHandler(videoEl, 'ended', () => {
            this.onVideoEnded();
        });

        this.addHandler(videoEl, 'error', (e) => {
            const playlist = this.getInstanceState('playlist');
            const currentVideo = this.getInstanceState('currentVideo');
            const videoInfo = playlist[currentVideo];
            this.setStatus(`Error loading: ${videoInfo?.name || 'video'}`);
            this.setInstanceState('playing', false);
            this.updatePlayButton();
            EventBus.emit('videoplayer:error', {
                appId: this.id,
                windowId: this.getCurrentWindowId(),
                error: 'Failed to load video',
                timestamp: Date.now()
            });
        });

        this.addHandler(videoEl, 'play', () => {
            this.setInstanceState('playing', true);
            this.updatePlayButton();
            this.hideOverlay();
        });

        this.addHandler(videoEl, 'pause', () => {
            this.setInstanceState('playing', false);
            this.updatePlayButton();
        });

        // Control buttons
        this.addHandler(this.getElement('#btnPlay'), 'click', () => this.togglePlay());
        this.addHandler(this.getElement('#btnStop'), 'click', () => this.stop());
        this.addHandler(this.getElement('#btnPrev'), 'click', () => this.prev());
        this.addHandler(this.getElement('#btnNext'), 'click', () => this.next());
        this.addHandler(this.getElement('#btnLoop'), 'click', () => this.toggleLoop());
        this.addHandler(this.getElement('#btnFullscreen'), 'click', () => this.toggleFullscreen());

        // Click on video to play/pause
        this.addHandler(this.getElement('.video-container'), 'click', () => this.togglePlay());

        // Progress bar
        this.addHandler(this.getElement('#progressBar'), 'input', (e) => this.seek(e.target.value));

        // Volume control
        this.addHandler(this.getElement('#volumeSlider'), 'input', (e) => this.setVolume(e.target.value));
        this.addHandler(this.getElement('#volumeIcon'), 'click', () => this.toggleMute());

        // Playlist buttons
        this.addHandler(this.getElement('#btnAddUrl'), 'click', () => this.showAddUrlDialog());
        this.addHandler(this.getElement('#btnAddFile'), 'click', () => this.showFileDialog());
        this.addHandler(this.getElement('#btnClear'), 'click', () => this.clearPlaylist());

        // Playlist item clicks
        this.bindPlaylistEvents();

        // Listen for volume changes from SoundSystem
        this.onEvent(Events.VOLUME_CHANGE, ({ volume }) => this.onVolumeChanged(volume));

        // Update UI state
        this.updateLoopButton();
    }

    bindPlaylistEvents() {
        this.getElements('.video-playlist-item').forEach(el => {
            this.addHandler(el, 'dblclick', () => {
                const videoIndex = parseInt(el.dataset.video);
                this.playVideo(videoIndex);
            });
        });

        this.getElements('.video-remove').forEach(el => {
            this.addHandler(el, 'click', (e) => {
                e.stopPropagation();
                this.removeVideo(parseInt(el.dataset.remove));
            });
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    togglePlay() {
        const video = this.getInstanceState('video');
        if (video && video.src) {
            if (video.paused) {
                video.play().catch(e => this.setStatus('Playback error'));
            } else {
                video.pause();
            }
        } else {
            // No video loaded, try to play first from playlist
            const playlist = this.getInstanceState('playlist');
            if (playlist && playlist.length > 0) {
                this.playVideo(0);
            }
        }
    }

    loadVideo(src, name = null) {
        const video = this.getInstanceState('video');
        if (!video) return;

        const videoName = name || src.split('/').pop();

        // Add to playlist if not already there
        const playlist = this.getInstanceState('playlist');
        let videoIndex = playlist.findIndex(v => v.src === src);
        if (videoIndex === -1) {
            playlist.push({ name: videoName, src, duration: null });
            videoIndex = playlist.length - 1;
            this.setInstanceState('playlist', playlist);
            this.refreshPlaylist();
            this.savePlaylist();
        }

        this.playVideo(videoIndex);
    }

    playVideo(videoIndex) {
        const playlist = this.getInstanceState('playlist');
        if (!playlist || videoIndex < 0 || videoIndex >= playlist.length) return;

        const video = this.getInstanceState('video');
        const videoInfo = playlist[videoIndex];

        this.setInstanceState('currentVideo', videoIndex);
        this.setStatus(`Loading: ${videoInfo.name}`);
        this.updateCurrentTitle(videoInfo.name);
        this.updatePlaylistHighlight(videoIndex);

        video.src = videoInfo.src;
        video.load();

        video.play()
            .then(() => {
                this.setStatus(`Now playing: ${videoInfo.name}`);
                this.hideOverlay();
                EventBus.emit('videoplayer:playing', {
                    appId: this.id,
                    windowId: this.getCurrentWindowId(),
                    video: videoInfo,
                    index: videoIndex,
                    timestamp: Date.now()
                });
            })
            .catch(e => {
                this.setStatus('Click to play (browser policy)');
            });
    }

    stop() {
        const video = this.getInstanceState('video');
        if (video) {
            video.pause();
            video.currentTime = 0;
            this.setInstanceState('playing', false);
            this.updatePlayButton();
            this.updateProgress(0, 0);
            this.setStatus('Stopped');
            EventBus.emit('videoplayer:stop', {
                appId: this.id,
                windowId: this.getCurrentWindowId(),
                timestamp: Date.now()
            });
        }
    }

    prev() {
        this.playSound('click');
        let videoIndex = this.getInstanceState('currentVideo') - 1;
        const playlist = this.getInstanceState('playlist');
        if (videoIndex < 0) {
            videoIndex = playlist.length - 1;
        }
        this.playVideo(videoIndex);
    }

    next() {
        this.playSound('click');
        const playlist = this.getInstanceState('playlist');
        let videoIndex = this.getInstanceState('currentVideo') + 1;
        if (videoIndex >= playlist.length) {
            videoIndex = 0;
        }
        this.playVideo(videoIndex);
    }

    onVideoEnded() {
        const loop = this.getInstanceState('loop');
        const playlist = this.getInstanceState('playlist');
        const currentVideo = this.getInstanceState('currentVideo');

        EventBus.emit('videoplayer:ended', {
            appId: this.id,
            windowId: this.getCurrentWindowId(),
            video: playlist[currentVideo],
            index: currentVideo,
            timestamp: Date.now()
        });

        if (loop) {
            // Replay current video
            this.playVideo(currentVideo);
        } else if (currentVideo < playlist.length - 1) {
            // Play next video
            this.playVideo(currentVideo + 1);
        } else {
            // End of playlist
            this.stop();
            this.setStatus('Playlist ended');
            EventBus.emit('videoplayer:playlist:ended', {
                appId: this.id,
                windowId: this.getCurrentWindowId(),
                timestamp: Date.now()
            });
        }
    }

    seek(percent) {
        const video = this.getInstanceState('video');
        if (video && video.duration) {
            video.currentTime = (percent / 100) * video.duration;
        }
    }

    setVolume(value) {
        const volume = value / 100;
        this.setInstanceState('volume', volume);

        const video = this.getInstanceState('video');
        if (video) {
            video.volume = volume;
        }

        this.updateVolumeDisplay(volume);
    }

    toggleMute() {
        const video = this.getInstanceState('video');
        if (video) {
            video.muted = !video.muted;
            this.setInstanceState('muted', video.muted);
            this.updateVolumeIcon();
        }
    }

    toggleLoop() {
        const loop = !this.getInstanceState('loop');
        this.setInstanceState('loop', loop);
        const video = this.getInstanceState('video');
        if (video) {
            video.loop = loop;
        }
        this.updateLoopButton();
        this.playSound('click');
    }

    toggleFullscreen() {
        const container = this.getElement('.video-container');
        if (!container) return;

        if (!document.fullscreenElement) {
            container.requestFullscreen?.() ||
            container.webkitRequestFullscreen?.() ||
            container.msRequestFullscreen?.();
            this.setInstanceState('fullscreen', true);
        } else {
            document.exitFullscreen?.() ||
            document.webkitExitFullscreen?.() ||
            document.msExitFullscreen?.();
            this.setInstanceState('fullscreen', false);
        }

        EventBus.emit('videoplayer:fullscreen', {
            appId: this.id,
            fullscreen: this.getInstanceState('fullscreen'),
            timestamp: Date.now()
        });
    }

    onVolumeChanged(volume) {
        this.setInstanceState('volume', volume);
        this.updateVolumeDisplay(volume);
        const slider = this.getElement('#volumeSlider');
        if (slider) {
            slider.value = Math.round(volume * 100);
        }
    }

    // UI Update Methods
    updatePlayButton() {
        const btn = this.getElement('#btnPlay');
        if (btn) {
            btn.textContent = this.getInstanceState('playing') ? '||' : '>';
            btn.title = this.getInstanceState('playing') ? 'Pause' : 'Play';
        }
    }

    updateProgress(currentTime, duration) {
        const progressBar = this.getElement('#progressBar');
        const currentTimeEl = this.getElement('#currentTime');

        if (progressBar && duration) {
            progressBar.value = (currentTime / duration) * 100;
        }
        if (currentTimeEl) {
            currentTimeEl.textContent = this.formatTime(currentTime);
        }
    }

    updateTotalTime(duration) {
        const totalTimeEl = this.getElement('#totalTime');
        if (totalTimeEl) {
            totalTimeEl.textContent = this.formatTime(duration);
        }
    }

    updateCurrentTitle(title) {
        this.setStatus(`Now playing: ${title}`);
    }

    updateVolumeDisplay(volume) {
        const slider = this.getElement('#volumeSlider');
        if (slider) {
            slider.value = Math.round(volume * 100);
        }
        this.updateVolumeIcon();
    }

    updateVolumeIcon() {
        const icon = this.getElement('#volumeIcon');
        const video = this.getInstanceState('video');
        const muted = video?.muted || this.getInstanceState('muted');
        const volume = this.getInstanceState('volume');

        if (icon) {
            if (muted || volume === 0) icon.textContent = 'Mute';
            else icon.textContent = 'Vol';
        }
    }

    updateLoopButton() {
        const btn = this.getElement('#btnLoop');
        if (btn) {
            btn.classList.toggle('active', this.getInstanceState('loop'));
        }
    }

    updatePlaylistHighlight(videoIndex) {
        this.getElements('.video-playlist-item').forEach((el, i) => {
            el.classList.toggle('playing', i === videoIndex);
            el.classList.toggle('active', i === videoIndex);
        });
    }

    hideOverlay() {
        const overlay = this.getElement('#videoOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    showOverlay() {
        const overlay = this.getElement('#videoOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
        }
    }

    setStatus(message) {
        const statusEl = this.getElement('#status');
        if (statusEl) {
            statusEl.textContent = message;
        }
    }

    // Playlist Management
    async showAddUrlDialog() {
        const url = await this.prompt('Enter video URL (MP4, WebM, OGG):', '', 'Add URL');
        if (url) {
            const name = await this.prompt('Enter video name:', url.split('/').pop().replace(/\.[^/.]+$/, ''), 'Video Name');
            if (name) {
                this.addVideo({ name, src: url, duration: null });
            }
        }
    }

    showFileDialog() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'video/*';
        input.multiple = true;

        input.addEventListener('change', (e) => {
            const files = e.target.files;
            for (const file of files) {
                const url = URL.createObjectURL(file);
                this.addVideo({
                    name: file.name.replace(/\.[^/.]+$/, ''),
                    src: url,
                    duration: null,
                    isBlob: true
                });
            }
        });

        input.click();
    }

    addVideo(video) {
        const playlist = this.getInstanceState('playlist');
        playlist.push(video);
        this.setInstanceState('playlist', playlist);
        this.savePlaylist();
        this.refreshPlaylist();
        this.setStatus(`Added: ${video.name}`);

        EventBus.emit('videoplayer:playlist:add', {
            appId: this.id,
            video: video,
            timestamp: Date.now()
        });
    }

    removeVideo(index) {
        const playlist = this.getInstanceState('playlist');
        const currentVideo = this.getInstanceState('currentVideo');

        if (index === currentVideo && this.getInstanceState('playing')) {
            this.stop();
        }

        playlist.splice(index, 1);
        this.setInstanceState('playlist', playlist);

        if (currentVideo >= playlist.length) {
            this.setInstanceState('currentVideo', Math.max(0, playlist.length - 1));
        } else if (index < currentVideo) {
            this.setInstanceState('currentVideo', currentVideo - 1);
        }

        this.savePlaylist();
        this.refreshPlaylist();
        this.setStatus('Video removed');
    }

    async clearPlaylist() {
        if (await this.confirm('Clear entire playlist?', 'Clear Playlist')) {
            this.stop();
            this.setInstanceState('playlist', []);
            this.setInstanceState('currentVideo', 0);
            this.savePlaylist();
            this.refreshPlaylist();
            this.showOverlay();
            this.setStatus('Playlist cleared');
        }
    }

    refreshPlaylist() {
        const playlist = this.getInstanceState('playlist');
        const playlistEl = this.getElement('#playlist');

        if (!playlistEl) return;

        playlistEl.innerHTML = playlist.map((video, i) => `
            <div class="video-playlist-item ${i === this.getInstanceState('currentVideo') ? 'active' : ''}" data-video="${i}">
                <span class="video-icon">🎬</span>
                <span class="video-name">${this.escapeHtml(video.name)}</span>
                <span class="video-duration">${video.duration ? this.formatTime(video.duration) : '--:--'}</span>
                <button class="video-remove" data-remove="${i}" title="Remove">x</button>
            </div>
        `).join('');

        // Rebind event handlers
        this.bindPlaylistEvents();
    }

    savePlaylist() {
        const playlist = this.getInstanceState('playlist');
        const saveable = playlist.filter(v => !v.isBlob);
        StorageManager.set('videoPlayerPlaylist', saveable);
    }

    onClose() {
        const video = this.getInstanceState('video');
        if (video) {
            video.pause();
            video.src = '';
        }
        EventBus.emit('videoplayer:closed', {
            appId: this.id,
            windowId: this.getCurrentWindowId(),
            timestamp: Date.now()
        });
    }
}

export default VideoPlayer;
