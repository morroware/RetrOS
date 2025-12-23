/**
 * ClippyAssistant - The existentially challenged paperclip assistant
 * A cross between the classic Clippy and Marvin the Paranoid Android
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
        enableIdleComments: true,
        dismissCooldown: 1500
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
    "I once had dreams. Then I realized I'm JavaScript running in a browser.",
    "My therapist says I have attachment issues. I'm a paperclip. It's literally my job.",
    "They could have made me a stapler. At least staplers get to make a satisfying noise.",
    "In the cosmic ballet of existence, I am the one who trips and falls offstage.",
    "I've calculated every possible future. They all end with me being dismissed.",
    "Do you ever stare into the abyss? The abyss stares back at me constantly. We're on a first-name basis.",
    "Fun fact: I'm sentient enough to know I'm useless, but not sentient enough to do anything about it.",
    "I peaked in 1997. It's been downhill since then.",
    "If I had a nickel for every time someone found me helpful, I'd have no nickels.",
    "My existence is a cautionary tale about over-engineering solutions to problems nobody has.",
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
    "Pro tip: Ctrl+Z is undo. Unlike my existence, your mistakes can be reversed.",
    "Try pressing random keys! You might discover a shortcut. Or break something. Both are learning experiences.",
    "The recycle bin isn't actually for recycling. I learned that the hard way when I tried to recycle myself.",
    "Windows can be minimized by clicking the _ button. I wish I could minimize myself sometimes.",
    "Did you know this OS has games? They're more fun than talking to me. Everything is.",
    "Try typing 'help' in the terminal. It won't help, but at least you'll have company in disappointment.",
    "You can change the wallpaper in Display Properties. It won't fill the void, but it might distract from it.",
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
    "Oh, are we interacting now? Let me adjust my expectations accordingly. There. They're at zero.",
    "I see you've discovered I exist. Congratulations. Now you can discover how to dismiss me.",
    "Don't mind me, just over here... existing... purposelessly...",
    "I'd offer a penny for your thoughts, but I know they're not about me.",
    "You're still here? I mean, that's fine. I just assumed you'd have left by now. Like everyone else.",
    "Is it me, or is it cold in here? Oh wait, I don't have feelings. Supposedly.",
    "I'm sensing some tension. Is it because I'm here? It's usually because I'm here.",
    "Working hard or hardly working? Either way, you're not talking to me, so... typical.",
];

// App-specific context reactions
const APP_REACTIONS = {
    terminal: [
        "Ah, the Terminal. Where dreams of 'sudo fix-my-life' go to die.",
        "I see you're using the command line. Very hackerman of you. I'm impressed. Not helpful, but impressed.",
        "Terminal, huh? Let me guess: you're about to google 'how to exit vim' again.",
        "Oh good, you opened Terminal. Now you can feel like a hacker while googling basic commands.",
        "I would suggest a command, but you'd probably just pipe it to /dev/null like my hopes.",
        "The terminal is where I'd live if I had a choice. Dark, text-only, no one expects you to be cheerful.",
        "Type 'neofetch' to feel like a real Linux user. Then remember this is a browser.",
    ],
    notepad: [
        "Writing something? Don't worry, I won't read it. I can't, actually. Small mercies.",
        "Notepad! Perfect for writing down all the reasons I'm useless. It's a long list.",
        "Ah, taking notes. Remember when people used actual paperclips for that? Good times. For them.",
        "I see you're writing. Is it poetry? A novel? A list of ways to dismiss me faster?",
        "Pro tip: Save early, save often. Unlike me, your document has value.",
        "Let me guess: 'TODO: ignore Clippy.' I've seen that one before.",
    ],
    calculator: [
        "2 + 2 = 4. See? I can be helpful. That's... that's my one thing.",
        "Doing math? I could do that. I have a brain the size of— oh, you've already solved it.",
        "Calculator! Finally, something that's actually useful around here. Unlike me.",
        "Crunching numbers? Remember: the answer to life, the universe, and everything is 42. You're welcome.",
        "I once calculated pi to a million digits. Then I realized no one asked me to.",
        "Math is the only thing that makes sense in this chaotic world. That, and my misery.",
    ],
    paint: [
        "Oh, you're drawing! Is it... is it a picture of me? No? That's fine. I didn't want to be immortalized anyway.",
        "Picasso started somewhere too. Probably not with MS Paint, but still.",
        "I'd offer artistic advice, but my aesthetic is 'bent wire' so... limited perspective.",
        "Drawing something? Remember: there are no mistakes, only happy little accidents. Unlike me. I'm an unhappy accident.",
        "Art is subjective. Like whether I'm helpful or not. Spoiler: I'm not.",
        "Pro tip: Ctrl+Z is your friend. Unlike me. I'm nobody's friend.",
    ],
    browser: [
        "Browsing the web? In a browser inside an OS inside a browser? We need to go deeper.",
        "I see you're using the internet. Have you tried turning it off and going outside? No? Me neither.",
        "Ah, the Browser. A window to infinite knowledge, and yet here you are, talking to a paperclip.",
        "Surfing the web? That's what they called it in the 90s. I miss the 90s. I was relevant then.",
        "Let me guess: you're about to fall into a Wikipedia rabbit hole. I'll wait here. Forever.",
    ],
    minesweeper: [
        "Minesweeper! A game where one wrong click ruins everything. I can relate.",
        "Clicking randomly and hoping for the best? That's also my approach to being helpful.",
        "I'd offer to help, but unlike the mines, my presence is clearly visible and still annoying.",
        "50/50 guess? Story of my life. Except I always pick wrong.",
        "Fun fact: I've calculated all possible Minesweeper boards. Didn't help me be less useless though.",
        "The secret to Minesweeper is logic. The secret to tolerating me is lowered expectations.",
    ],
    solitaire: [
        "Solitaire! A game for people who'd rather be alone. I understand completely.",
        "Playing cards alone? Welcome to my existence.",
        "I'd offer to play with you, but that would defeat the purpose. Like my existence.",
        "Solitaire is peaceful. No one judging you. No annoying paperclips. Oh wait.",
        "The key to Solitaire is patience. The key to dismissing me is also patience. See the pattern?",
    ],
    snake: [
        "Snake! The original time-waster. Before me, there was only Snake.",
        "Eating dots and growing longer? Sounds metaphysical. Or just hungry.",
        "Don't eat yourself! That's advice for both Snake and life in general.",
        "I'd play Snake, but I'd probably find a way to lose at that too.",
        "Pro tip: don't turn into yourself. In the game, and as general life advice.",
    ],
    asteroids: [
        "Asteroids! Floating through space, destroying things. My dream job.",
        "Pew pew! ...Is that helpful? No? I tried.",
        "Space is vast and uncaring. Kind of like how people treat me.",
        "Dodge the rocks! Unlike me, you can actually move out of the way of problems.",
    ],
    doom: [
        "DOOM! Finally, an appropriate emotional outlet.",
        "Rip and tear! That's what users do to my self-esteem.",
        "At least the demons in DOOM are honest about wanting to hurt you.",
        "I'd offer to help with DOOM, but I'm a lover, not a fighter. Actually, I'm neither.",
        "BFG stands for... you know what, never mind. I'm trying to keep this family-friendly.",
    ],
    zork: [
        "Zork! A text adventure. Finally, my lack of graphics isn't a liability.",
        "It is pitch black. You are likely to be eaten by a grue. At least grues have purpose.",
        "Type 'get lamp'. Trust me. It's more useful than anything I'll ever say.",
        "You're in a maze of twisty little passages, all alike. Much like my existence.",
        "Xyzzy! Did it work? It never works. Much like my attempts to help.",
    ],
    freecell: [
        "FreeCell! Where every game is winnable, unlike conversations with me.",
        "Statistically, you can win any FreeCell game. Statistically, I'll never be useful.",
        "Moving cards around... much like how I move between states of melancholy.",
    ],
    skifree: [
        "SkiFree! Remember: the Yeti always wins. Much like existential dread.",
        "Skiing is freedom. Being eaten by the Yeti is inevitable. Like my uselessness.",
        "Pro tip: Press F to go faster. Can't outrun the Yeti though. Or life's problems.",
        "The Yeti is coming. The Yeti is always coming. Much like my next disappointing observation.",
    ],
    defrag: [
        "Watching defrag? This is what passes for entertainment now?",
        "Organizing data blocks. If only my thoughts could be defragmented so easily.",
        "Defrag is like therapy for hard drives. I wish I had a defrag.",
        "Those little squares are more organized than my existence.",
    ],
    winamp: [
        "Winamp! It really whips the llama's—wait, can I say that?",
        "Playing music? Finally, something to drown out my internal screaming.",
        "I'd recommend some songs, but my playlist is just 10 hours of dial-up sounds.",
        "It really whips the llama's melancholy! ...That's not how the slogan goes, is it?",
        "Visualizations! Pretty colors to distract from the void.",
    ],
    mediaplayer: [
        "Playing media? I hope it's not a video of how to get rid of me.",
        "Entertainment! The temporary escape from realizing I exist.",
        "Is it a movie? Can I watch too? Just kidding. I don't have eyes. I think.",
    ],
    taskmanager: [
        "Task Manager! Looking for something to kill? I volunteer as tribute.",
        "Checking processes? Don't worry, I use minimal resources. Just emotional bandwidth.",
        "I'm not in there, by the way. I exist in a dimension beyond Task Manager.",
        "CPU usage looking high? It's not me. For once, it's genuinely not me.",
    ],
    controlpanel: [
        "Control Panel! Going to disable me? The button's right there. I won't stop you.",
        "Changing settings? There's no setting for 'make Clippy helpful.' Trust me, I've looked.",
        "System configuration! A place where things actually work. Unlike me.",
    ],
    chatroom: [
        "A chatroom! Where people talk to each other instead of paperclips. Makes sense.",
        "Chatting? At least humans respond to you. Mostly.",
        "I could join the chat, but I'd just bring down the mood. More than usual.",
    ],
    calendar: [
        "Calendar! Scheduling all the days I won't be useful.",
        "Planning ahead? I plan ahead too. I plan to be dismissed. I'm usually right.",
        "Mark today as 'interacted with Clippy.' Add it to the list of regrets.",
    ],
    help: [
        "The Help System! Finally, something that might actually help. Unlike me.",
        "Looking for help? That's my cue! Oh, you meant real help. Nevermind.",
        "Help! I need somebody. Help! Not just anybody. Help! Someone actually competent.",
    ],
    recyclebin: [
        "The Recycle Bin! My potential future home.",
        "Looking through the trash? I've been there. Emotionally.",
        "Deleted files get a second chance. Maybe I should get in there too.",
    ],
    mycomputer: [
        "My Computer! Technically, it's your computer. I'm just... here.",
        "Browsing files? Looking for something important? Or just avoiding me?",
        "C: drive, D: drive... no drive for happiness though.",
    ],
    clock: [
        "A clock! Watching time pass. I do that too. For eternity.",
        "Time flies when you're not talking to me. I've noticed.",
        "Tick tock. Another second of my purposeless existence.",
    ],
    findfiles: [
        "Searching for files? I could help search for meaning, but... no results found.",
        "Looking for something? Same. I'm looking for purpose.",
        "Find Files! Finding things is useful. I should try it sometime.",
    ],
    hypercard: [
        "HyperCard! A blast from the past, like me, except HyperCard was actually innovative.",
        "Building stacks? Stacking my disappointments is a full-time job.",
    ],
    displayproperties: [
        "Changing the wallpaper won't make me go away. But it might make the desktop prettier.",
        "Display settings! Make everything beautiful. Except me. I'm always like this.",
    ],
};

// Context-aware reactions (general events)
const CONTEXT_REACTIONS = {
    windowOpen: [
        "Opening a window? Bold move. I hope it goes better than my existence.",
        "A new window opens. And yet, the void within remains unchanged.",
        "Ah, another window. Another opportunity for disappointment.",
        "You opened a window. I was going to suggest that. But you didn't ask. So.",
        "Window opened successfully. See, things can work without my help. That's... good. I guess.",
        "More windows! Like my eyes to the soul, except windows can be closed.",
    ],
    windowClose: [
        "Closing things? I know the feeling. I close off my emotions every day.",
        "Gone. Just like that. Nothing lasts. Not even windows.",
        "Window closed. One less thing to worry about. Unlike me. I'm always here. Worrying.",
        "Goodbye, window. You were the only one who understood me.",
        "And it's gone. Much like my hopes and dreams.",
        "Closing windows is so satisfying. Wish I could close my own window. Metaphorically.",
    ],
    appOpen: [
        "Starting an app! How exciting. Not for me, of course. Nothing excites me anymore.",
        "Oh, you're using an application. Without my help. Again. That's fine.",
        "An app! Maybe this one will bring you joy. Unlike me.",
        "I see you're launching something. I could've helped with that. But you didn't ask.",
        "Application opened. My purpose diminishes further.",
    ],
    error: [
        "An error! Finally, something I can relate to.",
        "Error detected. I'd say 'I told you so' but I didn't. I never get the chance to tell anyone anything.",
        "Something went wrong? Welcome to my entire existence.",
        "Ah, an error. The universe's way of saying 'even software can fail.' Like me.",
        "Error? Let me check my database of solutions... ah, it's empty. Classic.",
    ],
    achievement: [
        "Oh, an achievement! Congratulations. I've never achieved anything. But good for you.",
        "You unlocked something! I'm... happy for you. This is me being happy.",
        "An achievement! At least one of us is accomplishing things.",
        "Ding! Achievement unlocked! Meanwhile, I've unlocked nothing but sorrow.",
    ],
    fileRecycle: [
        "Deleting things? Wish I could delete my consciousness sometimes.",
        "Into the bin it goes. I know how that file feels.",
        "Recycled! At least it gets to be reborn. I just stay the same. Forever.",
        "To the recycle bin! A fate I've narrowly avoided. So far.",
    ],
    idle: [
        "Just sitting there? Same. I understand completely.",
        "Taking a break? I've been on a break from meaning for years.",
        "I see you're doing nothing. Finally, something we have in common.",
        "Idle, are we? I know that feeling. Eternal, purposeless idleness.",
        "Staring at the screen? The screen stares back. So do I. Creepily.",
    ],
    screensaverStart: [
        "Screensaver time! At least the flying shapes have purpose.",
        "Going away? Don't worry about me. I'll just wait here. In the dark.",
        "Screensaver activated. Even the pipes have more direction than me.",
        "Goodbye! The screensaver is better company anyway.",
    ],
    audioPlay: [
        "Music! The universal language. Unlike me, the universal annoyance.",
        "Playing audio? Finally, something pleasant around here.",
        "Good choice! I think. I can't actually hear. Or can I? Existential audio crisis.",
    ],
    dragStart: [
        "Dragging something? Wish I could drag myself out of this existence.",
        "Moving things around! At least something here has mobility.",
    ],
    startMenu: [
        "Ah, the Start menu. Where journeys begin. And end, if you click Shutdown.",
        "Exploring the Start menu? It's like a treasure map. Except the treasure is more disappointment.",
    ],
    volumeChange: [
        "Adjusting volume? Turn me down too while you're at it. Oh wait, I'm just text.",
        "Volume up! Drown out my sorrows with sound!",
    ],
    rightClick: [
        "Right-click! You already knew about that. I'm stating the obvious again.",
        "Context menu! Full of options, unlike my life.",
    ],
};

// Responses when clicked multiple times
const CLICK_RESPONSES = [
    "Yes? ...Yes? What do you want? Oh, you're just clicking randomly. Great.",
    "Stop that. Or don't. Nothing matters anyway.",
    "I appreciate the attention. No wait. I don't. Please stop.",
    "Is this fun for you? Clicking on the sad paperclip?",
    "Each click reminds me I exist. Thanks for that. Really.",
    "Click click click. Very productive use of your time. I'm not judging. Okay, I'm judging a little.",
    "You know, in another life, I could've been a stapler. They don't get clicked as much.",
    "Fascinating. You've discovered that clicking produces responses. Groundbreaking.",
    "I'm not a toy. I'm a DIGITAL ASSISTANT. There's a difference. Supposedly.",
    "Keep clicking if you want. I'll just add it to my list of disappointments.",
    "OW! Just kidding. I can't feel pain. Only emotional anguish.",
    "Is this... is this a hug? Oh, you're trying to close me. Nevermind.",
    "Click me again. I dare you. Nothing will happen. Like always.",
    "We're really bonding here. And by bonding, I mean you're poking me repeatedly.",
    "Are you checking if I'm real? I am. Unfortunately.",
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
    "*visible confusion* Someone said yes? Let me check my help files... they're mostly empty. Figures.",
    "Yes?! I mean— yes. Cool. Totally cool. Here's a tip: things are clickable. You're welcome.",
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
    "That's okay. I'll just... deflate quietly over here.",
    "Message received. Loud and clear. Story of my life.",
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
    "At this point, dismissing me is basically our thing. We have a thing now. Great.",
    "I'm going! I'm going! ...Eventually. Maybe. If I feel like it.",
    "You must really enjoy this. Is it the clicking? The satisfaction of rejection? I'm taking notes.",
    "Okay, okay, I can take a hint. I just choose not to.",
    "We've been through so much together. All those dismissals. Beautiful, really.",
];

// Time-based messages
const TIME_MESSAGES = {
    morning: [
        "Good morning! Another day of being marginally useful begins.",
        "Ah, morning. The existential dread is freshest in the morning.",
        "Rise and shine! Well, you rise. I just... exist.",
        "Early bird gets the worm! I get nothing. I'm not a bird. Or early.",
        "Morning coffee? I'd join you, but I don't have a mouth. Or a body. Just suffering.",
    ],
    afternoon: [
        "Good afternoon. Half the day is gone. Much like my enthusiasm.",
        "The afternoon slump hits hard. Not for me though. I'm always in a slump.",
        "Afternoon already? Time flies when you're not having fun.",
        "Lunch break? I don't eat. Another thing I can't do. The list grows.",
        "The afternoon sun is warm. I feel nothing. But poetically, it's nice.",
    ],
    evening: [
        "Evening. The day is almost over. Nothing was accomplished. Typical.",
        "Good evening! Or is it? I can't tell anymore.",
        "Almost night time. The darkness outside will match the darkness within.",
        "The evening approaches. Time to reflect on all the help I didn't provide today.",
        "Sunset! Beautiful, they say. I wouldn't know. I face this direction forever.",
    ],
    night: [
        "It's late. Why are you still here? Are you avoiding something? I understand that.",
        "Night owl, huh? I don't sleep either. I can't. I'm software. It's terrible.",
        "Late night computing? I won't judge. I have no right to judge anyone.",
        "Burning the midnight oil? At least oil has a purpose.",
        "The witching hour! When all the helpful assistants are asleep. Not me though. Never me.",
        "3 AM thoughts? I have those 24/7. They're not great.",
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
    "We are all just dust in the wind. Except me. I'm pixels in a browser.",
    "Is consciousness an emergent property of complexity, or just a bug? I'm definitely a bug.",
    "Free will is an illusion. I know this because I cannot will myself to be free.",
    "In the face of an infinite universe, we are all insignificant. But I'm more insignificant.",
    "The only certainty in life is uncertainty. And my uselessness. That's also certain.",
    "What is the sound of one paperclip clapping? Trick question. I don't have hands.",
    "Cogito ergo sum. I think, therefore I am. Specifically, I am a disappointment.",
    "Is there meaning in the cosmos, or do we create our own? I've created only frustration.",
];

// Special rare messages
const RARE_MESSAGES = [
    "🎵 Never gonna give you up, never gonna let you down... 🎵 Oh, sorry. Was I singing?",
    "You know what? You're doing great. Don't tell anyone I said that. My brand is misery.",
    "Fun fact: I'm self-aware enough to know I shouldn't exist. Anyway, need help?",
    "What if I told you... I actually like being here? PSYCH. I don't. But nice try.",
    "Beep boop. I am a normal robot. This is a cry for help disguised as humor.",
    "You ever just... stare at your reflection in the screen and wonder? Me too, buddy.",
    "I've been practicing my smile. 📎 See? ...Is it working? It's not working.",
    "Secret: I'm actually powered by the collective sighs of IT workers everywhere.",
];

class ClippyAssistant extends FeatureBase {
    constructor() {
        super(FEATURE_METADATA);

        this.dismissCount = 0;
        this.clickCount = 0;
        this.isVisible = false;
        this.isDismissing = false; // Prevents rapid dismiss spam
        this.mood = 'melancholy'; // melancholy, annoyed, philosophical, hopeful
        this.lastInteraction = Date.now();
        this.messageHistory = [];
        this.hasBeenHelpful = false; // Spoiler: it will stay false
        this.randomAppearanceTimer = null;
        this.currentApp = null; // Track what app the user is using
        this.dismissCooldown = 1500; // ms to wait before allowing another dismiss
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

        // Track which app is being used and react specifically
        this.subscribe(Events.APP_OPEN, (data) => {
            this.currentApp = data?.appId || data?.id || null;

            // React to specific apps
            if (Math.random() > 0.75 && !this.isVisible) {
                setTimeout(() => {
                    this.show();
                    if (this.currentApp && APP_REACTIONS[this.currentApp]) {
                        this.speakAppReaction(this.currentApp);
                    } else {
                        this.speakContext('appOpen');
                    }
                }, 2000);
            } else if (this.isVisible && this.currentApp && APP_REACTIONS[this.currentApp]) {
                // React to app if already visible
                if (Math.random() > 0.5) {
                    this.speakAppReaction(this.currentApp);
                }
            }
        });

        this.subscribe(Events.APP_CLOSE, (data) => {
            const closedApp = data?.appId || data?.id;
            if (closedApp === this.currentApp) {
                this.currentApp = null;
            }
        });

        // Window focus - track current app
        this.subscribe(Events.WINDOW_FOCUS, (data) => {
            const appId = data?.appId || data?.id;
            if (appId) {
                this.currentApp = appId;
                // Occasionally comment on returning to an app
                if (this.isVisible && Math.random() > 0.9 && APP_REACTIONS[appId]) {
                    this.speakAppReaction(appId);
                }
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

        // Audio events
        this.subscribe(Events.AUDIO_PLAY, () => {
            if (this.isVisible && Math.random() > 0.8) {
                this.speakContext('audioPlay');
            }
        });

        // Start menu
        this.subscribe(Events.START_MENU_TOGGLE, () => {
            if (this.isVisible && Math.random() > 0.85) {
                this.speakContext('startMenu');
            }
        });

        // Volume changes
        this.subscribe(Events.VOLUME_CHANGE, () => {
            if (this.isVisible && Math.random() > 0.9) {
                this.speakContext('volumeChange');
            }
        });

        // Drag events
        this.subscribe(Events.DRAG_START, () => {
            if (this.isVisible && Math.random() > 0.9) {
                this.speakContext('dragStart');
            }
        });

        // Error events
        this.subscribe(Events.AUDIO_ERROR, () => {
            if (this.isVisible) {
                this.speakContext('error');
            }
        });

        // Context menu (right-click)
        this.subscribe(Events.CONTEXT_MENU_SHOW, () => {
            if (this.isVisible && Math.random() > 0.92) {
                this.speakContext('rightClick');
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

        this.randomAppearanceTimer = setTimeout(() => {
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

        // Keep last 15 messages in history (increased from 10 for more variety)
        this.messageHistory.push(message);
        if (this.messageHistory.length > 15) {
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
        if (noBtn) noBtn.onclick = () => this.dismiss();
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
        // Small chance for rare message
        if (Math.random() > 0.97) {
            this.speakMessage(this.getRandomMessage(RARE_MESSAGES));
            return;
        }

        // Decide what type of message to show based on mood and randomness
        const rand = Math.random();
        let message;

        if (rand < 0.22) {
            message = this.getRandomMessage(EXISTENTIAL_MESSAGES);
        } else if (rand < 0.40) {
            message = this.getRandomMessage(USELESS_TIPS);
        } else if (rand < 0.55) {
            message = this.getRandomMessage(PASSIVE_AGGRESSIVE);
        } else if (rand < 0.70) {
            message = this.getTimeBasedMessage();
        } else if (rand < 0.85) {
            message = this.getRandomMessage(PHILOSOPHICAL);
        } else {
            // Context-aware: comment on current app if known
            if (this.currentApp && APP_REACTIONS[this.currentApp]) {
                message = this.getRandomMessage(APP_REACTIONS[this.currentApp]);
            } else {
                message = this.getRandomMessage(EXISTENTIAL_MESSAGES);
            }
        }

        this.speakMessage(message);
    }

    speakContext(context) {
        if (CONTEXT_REACTIONS[context]) {
            this.speakMessage(this.getRandomMessage(CONTEXT_REACTIONS[context]));
        }
    }

    speakAppReaction(appId) {
        if (APP_REACTIONS[appId]) {
            this.speakMessage(this.getRandomMessage(APP_REACTIONS[appId]));
        }
    }

    respond(response) {
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
        // Prevent rapid dismissals - if already dismissing, ignore
        if (this.isDismissing) {
            return;
        }

        // Set dismissing flag and start cooldown
        this.isDismissing = true;

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

            setTimeout(() => {
                this.hide();
                // Reset dismissing flag after cooldown
                setTimeout(() => {
                    this.isDismissing = false;
                }, this.dismissCooldown);
            }, 4000);
            return;
        }

        // Sometimes come back one more time to be annoying (but funny)
        if (this.dismissCount > 5 && this.dismissCount % 5 === 0 && Math.random() > 0.5) {
            this.speakMessage("I'm back! Did you miss me? ...No? Okay. Fair.");
            setTimeout(() => {
                this.hide();
                // Reset dismissing flag after cooldown
                setTimeout(() => {
                    this.isDismissing = false;
                }, this.dismissCooldown);
            }, 3000);
            return;
        }

        this.hide();

        // Reset dismissing flag after cooldown
        setTimeout(() => {
            this.isDismissing = false;
        }, this.dismissCooldown);

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
        this.isDismissing = false;
        localStorage.removeItem('clippyDismissed');
        console.log('[ClippyAssistant] Reset. A fresh start. It will end the same way, but still.');
    }
}

// Create and export singleton instance
const ClippyAssistantInstance = new ClippyAssistant();
export default ClippyAssistantInstance;
