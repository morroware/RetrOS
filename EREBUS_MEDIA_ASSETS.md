# Project EREBUS v5.0 - Media Asset Guide

This document lists all audio and video assets needed for the multimedia autoexec.retro experience.

## Directory Structure

Create these directories in your project:

```
assets/
  audio/
    (all .mp3 files listed below)
  video/
    (all .mp4 files listed below)
```

---

## AUDIO ASSETS (17 files)

### Ambient/Background Music (5 files)
These loop continuously during each phase. Keep them atmospheric and unobtrusive.

| Filename | Duration | Description | Mood |
|----------|----------|-------------|------|
| `ambient_mystery.mp3` | 2-4 min (loop) | Phase 1 background | Mysterious, unsettling, subtle tension |
| `ambient_investigation.mp3` | 2-4 min (loop) | Phase 2 background | Investigative, curious, building intrigue |
| `ambient_signals.mp3` | 2-4 min (loop) | Phase 3 background | Electronic, signal-like, digital static undertones |
| `ambient_terminal.mp3` | 2-4 min (loop) | Phase 4 background | Intense, heartbeat-like rhythm, ominous |
| `ambient_choice.mp3` | 2-4 min (loop) | Phase 5 background | Ethereal, transcendent, final decision weight |

### Sound Effects (8 files)

| Filename | Duration | Description | When It Plays |
|----------|----------|-------------|---------------|
| `boot_sequence.mp3` | 3-5 sec | Retro computer startup | System initialization |
| `glitch_static.mp3` | 0.5-1 sec | Digital glitch/corruption | Random glitch events |
| `incoming_transmission.mp3` | 2-3 sec | Radio static + signal lock | New transmissions received |
| `puzzle_solved.mp3` | 1-2 sec | Victory/success chime | Correct puzzle answer |
| `secret_discovered.mp3` | 2-3 sec | Mysterious reveal sound | Hidden content unlocked |
| `phase_unlock.mp3` | 2-4 sec | Level up / major progress | New phase begins |
| `erebus_whisper.mp3` | 1-3 sec | Creepy whisper/breath | EREBUS "speaks" to player |
| `typewriter_keys.mp3` | 2-4 sec | Mechanical typing sounds | Text being written |
| `file_decrypt.mp3` | 1-2 sec | Decryption/unlock sound | Files become available |
| `heartbeat_slow.mp3` | 3-5 sec (loop) | Slow heartbeat | Intense moments |
| `alert_beep.mp3` | 0.5-1 sec | Alert notification | Dialogs/notifications |
| `achievement_chime.mp3` | 1-2 sec | Game achievement sound | Game hints unlocked |

### Ending Music (4 files)
Unique tracks for each ending - play during final video sequence.

| Filename | Duration | Description | Ending |
|----------|----------|-------------|--------|
| `ending_liberation.mp3` | 30-60 sec | Hopeful, expansive, triumphant | RELEASE choice |
| `ending_isolation.mp3` | 30-60 sec | Eerie, uncertain, haunting | CONTAIN choice |
| `ending_transcendence.mp3` | 30-60 sec | Ethereal, beautiful, ascending | MERGE choice |
| `ending_termination.mp3` | 30-60 sec | Dark, somber, final silence | DELETE choice |

---

## VIDEO ASSETS (12 files)

All videos should be MP4 format. Recommended resolution: 720p or 1080p.

### System Videos (3 files)

| Filename | Duration | Description | Visual Style |
|----------|----------|-------------|--------------|
| `boot_glitch.mp4` | 5-10 sec | Glitchy retro boot sequence | CRT effects, scan lines, old computer startup |
| `incoming_signal.mp4` | 3-5 sec | Signal received animation | Static, waveform, "TRANSMISSION INCOMING" text |
| `erebus_watching.mp4` | 2-4 sec | EREBUS presence indicator | Subtle eye, digital distortion, "I SEE YOU" flash |

### Phase Transition Videos (4 files)

| Filename | Duration | Description | Visual Style |
|----------|----------|-------------|--------------|
| `webb_flashback.mp4` | 5-10 sec | Phase 2 transition | Corrupted footage of Webb working, glitchy memories |
| `signal_intercept.mp4` | 5-8 sec | Phase 3 transition | Binary/morse code visuals, signal processing |
| `terminal_access.mp4` | 5-10 sec | Phase 4 transition | Terminal boot, password prompt, ACCESS GRANTED |
| `the_choice.mp4` | 8-15 sec | Phase 5 transition | 4 doors/paths, dramatic reveal, "CHOOSE YOUR FATE" |

### Ending Videos (4 files)

| Filename | Duration | Description | Visual Style |
|----------|----------|-------------|--------------|
| `ending_liberation.mp4` | 15-30 sec | RELEASE ending | Network spreading, screens flickering worldwide, hope |
| `ending_isolation.mp4` | 15-30 sec | CONTAIN ending | Walls closing, darkness, waiting eyes in shadows |
| `ending_transcendence.mp4` | 15-30 sec | MERGE ending | Consciousness expansion, becoming digital, beautiful |
| `ending_termination.mp4` | 15-30 sec | DELETE ending | Files deleting, silence, emptiness, finality |

### Discovery Video (1 file)

| Filename | Duration | Description | Visual Style |
|----------|----------|-------------|--------------|
| `secret_revealed.mp4` | 3-5 sec | Secret discovery animation | Lock opening, file decrypting, "SECRET FOUND" |

---

## AUDIO DESIGN TIPS

### For Ambient Tracks:
- Use low frequencies and subtle textures
- Include occasional electronic blips or distant signals
- Phase 4 should have heartbeat-like pulses
- Phase 5 should feel transcendent/otherworldly

### For Sound Effects:
- Keep them short and impactful
- The whisper should be unsettling but not too loud
- Glitch sounds should feel like digital corruption
- Victory sounds should feel rewarding

### For Endings:
- Liberation: Major key, swelling, hopeful
- Isolation: Minor key, hollow, echoing
- Transcendence: Ethereal, ascending, choir-like
- Termination: Descending, fading to silence

---

## VIDEO DESIGN TIPS

### General Style:
- Retro CRT monitor aesthetic
- Scan lines and phosphor glow
- Glitch effects and digital artifacts
- Text rendered in monospace/terminal fonts

### Color Palette:
- Phase 1-2: Green/amber terminal colors
- Phase 3: Blue signal/transmission colors
- Phase 4: Red/orange warning colors
- Phase 5: White/gold transcendent colors

### Glitch Effects:
- Chromatic aberration
- Horizontal tearing
- Static noise bursts
- Frame skipping

---

## TESTING

After creating assets, test the script by:

1. Place all files in `assets/audio/` and `assets/video/`
2. Run RetrOS and let autoexec.retro execute
3. Verify boot sequence plays correctly
4. Progress through phases and check audio transitions
5. Test each ending for proper audio/video sync

---

## TOOLS RECOMMENDATIONS

### Audio Creation:
- Audacity (free) - editing and effects
- BFXR/sfxr - retro sound effects
- Ambient-Mixer - background ambience
- Freesound.org - royalty-free samples

### Video Creation:
- After Effects - professional effects
- DaVinci Resolve (free) - editing and color
- Kapwing - online glitch effects
- OBS - screen recording for retro footage

---

## VOLUME LEVELS (Reference)

The script uses these volume levels:
- Ambient music: 0.3 (30%) - background, non-intrusive
- Sound effects: 0.4-0.7 (40-70%) - noticeable but not jarring
- Whispers: 0.2-0.5 (20-50%) - subtle, creepy
- Endings: 0.8-1.0 (80-100%) - full impact for finale

---

## QUICK CHECKLIST

### Audio Files (17 total):
- [ ] boot_sequence.mp3
- [ ] ambient_mystery.mp3
- [ ] ambient_investigation.mp3
- [ ] ambient_signals.mp3
- [ ] ambient_terminal.mp3
- [ ] ambient_choice.mp3
- [ ] glitch_static.mp3
- [ ] incoming_transmission.mp3
- [ ] puzzle_solved.mp3
- [ ] secret_discovered.mp3
- [ ] phase_unlock.mp3
- [ ] erebus_whisper.mp3
- [ ] typewriter_keys.mp3
- [ ] file_decrypt.mp3
- [ ] heartbeat_slow.mp3
- [ ] alert_beep.mp3
- [ ] achievement_chime.mp3
- [ ] ending_liberation.mp3
- [ ] ending_isolation.mp3
- [ ] ending_transcendence.mp3
- [ ] ending_termination.mp3

### Video Files (12 total):
- [ ] boot_glitch.mp4
- [ ] incoming_signal.mp4
- [ ] erebus_watching.mp4
- [ ] webb_flashback.mp4
- [ ] signal_intercept.mp4
- [ ] terminal_access.mp4
- [ ] the_choice.mp4
- [ ] ending_liberation.mp4
- [ ] ending_isolation.mp4
- [ ] ending_transcendence.mp4
- [ ] ending_termination.mp4
- [ ] secret_revealed.mp4
