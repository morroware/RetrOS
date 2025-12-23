/**
 * SemanticEvents - Complete catalog of all scriptable events in RetrOS
 *
 * This is the SOURCE OF TRUTH for all events that can be used in scenarios.
 * Every app, feature, system component, and UI interaction emits semantic events.
 *
 * Event Naming Convention: {component}:{subject}:{action}
 * - component: app id, feature id, or system name
 * - subject: what is affected (optional for simple events)
 * - action: what happened (past tense)
 *
 * Examples:
 *   minesweeper:cell:revealed - Minesweeper cell was revealed
 *   notepad:saved - Notepad file was saved
 *   window:focused - Window received focus
 */

// =============================================================================
// GAME APP EVENTS (~45 events)
// =============================================================================

export const MinesweeperEvents = {
    STARTED: 'minesweeper:started',
    CELL_REVEALED: 'minesweeper:cell:revealed',
    CELL_FLAGGED: 'minesweeper:cell:flagged',
    CELL_QUESTIONED: 'minesweeper:cell:questioned',
    CHORD: 'minesweeper:chord',
    WIN: 'minesweeper:win',
    LOSE: 'minesweeper:lose',
    TIMER_TICK: 'minesweeper:timer:tick'
};

export const SnakeEvents = {
    STARTED: 'snake:started',
    MOVED: 'snake:moved',
    ATE: 'snake:ate',
    GREW: 'snake:grew',
    COLLIDED: 'snake:collided',
    WIN: 'snake:win',
    LOSE: 'snake:lose',
    DIRECTION_CHANGED: 'snake:direction:changed'
};

export const AsteroidsEvents = {
    STARTED: 'asteroids:started',
    SHIP_ROTATED: 'asteroids:ship:rotated',
    SHIP_THRUSTED: 'asteroids:ship:thrusted',
    SHIP_FIRED: 'asteroids:ship:fired',
    ASTEROID_DESTROYED: 'asteroids:asteroid:destroyed',
    ASTEROID_SPLIT: 'asteroids:asteroid:split',
    UFO_SPAWNED: 'asteroids:ufo:spawned',
    UFO_DESTROYED: 'asteroids:ufo:destroyed',
    SHIP_DESTROYED: 'asteroids:ship:destroyed',
    LEVEL_COMPLETE: 'asteroids:level:complete',
    EXTRA_LIFE: 'asteroids:extralife',
    WIN: 'asteroids:win',
    LOSE: 'asteroids:lose'
};

export const SolitaireEvents = {
    STARTED: 'solitaire:started',
    CARD_MOVED: 'solitaire:card:moved',
    CARD_FLIPPED: 'solitaire:card:flipped',
    FOUNDATION_ADDED: 'solitaire:foundation:added',
    STOCK_DRAWN: 'solitaire:stock:drawn',
    STOCK_RECYCLED: 'solitaire:stock:recycled',
    INVALID_MOVE: 'solitaire:invalid:move',
    WIN: 'solitaire:win',
    HINT_USED: 'solitaire:hint:used'
};

export const FreeCellEvents = {
    STARTED: 'freecell:started',
    CARD_MOVED: 'freecell:card:moved',
    FREECELL_USED: 'freecell:freecell:used',
    FREECELL_EMPTIED: 'freecell:freecell:emptied',
    FOUNDATION_ADDED: 'freecell:foundation:added',
    INVALID_MOVE: 'freecell:invalid:move',
    WIN: 'freecell:win',
    STUCK: 'freecell:stuck'
};

export const SkiFreeEvents = {
    STARTED: 'skifree:started',
    TURNED: 'skifree:turned',
    JUMPED: 'skifree:jumped',
    TRICK: 'skifree:trick',
    OBSTACLE_HIT: 'skifree:obstacle:hit',
    RAMP_HIT: 'skifree:ramp:hit',
    MONSTER_SPAWNED: 'skifree:monster:spawned',
    MONSTER_CAUGHT: 'skifree:monster:caught',
    MONSTER_ESCAPED: 'skifree:monster:escaped',
    DISTANCE: 'skifree:distance',
    FINISHED: 'skifree:finished'
};

export const ZorkEvents = {
    STARTED: 'zork:started',
    COMMAND: 'zork:command',
    ROOM_ENTERED: 'zork:room:entered',
    ROOM_LOOKED: 'zork:room:looked',
    ITEM_TAKEN: 'zork:item:taken',
    ITEM_DROPPED: 'zork:item:dropped',
    ITEM_USED: 'zork:item:used',
    ITEM_EXAMINED: 'zork:item:examined',
    CONTAINER_OPENED: 'zork:container:opened',
    NPC_ENCOUNTERED: 'zork:npc:encountered',
    NPC_ATTACKED: 'zork:npc:attacked',
    NPC_DEFEATED: 'zork:npc:defeated',
    PLAYER_DIED: 'zork:player:died',
    SCORE_CHANGED: 'zork:score:changed',
    LANTERN_LIT: 'zork:lantern:lit',
    LANTERN_DIMMING: 'zork:lantern:dimming',
    LANTERN_DIED: 'zork:lantern:died',
    DARK_ENTERED: 'zork:dark:entered',
    SECRET_FOUND: 'zork:secret:found',
    WIN: 'zork:win'
};

export const PaintEvents = {
    STARTED: 'paint:started',
    TOOL_SELECTED: 'paint:tool:selected',
    COLOR_SELECTED: 'paint:color:selected',
    BRUSH_RESIZED: 'paint:brush:resized',
    STROKE_STARTED: 'paint:stroke:started',
    STROKE_ENDED: 'paint:stroke:ended',
    SHAPE_DRAWN: 'paint:shape:drawn',
    TEXT_ADDED: 'paint:text:added',
    FILL_APPLIED: 'paint:fill:applied',
    SELECTION_MADE: 'paint:selection:made',
    CLIPBOARD_COPIED: 'paint:clipboard:copied',
    CLIPBOARD_PASTED: 'paint:clipboard:pasted',
    CANVAS_CLEARED: 'paint:canvas:cleared',
    UNDO: 'paint:undo',
    REDO: 'paint:redo',
    SAVED: 'paint:saved',
    OPENED: 'paint:opened'
};

export const DoomEvents = {
    STARTED: 'doom:started',
    FOCUSED: 'doom:focused',
    BLURRED: 'doom:blurred',
    FULLSCREEN_ENTERED: 'doom:fullscreen:entered',
    FULLSCREEN_EXITED: 'doom:fullscreen:exited'
};

// Generic game events (cross-cutting)
export const GameEvents = {
    WIN: 'game:win',
    LOSE: 'game:lose',
    STARTED: 'game:started',
    PAUSED: 'game:paused',
    RESUMED: 'game:resumed'
};

// =============================================================================
// UTILITY APP EVENTS (~75 events)
// =============================================================================

export const NotepadEvents = {
    OPENED: 'notepad:opened',
    TYPED: 'notepad:typed',
    CONTENT_MATCHED: 'notepad:content:matched',
    WORD_TYPED: 'notepad:word:typed',
    LINE_ADDED: 'notepad:line:added',
    SAVED: 'notepad:saved',
    SAVE_FAILED: 'notepad:save:failed',
    FILE_OPENED: 'notepad:file:opened',
    FILE_NEW: 'notepad:file:new',
    CLEARED: 'notepad:cleared',
    FIND: 'notepad:find',
    REPLACE: 'notepad:replace',
    PRINT: 'notepad:print',
    WORDWRAP_TOGGLED: 'notepad:wordwrap:toggled',
    FONT_CHANGED: 'notepad:font:changed'
};

export const CalculatorEvents = {
    OPENED: 'calculator:opened',
    DIGIT_PRESSED: 'calculator:digit:pressed',
    OPERATOR_PRESSED: 'calculator:operator:pressed',
    EQUALS: 'calculator:equals',
    RESULT: 'calculator:result',
    CLEARED: 'calculator:cleared',
    MEMORY_STORED: 'calculator:memory:stored',
    MEMORY_RECALLED: 'calculator:memory:recalled',
    MEMORY_CLEARED: 'calculator:memory:cleared',
    MEMORY_ADDED: 'calculator:memory:added',
    ERROR: 'calculator:error',
    MODE_CHANGED: 'calculator:mode:changed'
};

export const TerminalEvents = {
    OPENED: 'terminal:opened',
    COMMAND: 'terminal:command',
    COMMAND_SUCCESS: 'terminal:command:success',
    COMMAND_FAILED: 'terminal:command:failed',
    CD: 'terminal:cd',
    LS: 'terminal:ls',
    CAT: 'terminal:cat',
    MKDIR: 'terminal:mkdir',
    RM: 'terminal:rm',
    TOUCH: 'terminal:touch',
    ECHO: 'terminal:echo',
    CLEAR: 'terminal:clear',
    HELP: 'terminal:help',
    HISTORY_NAVIGATED: 'terminal:history:navigated',
    TAB_COMPLETED: 'terminal:tab:completed',
    SECRET_COMMAND: 'terminal:secret:command',
    OUTPUT: 'terminal:output',
    PROMPT_SHOWN: 'terminal:prompt:shown'
};

export const BrowserEvents = {
    OPENED: 'browser:opened',
    NAVIGATE: 'browser:navigate',
    LOADED: 'browser:loaded',
    FAILED: 'browser:failed',
    BACK: 'browser:back',
    FORWARD: 'browser:forward',
    REFRESH: 'browser:refresh',
    HOME: 'browser:home',
    BOOKMARK_ADDED: 'browser:bookmark:added',
    BOOKMARK_REMOVED: 'browser:bookmark:removed',
    URL_TYPED: 'browser:url:typed',
    SEARCH: 'browser:search'
};

export const MediaPlayerEvents = {
    OPENED: 'mediaplayer:opened',
    FILE_LOADED: 'mediaplayer:file:loaded',
    PLAY: 'mediaplayer:play',
    PAUSE: 'mediaplayer:pause',
    STOP: 'mediaplayer:stop',
    SEEK: 'mediaplayer:seek',
    VOLUME_CHANGED: 'mediaplayer:volume:changed',
    TRACK_ENDED: 'mediaplayer:track:ended',
    TRACK_NEXT: 'mediaplayer:track:next',
    TRACK_PREVIOUS: 'mediaplayer:track:previous',
    PLAYLIST_LOADED: 'mediaplayer:playlist:loaded',
    PLAYLIST_SHUFFLED: 'mediaplayer:playlist:shuffled',
    REPEAT_CHANGED: 'mediaplayer:repeat:changed',
    VISUALIZER_CHANGED: 'mediaplayer:visualizer:changed'
};

export const WinampEvents = {
    OPENED: 'winamp:opened',
    PLAY: 'winamp:play',
    PAUSE: 'winamp:pause',
    STOP: 'winamp:stop',
    NEXT: 'winamp:next',
    PREVIOUS: 'winamp:previous',
    VOLUME_CHANGED: 'winamp:volume:changed',
    BALANCE_CHANGED: 'winamp:balance:changed',
    EQ_CHANGED: 'winamp:eq:changed',
    EQ_TOGGLED: 'winamp:eq:toggled',
    PLAYLIST_TOGGLED: 'winamp:playlist:toggled',
    SKIN_CHANGED: 'winamp:skin:changed',
    TRACK_LOADED: 'winamp:track:loaded'
};

export const CalendarEvents = {
    OPENED: 'calendar:opened',
    DATE_SELECTED: 'calendar:date:selected',
    MONTH_CHANGED: 'calendar:month:changed',
    YEAR_CHANGED: 'calendar:year:changed',
    EVENT_CREATED: 'calendar:event:created',
    EVENT_DELETED: 'calendar:event:deleted',
    EVENT_CLICKED: 'calendar:event:clicked',
    TODAY_CLICKED: 'calendar:today:clicked',
    VIEW_CHANGED: 'calendar:view:changed'
};

export const ClockEvents = {
    OPENED: 'clock:opened',
    FORMAT_CHANGED: 'clock:format:changed',
    CLICKED: 'clock:clicked',
    ALARM_SET: 'clock:alarm:set',
    ALARM_TRIGGERED: 'clock:alarm:triggered',
    ALARM_DISMISSED: 'clock:alarm:dismissed',
    TIME_CHECKED: 'clock:time:checked'
};

export const ExplorerEvents = {
    OPENED: 'explorer:opened',
    NAVIGATED: 'explorer:navigated',
    FILE_SELECTED: 'explorer:file:selected',
    FILE_OPENED: 'explorer:file:opened',
    FILE_CREATED: 'explorer:file:created',
    FILE_DELETED: 'explorer:file:deleted',
    FILE_RENAMED: 'explorer:file:renamed',
    FILE_COPIED: 'explorer:file:copied',
    FILE_MOVED: 'explorer:file:moved',
    FILE_CUT: 'explorer:file:cut',
    FILE_PASTED: 'explorer:file:pasted',
    VIEW_CHANGED: 'explorer:view:changed',
    SORT_CHANGED: 'explorer:sort:changed',
    REFRESH: 'explorer:refresh',
    BACK: 'explorer:back',
    FORWARD: 'explorer:forward',
    UP: 'explorer:up'
};

export const TaskManagerEvents = {
    OPENED: 'taskmanager:opened',
    PROCESS_SELECTED: 'taskmanager:process:selected',
    PROCESS_KILLED: 'taskmanager:process:killed',
    TAB_CHANGED: 'taskmanager:tab:changed',
    REFRESH: 'taskmanager:refresh',
    PRIORITY_CHANGED: 'taskmanager:priority:changed'
};

export const RecycleBinEvents = {
    OPENED: 'recyclebin:opened',
    ITEM_SELECTED: 'recyclebin:item:selected',
    ITEM_RESTORED: 'recyclebin:item:restored',
    ITEM_DELETED: 'recyclebin:item:deleted',
    EMPTIED: 'recyclebin:emptied',
    ITEM_RECEIVED: 'recyclebin:item:received'
};

export const FindFilesEvents = {
    OPENED: 'findfiles:opened',
    SEARCH_STARTED: 'findfiles:search:started',
    SEARCH_COMPLETED: 'findfiles:search:completed',
    RESULT_SELECTED: 'findfiles:result:selected',
    RESULT_OPENED: 'findfiles:result:opened',
    FILTER_CHANGED: 'findfiles:filter:changed'
};

export const DefragEvents = {
    OPENED: 'defrag:opened',
    STARTED: 'defrag:started',
    PROGRESS: 'defrag:progress',
    PAUSED: 'defrag:paused',
    RESUMED: 'defrag:resumed',
    COMPLETED: 'defrag:completed',
    CANCELLED: 'defrag:cancelled'
};

export const HelpEvents = {
    OPENED: 'help:opened',
    TOPIC_SELECTED: 'help:topic:selected',
    SEARCH: 'help:search',
    LINK_CLICKED: 'help:link:clicked',
    BACK: 'help:back',
    HOME: 'help:home'
};

export const ControlPanelEvents = {
    OPENED: 'controlpanel:opened',
    APPLET_OPENED: 'controlpanel:applet:opened',
    SETTING_CHANGED: 'controlpanel:setting:changed'
};

export const DisplayPropertiesEvents = {
    OPENED: 'display:opened',
    WALLPAPER_CHANGED: 'display:wallpaper:changed',
    WALLPAPER_APPLIED: 'display:wallpaper:applied',
    THEME_CHANGED: 'display:theme:changed',
    RESOLUTION_CHANGED: 'display:resolution:changed',
    COLORS_CHANGED: 'display:colors:changed',
    SCREENSAVER_CHANGED: 'display:screensaver:changed'
};

export const ChatRoomEvents = {
    OPENED: 'chatroom:opened',
    JOINED: 'chatroom:joined',
    LEFT: 'chatroom:left',
    MESSAGE_SENT: 'chatroom:message:sent',
    MESSAGE_RECEIVED: 'chatroom:message:received',
    USER_JOINED: 'chatroom:user:joined',
    USER_LEFT: 'chatroom:user:left',
    PRIVATE_SENT: 'chatroom:private:sent',
    PRIVATE_RECEIVED: 'chatroom:private:received',
    EMOTE: 'chatroom:emote'
};

export const HyperCardEvents = {
    OPENED: 'hypercard:opened',
    STACK_LOADED: 'hypercard:stack:loaded',
    STACK_CREATED: 'hypercard:stack:created',
    CARD_NAVIGATED: 'hypercard:card:navigated',
    CARD_CREATED: 'hypercard:card:created',
    CARD_DELETED: 'hypercard:card:deleted',
    BUTTON_CLICKED: 'hypercard:button:clicked',
    FIELD_EDITED: 'hypercard:field:edited',
    LINK_FOLLOWED: 'hypercard:link:followed',
    SCRIPT_EXECUTED: 'hypercard:script:executed',
    STACK_SAVED: 'hypercard:stack:saved'
};

// =============================================================================
// SYSTEM APP EVENTS (~15 events)
// =============================================================================

export const FeaturesSettingsEvents = {
    OPENED: 'features:opened',
    FEATURE_TOGGLED: 'features:feature:toggled',
    CONFIG_CHANGED: 'features:config:changed',
    RESET: 'features:reset'
};

export const SoundSettingsEvents = {
    OPENED: 'soundsettings:opened',
    VOLUME_CHANGED: 'soundsettings:volume:changed',
    MUTED: 'soundsettings:muted',
    SOUND_TOGGLED: 'soundsettings:sound:toggled',
    TEST: 'soundsettings:test'
};

export const AdminPanelEvents = {
    OPENED: 'admin:opened',
    ACTION: 'admin:action',
    DIAGNOSTIC_RUN: 'admin:diagnostic:run',
    EXPORT_STATE: 'admin:export:state',
    IMPORT_STATE: 'admin:import:state',
    RESET_ALL: 'admin:reset:all'
};

// =============================================================================
// FEATURE EVENTS (~40 events)
// =============================================================================

export const AchievementEvents = {
    UNLOCKED: 'achievement:unlocked',
    PROGRESS: 'achievement:progress',
    DISPLAYED: 'achievement:displayed',
    DISMISSED: 'achievement:dismissed',
    VIEWED: 'achievement:viewed',
    ALL_UNLOCKED: 'achievement:all:unlocked'
};

export const SoundSystemEvents = {
    PLAYED: 'sound:played',
    FAILED: 'sound:failed',
    AUDIO_STARTED: 'audio:started',
    AUDIO_ENDED: 'audio:ended',
    AUDIO_PAUSED: 'audio:paused',
    AUDIO_RESUMED: 'audio:resumed',
    VOLUME_CHANGED: 'audio:volume:changed',
    MUTED: 'audio:muted',
    ERROR: 'audio:error'
};

export const ClippyEvents = {
    APPEARED: 'clippy:appeared',
    DISMISSED: 'clippy:dismissed',
    TIP_SHOWN: 'clippy:tip:shown',
    TIP_CLICKED: 'clippy:tip:clicked',
    EXISTENTIAL: 'clippy:existential',
    ANNOYED: 'clippy:annoyed',
    TERMINATED: 'clippy:terminated',
    TOGGLED: 'clippy:toggled'
};

export const DesktopPetEvents = {
    SPAWNED: 'pet:spawned',
    ACTION: 'pet:action',
    IDLE: 'pet:idle',
    WALKING: 'pet:walking',
    RUNNING: 'pet:running',
    SLEEPING: 'pet:sleeping',
    WOKE: 'pet:woke',
    JUMPED: 'pet:jumped',
    FELL: 'pet:fell',
    DRAGGED: 'pet:dragged',
    CLICKED: 'pet:clicked',
    DOUBLE_CLICKED: 'pet:doubleclicked',
    FORTUNE: 'pet:fortune',
    TYPE_CHANGED: 'pet:type:changed',
    TOGGLED: 'pet:toggled'
};

export const ScreensaverEvents = {
    STARTED: 'screensaver:started',
    ENDED: 'screensaver:ended',
    TYPE_CHANGED: 'screensaver:type:changed',
    DELAY_CHANGED: 'screensaver:delay:changed',
    PREVIEW: 'screensaver:preview',
    CONFIGURED: 'screensaver:configured',
    IDLE_DETECTED: 'screensaver:idle:detected',
    ACTIVITY_DETECTED: 'screensaver:activity:detected'
};

export const EasterEggEvents = {
    FOUND: 'easteregg:found',
    KONAMI: 'easteregg:konami',
    MATRIX: 'easteregg:matrix',
    DISCO: 'easteregg:disco',
    SECRET_TYPED: 'easteregg:secret:typed',
    ALL_FOUND: 'easteregg:all:found'
};

export const FeatureRegistryEvents = {
    REGISTERED: 'feature:registered',
    ENABLED: 'feature:enabled',
    DISABLED: 'feature:disabled',
    CONFIG_CHANGED: 'feature:config:changed',
    ERROR: 'feature:error'
};

// =============================================================================
// CORE SYSTEM EVENTS (~50 events)
// =============================================================================

export const WindowEvents = {
    CREATED: 'window:created',
    OPENED: 'window:opened',
    CLOSED: 'window:closed',
    FOCUSED: 'window:focused',
    BLURRED: 'window:blurred',
    MINIMIZED: 'window:minimized',
    MAXIMIZED: 'window:maximized',
    RESTORED: 'window:restored',
    RESIZED: 'window:resized',
    MOVED: 'window:moved',
    DRAG_STARTED: 'window:drag:started',
    DRAG_ENDED: 'window:drag:ended',
    SNAPPED: 'window:snapped',
    TITLEBAR_CLICKED: 'window:titlebar:clicked',
    Z_CHANGED: 'window:z:changed'
};

export const FileSystemEvents = {
    FILE_CREATED: 'fs:file:created',
    FILE_WRITTEN: 'fs:file:written',
    FILE_READ: 'fs:file:read',
    FILE_DELETED: 'fs:file:deleted',
    FILE_RENAMED: 'fs:file:renamed',
    FILE_MOVED: 'fs:file:moved',
    FILE_COPIED: 'fs:file:copied',
    DIRECTORY_CREATED: 'fs:directory:created',
    DIRECTORY_DELETED: 'fs:directory:deleted',
    DIRECTORY_LISTED: 'fs:directory:listed',
    ERROR: 'fs:error'
};

export const StateEvents = {
    CHANGED: 'state:changed',
    PERSISTED: 'state:persisted',
    LOADED: 'state:loaded',
    RESET: 'state:reset',
    ICONS_CHANGED: 'state:icons:changed',
    WINDOWS_CHANGED: 'state:windows:changed',
    SETTINGS_CHANGED: 'state:settings:changed'
};

export const AppRegistryEvents = {
    REGISTERED: 'app:registered',
    LAUNCHED: 'app:launched',
    OPENED: 'app:opened',
    CLOSED: 'app:closed',
    FOCUSED: 'app:focused',
    LOCKED: 'app:locked',
    UNLOCKED: 'app:unlocked',
    LAUNCH_FAILED: 'app:launch:failed',
    LAUNCH_BLOCKED: 'app:launch:blocked'
};

export const PluginEvents = {
    LOADING: 'plugin:loading',
    LOADED: 'plugin:loaded',
    FAILED: 'plugin:failed',
    UNLOADED: 'plugin:unloaded'
};

// =============================================================================
// UI COMPONENT EVENTS (~30 events)
// =============================================================================

export const DesktopEvents = {
    CLICKED: 'desktop:clicked',
    RIGHT_CLICKED: 'desktop:rightclicked',
    ICON_CLICKED: 'desktop:icon:clicked',
    ICON_DOUBLE_CLICKED: 'desktop:icon:doubleclicked',
    ICON_SELECTED: 'desktop:icon:selected',
    ICON_DESELECTED: 'desktop:icon:deselected',
    ICON_DRAGGED: 'desktop:icon:dragged',
    ICON_DROPPED: 'desktop:icon:dropped',
    ICON_CREATED: 'desktop:icon:created',
    ICON_DELETED: 'desktop:icon:deleted',
    ICON_RENAMED: 'desktop:icon:renamed',
    SELECTION_CLEARED: 'desktop:selection:cleared',
    WALLPAPER_CHANGED: 'desktop:wallpaper:changed',
    ARRANGED: 'desktop:arranged',
    REFRESHED: 'desktop:refreshed'
};

export const TaskbarEvents = {
    BUTTON_CLICKED: 'taskbar:button:clicked',
    BUTTON_RIGHT_CLICKED: 'taskbar:button:rightclicked',
    START_CLICKED: 'taskbar:start:clicked',
    START_OPENED: 'taskbar:start:opened',
    START_CLOSED: 'taskbar:start:closed',
    CLOCK_CLICKED: 'taskbar:clock:clicked',
    TRAY_ICON_CLICKED: 'taskbar:tray:icon:clicked',
    QUICKLAUNCH_CLICKED: 'taskbar:quicklaunch:clicked'
};

export const StartMenuEvents = {
    OPENED: 'startmenu:opened',
    CLOSED: 'startmenu:closed',
    ITEM_HOVERED: 'startmenu:item:hovered',
    ITEM_CLICKED: 'startmenu:item:clicked',
    SUBMENU_OPENED: 'startmenu:submenu:opened',
    PROGRAMS_OPENED: 'startmenu:programs:opened',
    SHUTDOWN_CLICKED: 'startmenu:shutdown:clicked',
    RUN_CLICKED: 'startmenu:run:clicked',
    FIND_CLICKED: 'startmenu:find:clicked'
};

export const ContextMenuEvents = {
    OPENED: 'contextmenu:opened',
    CLOSED: 'contextmenu:closed',
    ITEM_CLICKED: 'contextmenu:item:clicked',
    ITEM_HOVERED: 'contextmenu:item:hovered'
};

export const SystemEvents = {
    BOOT_STARTED: 'system:boot:started',
    BOOT_PHASE: 'system:boot:phase',
    BOOT_COMPLETED: 'system:boot:completed',
    SHUTDOWN_STARTED: 'system:shutdown:started',
    SHUTDOWN_COMPLETED: 'system:shutdown:completed',
    IDLE_STARTED: 'system:idle:started',
    IDLE_ENDED: 'system:idle:ended',
    ERROR: 'system:error',
    DIALOG_SHOWN: 'system:dialog:shown',
    DIALOG_CLOSED: 'system:dialog:closed',
    NOTIFICATION_SHOWN: 'system:notification:shown',
    NOTIFICATION_CLICKED: 'system:notification:clicked',
    NOTIFICATION_DISMISSED: 'system:notification:dismissed'
};

// =============================================================================
// GENERIC/CROSS-CUTTING EVENTS
// =============================================================================

export const GenericEvents = {
    FILE_OPENED: 'file:opened',
    FILE_SAVED: 'file:saved',
    INPUT_TYPED: 'input:typed',
    ACTION_PERFORMED: 'action:performed',
    SETTING_CHANGED: 'setting:changed'
};

// =============================================================================
// SCENARIO SYSTEM EVENTS
// =============================================================================

export const ScenarioEvents = {
    LOADED: 'scenario:loaded',
    STARTED: 'scenario:started',
    STAGE_ENTERED: 'scenario:stage:entered',
    STAGE_COMPLETED: 'scenario:stage:completed',
    TRIGGER_FIRED: 'scenario:trigger:fired',
    ACTION_EXECUTED: 'scenario:action:executed',
    CONDITION_CHECKED: 'scenario:condition:checked',
    HINT_SHOWN: 'scenario:hint:shown',
    COMPLETED: 'scenario:completed',
    FAILED: 'scenario:failed',
    ABORTED: 'scenario:aborted',
    PAUSED: 'scenario:paused',
    RESUMED: 'scenario:resumed',
    STATE_CHANGED: 'scenario:state:changed',
    VARIABLE_CHANGED: 'scenario:variable:changed'
};

// =============================================================================
// AGGREGATE EXPORT - All events in a single object
// =============================================================================

export const Events = {
    // Game Apps
    ...MinesweeperEvents,
    ...SnakeEvents,
    ...AsteroidsEvents,
    ...SolitaireEvents,
    ...FreeCellEvents,
    ...SkiFreeEvents,
    ...ZorkEvents,
    ...PaintEvents,
    ...DoomEvents,
    ...GameEvents,

    // Utility Apps
    ...NotepadEvents,
    ...CalculatorEvents,
    ...TerminalEvents,
    ...BrowserEvents,
    ...MediaPlayerEvents,
    ...WinampEvents,
    ...CalendarEvents,
    ...ClockEvents,
    ...ExplorerEvents,
    ...TaskManagerEvents,
    ...RecycleBinEvents,
    ...FindFilesEvents,
    ...DefragEvents,
    ...HelpEvents,
    ...ControlPanelEvents,
    ...DisplayPropertiesEvents,
    ...ChatRoomEvents,
    ...HyperCardEvents,

    // System Apps
    ...FeaturesSettingsEvents,
    ...SoundSettingsEvents,
    ...AdminPanelEvents,

    // Features
    ...AchievementEvents,
    ...SoundSystemEvents,
    ...ClippyEvents,
    ...DesktopPetEvents,
    ...ScreensaverEvents,
    ...EasterEggEvents,
    ...FeatureRegistryEvents,

    // Core Systems
    ...WindowEvents,
    ...FileSystemEvents,
    ...StateEvents,
    ...AppRegistryEvents,
    ...PluginEvents,

    // UI Components
    ...DesktopEvents,
    ...TaskbarEvents,
    ...StartMenuEvents,
    ...ContextMenuEvents,
    ...SystemEvents,

    // Generic
    ...GenericEvents,

    // Scenario System
    ...ScenarioEvents
};

// =============================================================================
// EVENT CATEGORIES - For documentation and tooling
// =============================================================================

export const EventCategories = {
    games: {
        minesweeper: MinesweeperEvents,
        snake: SnakeEvents,
        asteroids: AsteroidsEvents,
        solitaire: SolitaireEvents,
        freecell: FreeCellEvents,
        skifree: SkiFreeEvents,
        zork: ZorkEvents,
        paint: PaintEvents,
        doom: DoomEvents,
        generic: GameEvents
    },
    utilities: {
        notepad: NotepadEvents,
        calculator: CalculatorEvents,
        terminal: TerminalEvents,
        browser: BrowserEvents,
        mediaplayer: MediaPlayerEvents,
        winamp: WinampEvents,
        calendar: CalendarEvents,
        clock: ClockEvents,
        explorer: ExplorerEvents,
        taskmanager: TaskManagerEvents,
        recyclebin: RecycleBinEvents,
        findfiles: FindFilesEvents,
        defrag: DefragEvents,
        help: HelpEvents,
        controlpanel: ControlPanelEvents,
        display: DisplayPropertiesEvents,
        chatroom: ChatRoomEvents,
        hypercard: HyperCardEvents
    },
    system: {
        features: FeaturesSettingsEvents,
        sound: SoundSettingsEvents,
        admin: AdminPanelEvents
    },
    features: {
        achievement: AchievementEvents,
        soundsystem: SoundSystemEvents,
        clippy: ClippyEvents,
        pet: DesktopPetEvents,
        screensaver: ScreensaverEvents,
        easteregg: EasterEggEvents,
        registry: FeatureRegistryEvents
    },
    core: {
        window: WindowEvents,
        filesystem: FileSystemEvents,
        state: StateEvents,
        appregistry: AppRegistryEvents,
        plugin: PluginEvents
    },
    ui: {
        desktop: DesktopEvents,
        taskbar: TaskbarEvents,
        startmenu: StartMenuEvents,
        contextmenu: ContextMenuEvents,
        system: SystemEvents
    },
    generic: GenericEvents,
    scenario: ScenarioEvents
};

/**
 * Get all events for a specific app or component
 * @param {string} componentId - The component identifier (e.g., 'minesweeper', 'notepad')
 * @returns {Object|null} - Object with event constants or null if not found
 */
export function getEventsForComponent(componentId) {
    const id = componentId.toLowerCase();

    // Check all categories
    for (const category of Object.values(EventCategories)) {
        if (category[id]) {
            return category[id];
        }
    }

    return null;
}

/**
 * Check if an event name is a valid semantic event
 * @param {string} eventName - The event name to check
 * @returns {boolean} - True if valid
 */
export function isValidEvent(eventName) {
    return Object.values(Events).includes(eventName);
}

/**
 * Get the category for an event
 * @param {string} eventName - The event name
 * @returns {string|null} - Category name or null
 */
export function getEventCategory(eventName) {
    for (const [categoryName, category] of Object.entries(EventCategories)) {
        if (typeof category === 'object') {
            for (const events of Object.values(category)) {
                if (typeof events === 'object' && Object.values(events).includes(eventName)) {
                    return categoryName;
                }
            }
        }
    }
    return null;
}

export default Events;
