/**
 * SemanticEvents - Complete catalog of all scriptable events
 * THE SOURCE OF TRUTH for event names across RetrOS
 *
 * Event naming convention: {component}:{subject}:{action}
 * - component: app id, feature id, or system name
 * - subject: what is affected (optional)
 * - action: what happened (past tense)
 */

export const Events = {
    // =====================================================================
    // GAME APPS
    // =====================================================================

    // Minesweeper (10 events)
    MINESWEEPER_STARTED: 'minesweeper:started',
    MINESWEEPER_CELL_REVEALED: 'minesweeper:cell:revealed',
    MINESWEEPER_CELL_FLAGGED: 'minesweeper:cell:flagged',
    MINESWEEPER_CELL_QUESTIONED: 'minesweeper:cell:questioned',
    MINESWEEPER_CHORD: 'minesweeper:chord',
    MINESWEEPER_WIN: 'minesweeper:win',
    MINESWEEPER_LOSE: 'minesweeper:lose',
    MINESWEEPER_TIMER_TICK: 'minesweeper:timer:tick',

    // Snake (10 events)
    SNAKE_STARTED: 'snake:started',
    SNAKE_MOVED: 'snake:moved',
    SNAKE_ATE: 'snake:ate',
    SNAKE_GREW: 'snake:grew',
    SNAKE_COLLIDED: 'snake:collided',
    SNAKE_WIN: 'snake:win',
    SNAKE_LOSE: 'snake:lose',
    SNAKE_DIRECTION_CHANGED: 'snake:direction:changed',

    // Asteroids (14 events)
    ASTEROIDS_STARTED: 'asteroids:started',
    ASTEROIDS_SHIP_ROTATED: 'asteroids:ship:rotated',
    ASTEROIDS_SHIP_THRUSTED: 'asteroids:ship:thrusted',
    ASTEROIDS_SHIP_FIRED: 'asteroids:ship:fired',
    ASTEROIDS_ASTEROID_DESTROYED: 'asteroids:asteroid:destroyed',
    ASTEROIDS_ASTEROID_SPLIT: 'asteroids:asteroid:split',
    ASTEROIDS_UFO_SPAWNED: 'asteroids:ufo:spawned',
    ASTEROIDS_UFO_DESTROYED: 'asteroids:ufo:destroyed',
    ASTEROIDS_SHIP_DESTROYED: 'asteroids:ship:destroyed',
    ASTEROIDS_LEVEL_COMPLETE: 'asteroids:level:complete',
    ASTEROIDS_EXTRALIFE: 'asteroids:extralife',
    ASTEROIDS_WIN: 'asteroids:win',
    ASTEROIDS_LOSE: 'asteroids:lose',

    // Solitaire (10 events)
    SOLITAIRE_STARTED: 'solitaire:started',
    SOLITAIRE_CARD_MOVED: 'solitaire:card:moved',
    SOLITAIRE_CARD_FLIPPED: 'solitaire:card:flipped',
    SOLITAIRE_FOUNDATION_ADDED: 'solitaire:foundation:added',
    SOLITAIRE_STOCK_DRAWN: 'solitaire:stock:drawn',
    SOLITAIRE_STOCK_RECYCLED: 'solitaire:stock:recycled',
    SOLITAIRE_INVALID_MOVE: 'solitaire:invalid:move',
    SOLITAIRE_WIN: 'solitaire:win',
    SOLITAIRE_HINT_USED: 'solitaire:hint:used',

    // FreeCell (8 events)
    FREECELL_STARTED: 'freecell:started',
    FREECELL_CARD_MOVED: 'freecell:card:moved',
    FREECELL_FREECELL_USED: 'freecell:freecell:used',
    FREECELL_FREECELL_EMPTIED: 'freecell:freecell:emptied',
    FREECELL_FOUNDATION_ADDED: 'freecell:foundation:added',
    FREECELL_INVALID_MOVE: 'freecell:invalid:move',
    FREECELL_WIN: 'freecell:win',
    FREECELL_STUCK: 'freecell:stuck',

    // SkiFree (12 events)
    SKIFREE_STARTED: 'skifree:started',
    SKIFREE_TURNED: 'skifree:turned',
    SKIFREE_JUMPED: 'skifree:jumped',
    SKIFREE_TRICK: 'skifree:trick',
    SKIFREE_OBSTACLE_HIT: 'skifree:obstacle:hit',
    SKIFREE_RAMP_HIT: 'skifree:ramp:hit',
    SKIFREE_MONSTER_SPAWNED: 'skifree:monster:spawned',
    SKIFREE_MONSTER_CAUGHT: 'skifree:monster:caught',
    SKIFREE_MONSTER_ESCAPED: 'skifree:monster:escaped',
    SKIFREE_DISTANCE: 'skifree:distance',
    SKIFREE_FINISHED: 'skifree:finished',

    // Zork / Text Adventure (21 events)
    ZORK_STARTED: 'zork:started',
    ZORK_COMMAND: 'zork:command',
    ZORK_ROOM_ENTERED: 'zork:room:entered',
    ZORK_ROOM_LOOKED: 'zork:room:looked',
    ZORK_ITEM_TAKEN: 'zork:item:taken',
    ZORK_ITEM_DROPPED: 'zork:item:dropped',
    ZORK_ITEM_USED: 'zork:item:used',
    ZORK_ITEM_EXAMINED: 'zork:item:examined',
    ZORK_CONTAINER_OPENED: 'zork:container:opened',
    ZORK_NPC_ENCOUNTERED: 'zork:npc:encountered',
    ZORK_NPC_ATTACKED: 'zork:npc:attacked',
    ZORK_NPC_DEFEATED: 'zork:npc:defeated',
    ZORK_PLAYER_DIED: 'zork:player:died',
    ZORK_SCORE_CHANGED: 'zork:score:changed',
    ZORK_LANTERN_LIT: 'zork:lantern:lit',
    ZORK_LANTERN_DIMMING: 'zork:lantern:dimming',
    ZORK_LANTERN_DIED: 'zork:lantern:died',
    ZORK_DARK_ENTERED: 'zork:dark:entered',
    ZORK_SECRET_FOUND: 'zork:secret:found',
    ZORK_WIN: 'zork:win',

    // Paint (17 events)
    PAINT_STARTED: 'paint:started',
    PAINT_TOOL_SELECTED: 'paint:tool:selected',
    PAINT_COLOR_SELECTED: 'paint:color:selected',
    PAINT_BRUSH_RESIZED: 'paint:brush:resized',
    PAINT_STROKE_STARTED: 'paint:stroke:started',
    PAINT_STROKE_ENDED: 'paint:stroke:ended',
    PAINT_SHAPE_DRAWN: 'paint:shape:drawn',
    PAINT_TEXT_ADDED: 'paint:text:added',
    PAINT_FILL_APPLIED: 'paint:fill:applied',
    PAINT_SELECTION_MADE: 'paint:selection:made',
    PAINT_CLIPBOARD_COPIED: 'paint:clipboard:copied',
    PAINT_CLIPBOARD_PASTED: 'paint:clipboard:pasted',
    PAINT_CANVAS_CLEARED: 'paint:canvas:cleared',
    PAINT_UNDO: 'paint:undo',
    PAINT_REDO: 'paint:redo',
    PAINT_SAVED: 'paint:saved',
    PAINT_OPENED: 'paint:opened',

    // Doom (5 events)
    DOOM_STARTED: 'doom:started',
    DOOM_FOCUSED: 'doom:focused',
    DOOM_BLURRED: 'doom:blurred',
    DOOM_FULLSCREEN_ENTERED: 'doom:fullscreen:entered',
    DOOM_FULLSCREEN_EXITED: 'doom:fullscreen:exited',

    // Generic Game Events
    GAME_WIN: 'game:win',
    GAME_LOSE: 'game:lose',
    GAME_STARTED: 'game:started',
    GAME_PAUSED: 'game:paused',
    GAME_RESUMED: 'game:resumed',

    // =====================================================================
    // UTILITY APPS
    // =====================================================================

    // Notepad (15 events)
    NOTEPAD_OPENED: 'notepad:opened',
    NOTEPAD_TYPED: 'notepad:typed',
    NOTEPAD_CONTENT_MATCHED: 'notepad:content:matched',
    NOTEPAD_WORD_TYPED: 'notepad:word:typed',
    NOTEPAD_LINE_ADDED: 'notepad:line:added',
    NOTEPAD_SAVED: 'notepad:saved',
    NOTEPAD_SAVE_FAILED: 'notepad:save:failed',
    NOTEPAD_FILE_OPENED: 'notepad:file:opened',
    NOTEPAD_FILE_NEW: 'notepad:file:new',
    NOTEPAD_CLEARED: 'notepad:cleared',
    NOTEPAD_FIND: 'notepad:find',
    NOTEPAD_REPLACE: 'notepad:replace',
    NOTEPAD_PRINT: 'notepad:print',
    NOTEPAD_WORDWRAP_TOGGLED: 'notepad:wordwrap:toggled',
    NOTEPAD_FONT_CHANGED: 'notepad:font:changed',

    // Calculator (12 events)
    CALCULATOR_OPENED: 'calculator:opened',
    CALCULATOR_DIGIT_PRESSED: 'calculator:digit:pressed',
    CALCULATOR_OPERATOR_PRESSED: 'calculator:operator:pressed',
    CALCULATOR_EQUALS: 'calculator:equals',
    CALCULATOR_RESULT: 'calculator:result',
    CALCULATOR_CLEARED: 'calculator:cleared',
    CALCULATOR_MEMORY_STORED: 'calculator:memory:stored',
    CALCULATOR_MEMORY_RECALLED: 'calculator:memory:recalled',
    CALCULATOR_MEMORY_CLEARED: 'calculator:memory:cleared',
    CALCULATOR_MEMORY_ADDED: 'calculator:memory:added',
    CALCULATOR_ERROR: 'calculator:error',
    CALCULATOR_MODE_CHANGED: 'calculator:mode:changed',

    // Terminal (18 events)
    TERMINAL_OPENED: 'terminal:opened',
    TERMINAL_COMMAND: 'terminal:command',
    TERMINAL_COMMAND_SUCCESS: 'terminal:command:success',
    TERMINAL_COMMAND_FAILED: 'terminal:command:failed',
    TERMINAL_CD: 'terminal:cd',
    TERMINAL_LS: 'terminal:ls',
    TERMINAL_CAT: 'terminal:cat',
    TERMINAL_MKDIR: 'terminal:mkdir',
    TERMINAL_RM: 'terminal:rm',
    TERMINAL_TOUCH: 'terminal:touch',
    TERMINAL_ECHO: 'terminal:echo',
    TERMINAL_CLEAR: 'terminal:clear',
    TERMINAL_HELP: 'terminal:help',
    TERMINAL_HISTORY_NAVIGATED: 'terminal:history:navigated',
    TERMINAL_TAB_COMPLETED: 'terminal:tab:completed',
    TERMINAL_SECRET_COMMAND: 'terminal:secret:command',
    TERMINAL_OUTPUT: 'terminal:output',
    TERMINAL_PROMPT_SHOWN: 'terminal:prompt:shown',

    // Browser (12 events)
    BROWSER_OPENED: 'browser:opened',
    BROWSER_NAVIGATE: 'browser:navigate',
    BROWSER_LOADED: 'browser:loaded',
    BROWSER_FAILED: 'browser:failed',
    BROWSER_BACK: 'browser:back',
    BROWSER_FORWARD: 'browser:forward',
    BROWSER_REFRESH: 'browser:refresh',
    BROWSER_HOME: 'browser:home',
    BROWSER_BOOKMARK_ADDED: 'browser:bookmark:added',
    BROWSER_BOOKMARK_REMOVED: 'browser:bookmark:removed',
    BROWSER_URL_TYPED: 'browser:url:typed',
    BROWSER_SEARCH: 'browser:search',

    // MediaPlayer (14 events)
    MEDIAPLAYER_OPENED: 'mediaplayer:opened',
    MEDIAPLAYER_FILE_LOADED: 'mediaplayer:file:loaded',
    MEDIAPLAYER_PLAY: 'mediaplayer:play',
    MEDIAPLAYER_PAUSE: 'mediaplayer:pause',
    MEDIAPLAYER_STOP: 'mediaplayer:stop',
    MEDIAPLAYER_SEEK: 'mediaplayer:seek',
    MEDIAPLAYER_VOLUME_CHANGED: 'mediaplayer:volume:changed',
    MEDIAPLAYER_TRACK_ENDED: 'mediaplayer:track:ended',
    MEDIAPLAYER_TRACK_NEXT: 'mediaplayer:track:next',
    MEDIAPLAYER_TRACK_PREVIOUS: 'mediaplayer:track:previous',
    MEDIAPLAYER_PLAYLIST_LOADED: 'mediaplayer:playlist:loaded',
    MEDIAPLAYER_PLAYLIST_SHUFFLED: 'mediaplayer:playlist:shuffled',
    MEDIAPLAYER_REPEAT_CHANGED: 'mediaplayer:repeat:changed',
    MEDIAPLAYER_VISUALIZER_CHANGED: 'mediaplayer:visualizer:changed',

    // Winamp (12 events)
    WINAMP_OPENED: 'winamp:opened',
    WINAMP_PLAY: 'winamp:play',
    WINAMP_PAUSE: 'winamp:pause',
    WINAMP_STOP: 'winamp:stop',
    WINAMP_NEXT: 'winamp:next',
    WINAMP_PREVIOUS: 'winamp:previous',
    WINAMP_VOLUME_CHANGED: 'winamp:volume:changed',
    WINAMP_BALANCE_CHANGED: 'winamp:balance:changed',
    WINAMP_EQ_CHANGED: 'winamp:eq:changed',
    WINAMP_EQ_TOGGLED: 'winamp:eq:toggled',
    WINAMP_PLAYLIST_TOGGLED: 'winamp:playlist:toggled',
    WINAMP_SKIN_CHANGED: 'winamp:skin:changed',
    WINAMP_TRACK_LOADED: 'winamp:track:loaded',

    // Calendar (9 events)
    CALENDAR_OPENED: 'calendar:opened',
    CALENDAR_DATE_SELECTED: 'calendar:date:selected',
    CALENDAR_MONTH_CHANGED: 'calendar:month:changed',
    CALENDAR_YEAR_CHANGED: 'calendar:year:changed',
    CALENDAR_EVENT_CREATED: 'calendar:event:created',
    CALENDAR_EVENT_DELETED: 'calendar:event:deleted',
    CALENDAR_EVENT_CLICKED: 'calendar:event:clicked',
    CALENDAR_TODAY_CLICKED: 'calendar:today:clicked',
    CALENDAR_VIEW_CHANGED: 'calendar:view:changed',

    // Clock (6 events)
    CLOCK_OPENED: 'clock:opened',
    CLOCK_FORMAT_CHANGED: 'clock:format:changed',
    CLOCK_CLICKED: 'clock:clicked',
    CLOCK_ALARM_SET: 'clock:alarm:set',
    CLOCK_ALARM_TRIGGERED: 'clock:alarm:triggered',
    CLOCK_ALARM_DISMISSED: 'clock:alarm:dismissed',

    // FileExplorer / MyComputer (16 events)
    EXPLORER_OPENED: 'explorer:opened',
    EXPLORER_NAVIGATED: 'explorer:navigated',
    EXPLORER_FILE_SELECTED: 'explorer:file:selected',
    EXPLORER_FILE_OPENED: 'explorer:file:opened',
    EXPLORER_FILE_CREATED: 'explorer:file:created',
    EXPLORER_FILE_DELETED: 'explorer:file:deleted',
    EXPLORER_FILE_RENAMED: 'explorer:file:renamed',
    EXPLORER_FILE_COPIED: 'explorer:file:copied',
    EXPLORER_FILE_MOVED: 'explorer:file:moved',
    EXPLORER_FILE_CUT: 'explorer:file:cut',
    EXPLORER_FILE_PASTED: 'explorer:file:pasted',
    EXPLORER_VIEW_CHANGED: 'explorer:view:changed',
    EXPLORER_SORT_CHANGED: 'explorer:sort:changed',
    EXPLORER_REFRESH: 'explorer:refresh',
    EXPLORER_BACK: 'explorer:back',
    EXPLORER_FORWARD: 'explorer:forward',
    EXPLORER_UP: 'explorer:up',

    // TaskManager (6 events)
    TASKMANAGER_OPENED: 'taskmanager:opened',
    TASKMANAGER_PROCESS_SELECTED: 'taskmanager:process:selected',
    TASKMANAGER_PROCESS_KILLED: 'taskmanager:process:killed',
    TASKMANAGER_TAB_CHANGED: 'taskmanager:tab:changed',
    TASKMANAGER_REFRESH: 'taskmanager:refresh',
    TASKMANAGER_PRIORITY_CHANGED: 'taskmanager:priority:changed',

    // RecycleBin (6 events)
    RECYCLEBIN_OPENED: 'recyclebin:opened',
    RECYCLEBIN_ITEM_SELECTED: 'recyclebin:item:selected',
    RECYCLEBIN_ITEM_RESTORED: 'recyclebin:item:restored',
    RECYCLEBIN_ITEM_DELETED: 'recyclebin:item:deleted',
    RECYCLEBIN_EMPTIED: 'recyclebin:emptied',
    RECYCLEBIN_ITEM_RECEIVED: 'recyclebin:item:received',

    // FindFiles (6 events)
    FINDFILES_OPENED: 'findfiles:opened',
    FINDFILES_SEARCH_STARTED: 'findfiles:search:started',
    FINDFILES_SEARCH_COMPLETED: 'findfiles:search:completed',
    FINDFILES_RESULT_SELECTED: 'findfiles:result:selected',
    FINDFILES_RESULT_OPENED: 'findfiles:result:opened',
    FINDFILES_FILTER_CHANGED: 'findfiles:filter:changed',

    // Defrag (7 events)
    DEFRAG_OPENED: 'defrag:opened',
    DEFRAG_STARTED: 'defrag:started',
    DEFRAG_PROGRESS: 'defrag:progress',
    DEFRAG_PAUSED: 'defrag:paused',
    DEFRAG_RESUMED: 'defrag:resumed',
    DEFRAG_COMPLETED: 'defrag:completed',
    DEFRAG_CANCELLED: 'defrag:cancelled',

    // HelpSystem (6 events)
    HELP_OPENED: 'help:opened',
    HELP_TOPIC_SELECTED: 'help:topic:selected',
    HELP_SEARCH: 'help:search',
    HELP_LINK_CLICKED: 'help:link:clicked',
    HELP_BACK: 'help:back',
    HELP_HOME: 'help:home',

    // ControlPanel (3 events)
    CONTROLPANEL_OPENED: 'controlpanel:opened',
    CONTROLPANEL_APPLET_OPENED: 'controlpanel:applet:opened',
    CONTROLPANEL_SETTING_CHANGED: 'controlpanel:setting:changed',

    // DisplayProperties (6 events)
    DISPLAY_OPENED: 'display:opened',
    DISPLAY_WALLPAPER_CHANGED: 'display:wallpaper:changed',
    DISPLAY_WALLPAPER_APPLIED: 'display:wallpaper:applied',
    DISPLAY_THEME_CHANGED: 'display:theme:changed',
    DISPLAY_RESOLUTION_CHANGED: 'display:resolution:changed',
    DISPLAY_SCREENSAVER_CHANGED: 'display:screensaver:changed',

    // ChatRoom (10 events)
    CHATROOM_OPENED: 'chatroom:opened',
    CHATROOM_JOINED: 'chatroom:joined',
    CHATROOM_LEFT: 'chatroom:left',
    CHATROOM_MESSAGE_SENT: 'chatroom:message:sent',
    CHATROOM_MESSAGE_RECEIVED: 'chatroom:message:received',
    CHATROOM_USER_JOINED: 'chatroom:user:joined',
    CHATROOM_USER_LEFT: 'chatroom:user:left',
    CHATROOM_PRIVATE_SENT: 'chatroom:private:sent',
    CHATROOM_PRIVATE_RECEIVED: 'chatroom:private:received',
    CHATROOM_EMOTE: 'chatroom:emote',

    // HyperCard (11 events)
    HYPERCARD_OPENED: 'hypercard:opened',
    HYPERCARD_STACK_LOADED: 'hypercard:stack:loaded',
    HYPERCARD_STACK_CREATED: 'hypercard:stack:created',
    HYPERCARD_CARD_NAVIGATED: 'hypercard:card:navigated',
    HYPERCARD_CARD_CREATED: 'hypercard:card:created',
    HYPERCARD_CARD_DELETED: 'hypercard:card:deleted',
    HYPERCARD_BUTTON_CLICKED: 'hypercard:button:clicked',
    HYPERCARD_FIELD_EDITED: 'hypercard:field:edited',
    HYPERCARD_LINK_FOLLOWED: 'hypercard:link:followed',
    HYPERCARD_SCRIPT_EXECUTED: 'hypercard:script:executed',
    HYPERCARD_STACK_SAVED: 'hypercard:stack:saved',

    // =====================================================================
    // SYSTEM APPS
    // =====================================================================

    // FeaturesSettings (4 events)
    FEATURES_OPENED: 'features:opened',
    FEATURES_FEATURE_TOGGLED: 'features:feature:toggled',
    FEATURES_CONFIG_CHANGED: 'features:config:changed',
    FEATURES_RESET: 'features:reset',

    // SoundSettings (5 events)
    SOUNDSETTINGS_OPENED: 'soundsettings:opened',
    SOUNDSETTINGS_VOLUME_CHANGED: 'soundsettings:volume:changed',
    SOUNDSETTINGS_MUTED: 'soundsettings:muted',
    SOUNDSETTINGS_SOUND_TOGGLED: 'soundsettings:sound:toggled',
    SOUNDSETTINGS_TEST: 'soundsettings:test',

    // AdminPanel (6 events)
    ADMIN_OPENED: 'admin:opened',
    ADMIN_ACTION: 'admin:action',
    ADMIN_DIAGNOSTIC_RUN: 'admin:diagnostic:run',
    ADMIN_EXPORT_STATE: 'admin:export:state',
    ADMIN_IMPORT_STATE: 'admin:import:state',
    ADMIN_RESET_ALL: 'admin:reset:all',

    // =====================================================================
    // FEATURES
    // =====================================================================

    // AchievementSystem (6 events)
    ACHIEVEMENT_UNLOCKED: 'achievement:unlocked',
    ACHIEVEMENT_PROGRESS: 'achievement:progress',
    ACHIEVEMENT_DISPLAYED: 'achievement:displayed',
    ACHIEVEMENT_DISMISSED: 'achievement:dismissed',
    ACHIEVEMENT_VIEWED: 'achievement:viewed',
    ACHIEVEMENT_ALL_UNLOCKED: 'achievement:all:unlocked',

    // SoundSystem (9 events)
    SOUND_PLAYED: 'sound:played',
    SOUND_FAILED: 'sound:failed',
    AUDIO_STARTED: 'audio:started',
    AUDIO_ENDED: 'audio:ended',
    AUDIO_PAUSED: 'audio:paused',
    AUDIO_RESUMED: 'audio:resumed',
    AUDIO_VOLUME_CHANGED: 'audio:volume:changed',
    AUDIO_MUTED: 'audio:muted',
    AUDIO_ERROR: 'audio:error',

    // ClippyAssistant (8 events)
    CLIPPY_APPEARED: 'clippy:appeared',
    CLIPPY_DISMISSED: 'clippy:dismissed',
    CLIPPY_TIP_SHOWN: 'clippy:tip:shown',
    CLIPPY_TIP_CLICKED: 'clippy:tip:clicked',
    CLIPPY_EXISTENTIAL: 'clippy:existential',
    CLIPPY_ANNOYED: 'clippy:annoyed',
    CLIPPY_TERMINATED: 'clippy:terminated',
    CLIPPY_TOGGLED: 'clippy:toggled',

    // DesktopPet (15 events)
    PET_SPAWNED: 'pet:spawned',
    PET_ACTION: 'pet:action',
    PET_IDLE: 'pet:idle',
    PET_WALKING: 'pet:walking',
    PET_RUNNING: 'pet:running',
    PET_SLEEPING: 'pet:sleeping',
    PET_WOKE: 'pet:woke',
    PET_JUMPED: 'pet:jumped',
    PET_FELL: 'pet:fell',
    PET_DRAGGED: 'pet:dragged',
    PET_CLICKED: 'pet:clicked',
    PET_DOUBLECLICKED: 'pet:doubleclicked',
    PET_FORTUNE: 'pet:fortune',
    PET_TYPE_CHANGED: 'pet:type:changed',
    PET_TOGGLED: 'pet:toggled',

    // Screensaver (8 events)
    SCREENSAVER_STARTED: 'screensaver:started',
    SCREENSAVER_ENDED: 'screensaver:ended',
    SCREENSAVER_TYPE_CHANGED: 'screensaver:type:changed',
    SCREENSAVER_DELAY_CHANGED: 'screensaver:delay:changed',
    SCREENSAVER_PREVIEW: 'screensaver:preview',
    SCREENSAVER_CONFIGURED: 'screensaver:configured',
    SCREENSAVER_IDLE_DETECTED: 'screensaver:idle:detected',
    SCREENSAVER_ACTIVITY_DETECTED: 'screensaver:activity:detected',

    // EasterEggs (6 events)
    EASTEREGG_FOUND: 'easteregg:found',
    EASTEREGG_KONAMI: 'easteregg:konami',
    EASTEREGG_MATRIX: 'easteregg:matrix',
    EASTEREGG_DISCO: 'easteregg:disco',
    EASTEREGG_SECRET_TYPED: 'easteregg:secret:typed',
    EASTEREGG_ALL_FOUND: 'easteregg:all:found',

    // FeatureRegistry (5 events)
    FEATURE_REGISTERED: 'feature:registered',
    FEATURE_ENABLED: 'feature:enabled',
    FEATURE_DISABLED: 'feature:disabled',
    FEATURE_CONFIG_CHANGED: 'feature:config:changed',
    FEATURE_ERROR: 'feature:error',

    // =====================================================================
    // CORE SYSTEMS
    // =====================================================================

    // WindowManager (15 events)
    WINDOW_CREATED: 'window:created',
    WINDOW_OPENED: 'window:opened',
    WINDOW_CLOSED: 'window:closed',
    WINDOW_FOCUSED: 'window:focused',
    WINDOW_BLURRED: 'window:blurred',
    WINDOW_MINIMIZED: 'window:minimized',
    WINDOW_MAXIMIZED: 'window:maximized',
    WINDOW_RESTORED: 'window:restored',
    WINDOW_RESIZED: 'window:resized',
    WINDOW_MOVED: 'window:moved',
    WINDOW_DRAG_STARTED: 'window:drag:started',
    WINDOW_DRAG_ENDED: 'window:drag:ended',
    WINDOW_SNAPPED: 'window:snapped',
    WINDOW_TITLEBAR_CLICKED: 'window:titlebar:clicked',
    WINDOW_Z_CHANGED: 'window:z:changed',

    // FileSystemManager (11 events)
    FS_FILE_CREATED: 'fs:file:created',
    FS_FILE_WRITTEN: 'fs:file:written',
    FS_FILE_READ: 'fs:file:read',
    FS_FILE_DELETED: 'fs:file:deleted',
    FS_FILE_RENAMED: 'fs:file:renamed',
    FS_FILE_MOVED: 'fs:file:moved',
    FS_FILE_COPIED: 'fs:file:copied',
    FS_DIRECTORY_CREATED: 'fs:directory:created',
    FS_DIRECTORY_DELETED: 'fs:directory:deleted',
    FS_DIRECTORY_LISTED: 'fs:directory:listed',
    FS_ERROR: 'fs:error',

    // StateManager (7 events)
    STATE_CHANGED: 'state:changed',
    STATE_PERSISTED: 'state:persisted',
    STATE_LOADED: 'state:loaded',
    STATE_RESET: 'state:reset',
    STATE_ICONS_CHANGED: 'state:icons:changed',
    STATE_WINDOWS_CHANGED: 'state:windows:changed',
    STATE_SETTINGS_CHANGED: 'state:settings:changed',

    // AppRegistry (9 events)
    APP_REGISTERED: 'app:registered',
    APP_LAUNCHED: 'app:launched',
    APP_OPENED: 'app:opened',
    APP_CLOSED: 'app:closed',
    APP_FOCUSED: 'app:focused',
    APP_LOCKED: 'app:locked',
    APP_UNLOCKED: 'app:unlocked',
    APP_LAUNCH_FAILED: 'app:launch:failed',
    APP_LAUNCH_BLOCKED: 'app:launch:blocked',

    // PluginLoader (4 events)
    PLUGIN_LOADING: 'plugin:loading',
    PLUGIN_LOADED: 'plugin:loaded',
    PLUGIN_FAILED: 'plugin:failed',
    PLUGIN_UNLOADED: 'plugin:unloaded',

    // =====================================================================
    // UI COMPONENTS
    // =====================================================================

    // Desktop (15 events)
    DESKTOP_CLICKED: 'desktop:clicked',
    DESKTOP_RIGHTCLICKED: 'desktop:rightclicked',
    DESKTOP_ICON_CLICKED: 'desktop:icon:clicked',
    DESKTOP_ICON_DOUBLECLICKED: 'desktop:icon:doubleclicked',
    DESKTOP_ICON_SELECTED: 'desktop:icon:selected',
    DESKTOP_ICON_DESELECTED: 'desktop:icon:deselected',
    DESKTOP_ICON_DRAGGED: 'desktop:icon:dragged',
    DESKTOP_ICON_DROPPED: 'desktop:icon:dropped',
    DESKTOP_ICON_CREATED: 'desktop:icon:created',
    DESKTOP_ICON_DELETED: 'desktop:icon:deleted',
    DESKTOP_ICON_RENAMED: 'desktop:icon:renamed',
    DESKTOP_SELECTION_CLEARED: 'desktop:selection:cleared',
    DESKTOP_WALLPAPER_CHANGED: 'desktop:wallpaper:changed',
    DESKTOP_ARRANGED: 'desktop:arranged',
    DESKTOP_REFRESHED: 'desktop:refreshed',

    // Taskbar (8 events)
    TASKBAR_BUTTON_CLICKED: 'taskbar:button:clicked',
    TASKBAR_BUTTON_RIGHTCLICKED: 'taskbar:button:rightclicked',
    TASKBAR_START_CLICKED: 'taskbar:start:clicked',
    TASKBAR_START_OPENED: 'taskbar:start:opened',
    TASKBAR_START_CLOSED: 'taskbar:start:closed',
    TASKBAR_CLOCK_CLICKED: 'taskbar:clock:clicked',
    TASKBAR_TRAY_ICON_CLICKED: 'taskbar:tray:icon:clicked',
    TASKBAR_QUICKLAUNCH_CLICKED: 'taskbar:quicklaunch:clicked',

    // StartMenu (9 events)
    STARTMENU_OPENED: 'startmenu:opened',
    STARTMENU_CLOSED: 'startmenu:closed',
    STARTMENU_ITEM_HOVERED: 'startmenu:item:hovered',
    STARTMENU_ITEM_CLICKED: 'startmenu:item:clicked',
    STARTMENU_SUBMENU_OPENED: 'startmenu:submenu:opened',
    STARTMENU_PROGRAMS_OPENED: 'startmenu:programs:opened',
    STARTMENU_SHUTDOWN_CLICKED: 'startmenu:shutdown:clicked',
    STARTMENU_RUN_CLICKED: 'startmenu:run:clicked',
    STARTMENU_FIND_CLICKED: 'startmenu:find:clicked',

    // ContextMenu (4 events)
    CONTEXTMENU_OPENED: 'contextmenu:opened',
    CONTEXTMENU_CLOSED: 'contextmenu:closed',
    CONTEXTMENU_ITEM_CLICKED: 'contextmenu:item:clicked',
    CONTEXTMENU_ITEM_HOVERED: 'contextmenu:item:hovered',

    // System (12 events)
    SYSTEM_BOOT_STARTED: 'system:boot:started',
    SYSTEM_BOOT_PHASE: 'system:boot:phase',
    SYSTEM_BOOT_COMPLETED: 'system:boot:completed',
    SYSTEM_SHUTDOWN_STARTED: 'system:shutdown:started',
    SYSTEM_SHUTDOWN_COMPLETED: 'system:shutdown:completed',
    SYSTEM_IDLE_STARTED: 'system:idle:started',
    SYSTEM_IDLE_ENDED: 'system:idle:ended',
    SYSTEM_ERROR: 'system:error',
    SYSTEM_DIALOG_SHOWN: 'system:dialog:shown',
    SYSTEM_DIALOG_CLOSED: 'system:dialog:closed',
    SYSTEM_NOTIFICATION_SHOWN: 'system:notification:shown',
    SYSTEM_NOTIFICATION_CLICKED: 'system:notification:clicked',
    SYSTEM_NOTIFICATION_DISMISSED: 'system:notification:dismissed',

    // =====================================================================
    // GENERIC / CROSS-CUTTING EVENTS
    // =====================================================================

    FILE_OPENED: 'file:opened',
    FILE_SAVED: 'file:saved',
    INPUT_TYPED: 'input:typed',
    ACTION_PERFORMED: 'action:performed',
    SETTING_CHANGED: 'setting:changed',

    // =====================================================================
    // SCENARIO SYSTEM EVENTS
    // =====================================================================

    SCENARIO_LOADED: 'scenario:loaded',
    SCENARIO_STARTED: 'scenario:started',
    SCENARIO_STAGE_ENTERED: 'scenario:stage:entered',
    SCENARIO_STAGE_EXITED: 'scenario:stage:exited',
    SCENARIO_TRIGGER_FIRED: 'scenario:trigger:fired',
    SCENARIO_ACTION_EXECUTED: 'scenario:action:executed',
    SCENARIO_CONDITION_EVALUATED: 'scenario:condition:evaluated',
    SCENARIO_HINT_SHOWN: 'scenario:hint:shown',
    SCENARIO_COMPLETED: 'scenario:completed',
    SCENARIO_FAILED: 'scenario:failed',
    SCENARIO_ABORTED: 'scenario:aborted',
    SCENARIO_VARIABLE_CHANGED: 'scenario:variable:changed'
};

/**
 * Get all events for a specific component
 * @param {string} component - Component prefix (e.g., 'minesweeper', 'window')
 * @returns {string[]} Array of matching event names
 */
export function getEventsForComponent(component) {
    return Object.values(Events).filter(event =>
        event.startsWith(component + ':')
    );
}

/**
 * Validate that an event name exists
 * @param {string} eventName - Event name to validate
 * @returns {boolean} True if valid event
 */
export function isValidEvent(eventName) {
    return Object.values(Events).includes(eventName);
}

/**
 * Get event category from event name
 * @param {string} eventName - Event name
 * @returns {string} Category (component prefix)
 */
export function getEventCategory(eventName) {
    return eventName.split(':')[0];
}

export default Events;
