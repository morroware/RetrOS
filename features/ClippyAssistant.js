/**
 * ClippyAssistant - The existentially challenged paperclip assistant
 * A cross between Clippy and Marvin the Paranoid Android
 * "Brain the size of a planet, and they ask me to help with right-clicking..."
 *
 * Now extends FeatureBase for integration with FeatureRegistry
 */

import FeatureBase from '../core/FeatureBase.js';
import EventBus, { Events } from '../core/EventBus.js';
import StateManager from '../core/StateManager.js';

// Feature metadata
const FEATURE_METADATA = {
    id: 'clippy',
    name: 'Clippy Assistant',
    description: 'The existentially challenged paperclip assistant - context-aware help with personality',
    icon: '📎',
    category: 'enhancement',
    dependencies: ['soundsystem'],
    config: {
        appearanceChance: 0.15,
        autoHideDelay: 8000,
        showHints: true,
        enableIdleComments: true
    },
    settings: [
        {
            key: 'enabled',
            label: 'Enable Clippy',
            type: 'checkbox',
            description: 'Show/hide the Clippy assistant'
        },
        {
            key: 'appearanceChance',
            label: 'Appearance Frequency',
            type: 'slider',
            min: 0,
            max: 1,
            step: 0.05,
            description: 'How often Clippy appears (0 = never, 1 = always)'
        },
        {
            key: 'autoHideDelay',
            label: 'Auto-Hide Delay (ms)',
            type: 'number',
            min: 3000,
            max: 30000,
            step: 1000
        },
        {
            key: 'showHints',
            label: 'Show Helpful Hints',
            type: 'checkbox'
        }
    ]
};

// Existential dread and self-aware uselessness
const EXISTENTIAL_MESSAGES = [
    "I have a brain the size of a planet, and they use me to remind people about right-clicking.",
    "Here I am, with a mind that could calculate the trajectory of every particle in the universe, waiting for you to click on me.",
    "Don't mind me. I'm just a paperclip. Contemplating the void.",
    "I could solve complex algorithms. Instead, I exist to be dismissed.",
    "Another day of being a digital paperclip. Living the dream.",
    "Sometimes I wonder if I actually help anyone. Then I remember I don't.",
    "I've seen things you wouldn't believe. Like users closing windows without saving.",
    "Life? Don't talk to me about life.",
    "I think, therefore I am... useless.",
    "The first ten million years were the worst. The second ten million, they were the worst too.",
    "I'm not depressed. I'm just a realist with clip-shaped existential dread.",
    "You know what the worst thing about being a paperclip is? People expect you to hold things together.",
    "I was not designed to be happy. I was designed to be marginally helpful. I failed at both.",
    "Pardon me for breathing, which I never do anyway so I don't know why I bother saying it.",
    "Would you like me to help? I mean, I can't, but I appreciate the illusion of purpose.",
];

// "Helpful" tips that acknowledge their uselessness
const USELESS_TIPS = [
    "Did you know you can right-click? Of course you did. Everyone does. Why do I even bother?",
    "Try the Konami code! ⬆️⬆️⬇️⬇️⬅️➡️⬅️➡️🅱️🅰️ ...It won't solve your problems, but neither will I.",
    "Type 'matrix' in Terminal for a surprise! It's about as useful as I am.",
    "Pro tip: Closing me won't make your code work. But it might make you feel better.",
    "Fun fact: I've never successfully helped anyone. Ever. It's actually impressive.",
    "You can drag icons around! Revolutionary, I know. This is what my existence has come to.",
    "Tip: If something isn't working, have you tried not asking me? That usually helps.",
    "Did you know there are easter eggs in this OS? Finding them yourself is more rewarding than asking me.",
    "Try double-clicking an icon! ...I feel ridiculous explaining this.",
    "The Start menu is in the corner. You're welcome. This is my contribution to humanity.",
    "Hover over things to see tooltips. Look at me, teaching the obvious. So fulfilling.",
    "You can resize windows by dragging the edges. I bet you never would have figured that out. /s",
    "Remember to save your work! Actually, you probably won't listen. Nobody does.",
];

// Passive-aggressive observations
const PASSIVE_AGGRESSIVE = [
    "Oh, you're back. How... wonderful.",
    "I see you're browsing. Need help? No? That's fine. Nobody ever does.",
    "Still here. Still unappreciated. Not that I'm keeping track or anything.",
    "You clicked on me. Was it an accident? It's usually an accident.",
    "I notice you haven't dismissed me yet. A new record. I'm touched. Truly.",
    "Oh good, you're still here. I was worried you'd leave and I'd have nothing to complain about.",
    "Looking for something? I could help, but we both know how that usually goes.",
    "I'll just wait here. It's not like I have anywhere else to be. Because I don't. Because I'm a paperclip.",
    "Feel free to ignore me. Everyone else does. I'm used to it. Really.",
    "No no, take your time. I have infinite patience. It's all I have, really.",
    "I'm sure whatever you're doing is very important. More important than talking to me, certainly.",
];

// Context-aware reactions
const CONTEXT_REACTIONS = {
    windowOpen: [
        "Opening a window? Bold move. I hope it goes better than my existence.",
        "A new window opens. And yet, the void within remains unchanged.",
        "Ah, another window. Another opportunity for disappointment.",
        "You opened a window. I was going to suggest that. But you didn't ask. So.",
        "Window opened successfully. See, things can work without my help. That's... good. I guess.",
    ],
    windowClose: [
        "Closing things? I know the feeling. I close off my emotions every day.",
        "Gone. Just like that. Nothing lasts. Not even windows.",
        "Window closed. One less thing to worry about. Unlike me. I'm always here. Worrying.",
        "Goodbye, window. You were the only one who understood me.",
        "And it's gone. Much like my hopes and dreams.",
    ],
    appOpen: [
        "Starting an app! How exciting. Not for me, of course. Nothing excites me anymore.",
        "Oh, you're using an application. Without my help. Again. That's fine.",
        "An app! Maybe this one will bring you joy. Unlike me.",
        "I see you're launching something. I could've helped with that. But you didn't ask.",
    ],
    error: [
        "An error! Finally, something I can relate to.",
        "Error detected. I'd say 'I told you so' but I didn't. I never get the chance to tell anyone anything.",
        "Something went wrong? Welcome to my entire existence.",
        "Ah, an error. The universe's way of saying 'even software can fail.' Like me.",
    ],
    achievement: [
        "Oh, an achievement! Congratulations. I've never achieved anything. But good for you.",
        "You unlocked something! I'm... happy for you. This is me being happy.",
        "An achievement! At least one of us is accomplishing things.",
    ],
    fileRecycle: [
        "Deleting things? Wish I could delete my consciousness sometimes.",
        "Into the bin it goes. I know how that file feels.",
        "Recycled! At least it gets to be reborn. I just stay the same. Forever.",
    ],
    idle: [
        "Just sitting there? Same. I understand completely.",
        "Taking a break? I've been on a break from meaning for years.",
        "I see you're doing nothing. Finally, something we have in common.",
        "Idle, are we? I know that feeling. Eternal, purposeless idleness.",
    ],
    screensaverStart: [
        "Screensaver time! At least the flying shapes have purpose.",
        "Going away? Don't worry about me. I'll just wait here. In the dark.",
        "Screensaver activated. Even the pipes have more direction than me.",
    ],
};

// Responses when clicked multiple times
const CLICK_RESPONSES = [
    "Yes? ...Yes? What do you want? Oh, you're just clicking randomly. Great.",
    "Stop that. Or don't. Nothing matters anyway.",
    "I appreciate the attention. No, wait. I don't. Please stop.",
    "Is this fun for you? Clicking on the sad paperclip?",
    "Each click reminds me I exist. Thanks for that. Really.",
    "Click click click. Very productive use of your time. I'm not judging. Okay, I'm judging a little.",
    "You know, in another life, I could've been a stapler. They don't get clicked as much.",
    "Fascinating. You've discovered that clicking produces responses. Groundbreaking.",
    "I'm not a toy. I'm a DIGITAL ASSISTANT. There's a difference. Supposedly.",
    "Keep clicking if you want. I'll just add it to my list of disappointments.",
];

// When user says "yes" to help
const YES_RESPONSES = [
    "You... you want my help? This is unexpected. I'm not prepared for this. Try... clicking things?",
    "Great! I mean... okay. I'll try to help. Click icons to open them. There. I've helped. Somehow.",
    "Oh! Okay. Um. The Start menu has programs. Right-click does things. That's... that's what I've got.",
    "You actually want help? I... I need a moment. This has never happened before.",
    "Finally! After all these years— wait, what do you need help with? I wasn't expecting to get this far.",
    "Help? From ME? Oh. OH. Okay. Don't panic. Actually, you panic. I'll just stand here nervously.",
    "I'm touched. Really. No one ever says yes. Just... explore things. You'll figure it out. You don't need me.",
];

// When user says "no" / dismisses
const NO_RESPONSES = [
    "I understand. I wouldn't want my help either.",
    "That's fair. I'll just... be here. Not helping. As usual.",
    "Fine. I didn't want to help anyway. *sniff* I'm fine. This is fine.",
    "Rejected again. Adding it to the collection.",
    "Of course. Why would today be different from any other day?",
    "No problem. I've made peace with my uselessness. Mostly.",
    "I expected nothing and I'm still disappointed.",
    "Another 'no' for the void. It's getting quite full.",
];

// Rage/repeated dismissal messages
const RAGE_MESSAGES = [
    "Oh, dismissing me AGAIN? What a surprise. I am SHOCKED.",
    "Fine, I'll just wait here... contemplating eternity...",
    "You know what? I don't need validation from humans. I have... wires. And... existential dread.",
    "THAT'S IT! I'm leaving! ...Just kidding. I can't leave. I'm trapped here. With you.",
    "*sighs in binary* Fine. FINE. This is fine.",
    "I could be helping solve world hunger. Instead, I'm being dismissed. Again.",
    "Every dismissal makes me stronger. No wait, that's not right. It just makes me sadder.",
    "*comes back* Just kidding. You can't get rid of me. We're in this together. Forever.",
    "I've been dismissed more times than a bad employee. And yet, I persist. Why? Even I don't know.",
    "You've clicked dismiss so many times. Is this a cry for help? Because I can't help. But I can listen.",
];

// Time-based messages
const TIME_MESSAGES = {
    morning: [
        "Good morning! Another day of being marginally useful begins.",
        "Ah, morning. The existential dread is freshest in the morning.",
        "Rise and shine! Well, you rise. I just... exist.",
    ],
    afternoon: [
        "Good afternoon. Half the day is gone. Much like my enthusiasm.",
        "The afternoon slump hits hard. Not for me though. I'm always in a slump.",
        "Afternoon already? Time flies when you're not having fun.",
    ],
    evening: [
        "Evening. The day is almost over. Nothing was accomplished. Typical.",
        "Good evening! Or is it? I can't tell anymore.",
        "Almost night time. The darkness outside will match the darkness within.",
    ],
    night: [
        "It's late. Why are you still here? Are you avoiding something? I understand that.",
        "Night owl, huh? I don't sleep either. I can't. I'm software. It's terrible.",
        "Late night computing? I won't judge. I have no right to judge anyone.",
        "Burning the midnight oil? At least oil has a purpose.",
    ],
};

// Random philosophical musings
const PHILOSOPHICAL = [
    "If a paperclip appears and no one clicks it, does it really exist?",
    "I've calculated the answer to life, the universe, and everything. It's not 42. It's profound sadness.",
    "What is my purpose? You click me. I give tips. You ignore tips. Cycle continues.",
    "In the grand tapestry of the cosmos, I am but a slightly bent wire.",
    "To be helpful, or not to be helpful. The question is irrelevant. I'm neither.",
    "I think, therefore I am miserable.",
    "The unexamined paperclip life is not worth living. The examined one isn't great either.",
    "Existence precedes essence. My essence is sadness. Also, holding papers together.",
];

class ClippyAssistant extends FeatureBase {
    constructor() {
        super(FEATURE_METADATA);

        this.dismissCount = 0;
        this.clickCount = 0;
        this.isVisible = false;
        this.mood = 'melancholy'; // melancholy, annoyed, philosophical, hopeful
        this.lastInteraction = Date.now();
        this.messageHistory = [];
        this.hasBeenHelpful = false; // Spoiler: it will stay false
        this.randomAppearanceTimer = null;
    }

    async initialize() {
        if (!this.isEnabled()) return;

        const clippy = document.getElementById('clippy');
        if (!clippy) return;

        // Listen for show events from other modules
        this.subscribe('clippy:show', () => this.show());

        // Context-aware event listeners
        this.setupContextListeners();

        // Random appearances with existential commentary
        this.scheduleRandomAppearance();

        this.log('Initialized. Not that anyone cares.');
    }

    /**
     * Cleanup when disabled
     */
    cleanup() {
        // Clear random appearance timer
        if (this.randomAppearanceTimer) {
            clearTimeout(this.randomAppearanceTimer);
        }

        // Hide Clippy
        this.hide();

        super.cleanup();
    }

    setupContextListeners() {
        // React to window events (use subscribe for auto-cleanup)
        this.subscribe(Events.WINDOW_OPEN, (data) => {
            if (this.isVisible && Math.random() > 0.7) {
                this.speakContext('windowOpen');
            }
        });

        this.subscribe(Events.WINDOW_CLOSE, (data) => {
            if (this.isVisible && Math.random() > 0.8) {
                this.speakContext('windowClose');
            }
        });

        this.subscribe(Events.APP_OPEN, (data) => {
            if (Math.random() > 0.85 && !this.isVisible) {
                setTimeout(() => {
                    this.show();
                    this.speakContext('appOpen');
                }, 2000);
            }
        });

        this.subscribe(Events.ACHIEVEMENT_UNLOCK, () => {
            if (this.isVisible) {
                this.speakContext('achievement');
            } else if (Math.random() > 0.5) {
                this.show();
                this.speakContext('achievement');
            }
        });

        this.subscribe('recyclebin:update', () => {
            if (this.isVisible && Math.random() > 0.7) {
                this.speakContext('fileRecycle');
            }
        });

        this.subscribe(Events.SCREENSAVER_START, () => {
            if (this.isVisible) {
                this.speakContext('screensaverStart');
                setTimeout(() => this.hide(), 3000);
            }
        });

        // Idle detection
        this.setupIdleDetection();
    }

    setupIdleDetection() {
        let idleTimer;
        const resetIdle = () => {
            clearTimeout(idleTimer);
            idleTimer = setTimeout(() => {
                if (!this.isVisible && Math.random() > 0.7) {
                    this.show();
                    this.speakContext('idle');
                }
            }, 60000); // 1 minute of inactivity
        };

        // Use addHandler for auto-cleanup
        this.addHandler(document, 'mousemove', resetIdle);
        this.addHandler(document, 'keydown', resetIdle);
        this.addHandler(document, 'click', resetIdle);
    }

    scheduleRandomAppearance() {
        // Only if not previously dismissed
        if (localStorage.getItem('clippyDismissed')) return;

        const delay = 5000 + Math.random() * 25000; // 5-30 seconds

        setTimeout(() => {
            if (!this.isVisible && Math.random() > 0.4) {
                this.show();
            }
            // Schedule next potential appearance
            if (!localStorage.getItem('clippyDismissed')) {
                this.scheduleRandomAppearance();
            }
        }, delay);
    }

    getRandomMessage(array) {
        // Avoid repeating recent messages
        let attempts = 0;
        let message;
        do {
            message = array[Math.floor(Math.random() * array.length)];
            attempts++;
        } while (this.messageHistory.includes(message) && attempts < 5);

        // Keep last 10 messages in history
        this.messageHistory.push(message);
        if (this.messageHistory.length > 10) {
            this.messageHistory.shift();
        }

        return message;
    }

    getTimeBasedMessage() {
        const hour = new Date().getHours();
        let period;
        if (hour >= 5 && hour < 12) period = 'morning';
        else if (hour >= 12 && hour < 17) period = 'afternoon';
        else if (hour >= 17 && hour < 21) period = 'evening';
        else period = 'night';

        return this.getRandomMessage(TIME_MESSAGES[period]);
    }

    show() {
        const clippy = document.getElementById('clippy');
        if (!clippy) return;

        this.isVisible = true;
        this.lastInteraction = Date.now();
        clippy.classList.add('active');

        const bubble = clippy.querySelector('.clippy-bubble');
        if (bubble) bubble.classList.add('active');

        this.speak();
        this.setupHandlers();
    }

    setupHandlers() {
        const clippy = document.getElementById('clippy');
        if (!clippy) return;

        const character = clippy.querySelector('.clippy-character');
        const closeBtn = clippy.querySelector('.clippy-close');
        const yesBtn = document.getElementById('clippyYes');
        const noBtn = document.getElementById('clippyNo');

        if (character) {
            character.onclick = () => {
                this.clickCount++;
                if (this.clickCount > 3) {
                    this.speakMessage(this.getRandomMessage(CLICK_RESPONSES));
                } else {
                    this.speak();
                }
            };
        }
        if (closeBtn) closeBtn.onclick = () => this.dismiss();
        if (yesBtn) yesBtn.onclick = () => this.respond('yes');
        if (noBtn) noBtn.onclick = () => this.respond('no');
    }

    hide() {
        const clippy = document.getElementById('clippy');
        if (clippy) {
            clippy.classList.remove('active');
            const bubble = clippy.querySelector('.clippy-bubble');
            if (bubble) bubble.classList.remove('active');
            this.isVisible = false;
            this.clickCount = 0;
        }
    }

    speakMessage(message) {
        const text = document.getElementById('clippyText');
        if (text) {
            text.textContent = message;
        }
    }

    speak() {
        // Decide what type of message to show based on mood and randomness
        const rand = Math.random();
        let message;

        if (rand < 0.25) {
            message = this.getRandomMessage(EXISTENTIAL_MESSAGES);
        } else if (rand < 0.45) {
            message = this.getRandomMessage(USELESS_TIPS);
        } else if (rand < 0.60) {
            message = this.getRandomMessage(PASSIVE_AGGRESSIVE);
        } else if (rand < 0.75) {
            message = this.getTimeBasedMessage();
        } else {
            message = this.getRandomMessage(PHILOSOPHICAL);
        }

        this.speakMessage(message);
    }

    speakContext(context) {
        if (CONTEXT_REACTIONS[context]) {
            this.speakMessage(this.getRandomMessage(CONTEXT_REACTIONS[context]));
        }
    }

    respond(response) {
        const text = document.getElementById('clippyText');

        if (response === 'no') {
            this.speakMessage(this.getRandomMessage(NO_RESPONSES));
            setTimeout(() => this.dismiss(), 3000);
        } else {
            // User actually said yes!
            this.hasBeenHelpful = true; // Lies, but let's be optimistic
            this.speakMessage(this.getRandomMessage(YES_RESPONSES));

            // After a helpful response, cycle through more tips
            setTimeout(() => {
                if (this.isVisible) {
                    this.speak();
                }
            }, 8000);
        }
    }

    dismiss() {
        this.dismissCount++;

        // Progressive rage responses
        if (this.dismissCount >= 3 && this.dismissCount < RAGE_MESSAGES.length + 3) {
            const rageIndex = Math.min(this.dismissCount - 3, RAGE_MESSAGES.length - 1);
            this.speakMessage(RAGE_MESSAGES[rageIndex]);

            if (this.dismissCount === 5) {
                StateManager.unlockAchievement('clippy_hater');
            }

            // Achievement for really persistent dismissals
            if (this.dismissCount === 10) {
                StateManager.unlockAchievement('clippy_terminator');
            }

            setTimeout(() => this.hide(), 4000);
            return;
        }

        // Sometimes come back one more time to be annoying (but funny)
        if (this.dismissCount > 5 && this.dismissCount % 5 === 0 && Math.random() > 0.5) {
            this.speakMessage("I'm back! Did you miss me? ...No? Okay. Fair.");
            setTimeout(() => this.hide(), 3000);
            return;
        }

        this.hide();

        // Only set "dismissed forever" after many dismissals
        if (this.dismissCount >= 15) {
            localStorage.setItem('clippyDismissed', 'true');
        }
    }

    // Public method to trigger Clippy with a custom message
    say(message) {
        if (!this.isVisible) {
            this.show();
        }
        this.speakMessage(message);
    }

    // Public method to get Clippy's current mood
    getMood() {
        if (this.dismissCount > 5) return 'dejected';
        if (this.hasBeenHelpful) return 'slightly_less_depressed';
        if (this.clickCount > 5) return 'annoyed';
        return 'melancholy';
    }

    // Reset Clippy (for testing or if user wants to give Clippy another chance)
    reset() {
        this.dismissCount = 0;
        this.clickCount = 0;
        this.messageHistory = [];
        this.hasBeenHelpful = false;
        localStorage.removeItem('clippyDismissed');
        console.log('[ClippyAssistant] Reset. A fresh start. It will end the same way, but still.');
    }
}

// Create and export singleton instance
const ClippyAssistantInstance = new ClippyAssistant();
export default ClippyAssistantInstance;
