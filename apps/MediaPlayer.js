/**
 * Media Player App
 * Simulated media player with visualizer
 */

import AppBase from './AppBase.js';

class MediaPlayer extends AppBase {
    constructor() {
        super({
            id: 'mediaplayer',
            name: 'Media Player',
            icon: '📻',
            width: 350,
            height: 400,
            resizable: false
        });

        this.playing = false;
        this.currentTrack = 0;
        this.playlist = [
            { name: 'Dial-up Nostalgia', duration: '0:56' },
            { name: 'Windows Startup', duration: '0:06' },
            { name: 'Error Sound', duration: '0:02' },
            { name: 'Click Sound', duration: '0:01' },
            { name: 'Victory Fanfare', duration: '0:08' }
        ];
    }

    onOpen() {
        const bars = Array(12).fill(0).map((_, i) => 
            `<div class="media-bar" style="animation-delay: ${i * 0.1}s; animation-play-state: paused;"></div>`
        ).join('');

        const tracks = this.playlist.map((track, i) => `
            <div class="playlist-item" data-track="${i}">
                <span>🎵</span>
                <span>${track.name}</span>
                <span style="margin-left:auto;color:#666;">${track.duration}</span>
            </div>
        `).join('');

        return `
            <div class="media-player">
                <div class="media-display">
                    <div class="media-visualizer" id="visualizer">${bars}</div>
                </div>
                <div class="media-controls">
                    <button class="media-btn" id="btnPrev">â®</button>
                    <button class="media-btn" id="btnPlay">▶</button>
                    <button class="media-btn" id="btnStop">â¹</button>
                    <button class="media-btn" id="btnNext">â­</button>
                </div>
                <div class="media-playlist" id="playlist">${tracks}</div>
            </div>
        `;
    }

    onMount() {
        this.getElement('#btnPrev')?.addEventListener('click', () => this.prev());
        this.getElement('#btnPlay')?.addEventListener('click', () => this.togglePlay());
        this.getElement('#btnStop')?.addEventListener('click', () => this.stop());
        this.getElement('#btnNext')?.addEventListener('click', () => this.next());

        this.getElements('.playlist-item').forEach(el => {
            el.addEventListener('click', () => {
                this.currentTrack = parseInt(el.dataset.track);
                this.play();
            });
        });
    }

    togglePlay() {
        if (this.playing) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        this.playing = true;
        this.updateUI();
        this.playSound('startup');
    }

    pause() {
        this.playing = false;
        this.updateUI();
    }

    stop() {
        this.playing = false;
        this.updateUI();
    }

    prev() {
        this.currentTrack = (this.currentTrack - 1 + this.playlist.length) % this.playlist.length;
        if (this.playing) this.play();
        this.updateUI();
        this.playSound('click');
    }

    next() {
        this.currentTrack = (this.currentTrack + 1) % this.playlist.length;
        if (this.playing) this.play();
        this.updateUI();
        this.playSound('click');
    }

    updateUI() {
        // Update play button
        const playBtn = this.getElement('#btnPlay');
        if (playBtn) playBtn.textContent = this.playing ? 'â¸' : '▶';

        // Update visualizer
        this.getElements('.media-bar').forEach(bar => {
            bar.style.animationPlayState = this.playing ? 'running' : 'paused';
        });

        // Update playlist
        this.getElements('.playlist-item').forEach((el, i) => {
            el.classList.toggle('playing', i === this.currentTrack && this.playing);
        });
    }
}

export default MediaPlayer;
