# RetrOS/IlluminatOS Architecture Improvement Plan

## Overview
This document outlines the plan to improve the underlying architecture with:
1. **Modular CSS Structure** - Breaking up the monolithic 4,803 line styles.css
2. **Semantic Event Architecture** - Enhancing EventBus for semantic, typed events

## Goals
- ✅ Improve maintainability and code organization
- ✅ Enable semantic communication between apps, features, system functions, and UI
- ✅ Make the codebase more scalable and easier to extend
- ✅ **DO NOT BREAK ANY EXISTING FUNCTIONALITY** (backward compatibility is critical)

---

## Part 1: CSS Modularization

### Current State
- Single `styles.css` file: **4,803 lines**
- Well-organized with section comments
- Covers: variables, layout, components, apps, effects, utilities

### Proposed Structure

```
styles/
├── main.css                    # Main entry point (imports all modules)
├── core/
│   ├── variables.css          # CSS custom properties, theme colors
│   ├── base.css               # Body, html, font imports, resets
│   └── display-properties.css # Animation toggles, shadows, smooth scroll
├── layout/
│   ├── desktop.css            # Desktop grid and layout
│   ├── taskbar.css            # Taskbar and system tray
│   ├── start-menu.css         # Start menu and submenus
│   └── context-menu.css       # Right-click context menus
├── components/
│   ├── windows.css            # Window frames, headers, borders
│   ├── buttons.css            # All button styles
│   ├── forms.css              # Input, select, checkbox, radio
│   ├── tabs.css               # Tab controls
│   ├── icons.css              # Icon system and sizing
│   ├── dialogs.css            # Dialog boxes, system dialogs
│   ├── tooltips.css           # Tooltip system
│   └── emoji-picker.css       # Emoji picker component
├── features/
│   ├── boot-screen.css        # Boot sequence animation
│   ├── clippy.css             # Clippy assistant
│   ├── desktop-pet.css        # Desktop pet
│   ├── screensaver.css        # Screensaver effects
│   ├── crt-effect.css         # CRT overlay effect
│   ├── achievements.css       # Achievement toasts
│   └── bsod.css               # Blue screen of death
├── apps/
│   ├── calculator.css         # Calculator app
│   ├── terminal.css           # Terminal app
│   ├── notepad.css            # Notepad app
│   ├── paint.css              # Paint app
│   ├── minesweeper.css        # Minesweeper game
│   ├── snake.css              # Snake game
│   ├── media-player.css       # Media player (Winamp)
│   ├── doom.css               # DOOM game + DOSBox
│   ├── asteroids.css          # Asteroids game
│   └── calendar.css           # Calendar popup
├── effects/
│   ├── animations.css         # All @keyframes and animations
│   └── color-schemes.css      # Desert, Ocean, Rose, Slate, High Contrast
└── utilities/
    └── helpers.css            # Utility classes, selection, drag indicators
```

### Migration Strategy

1. **Phase 1: Create directory structure**
   ```bash
   mkdir -p styles/{core,layout,components,features,apps,effects,utilities}
   ```

2. **Phase 2: Extract CSS by section**
   - Split styles.css into modules based on section comments
   - Preserve exact CSS rules (no changes to selectors/properties)
   - Maintain order of imports to preserve cascade

3. **Phase 3: Create main.css entry point**
   ```css
   /* Import order matters for CSS cascade */

   /* Core - must be first */
   @import url('core/variables.css');
   @import url('core/base.css');
   @import url('core/display-properties.css');

   /* Effects - color schemes */
   @import url('effects/color-schemes.css');

   /* Layout */
   @import url('layout/desktop.css');
   @import url('layout/taskbar.css');
   @import url('layout/start-menu.css');
   @import url('layout/context-menu.css');

   /* Components */
   @import url('components/icons.css');
   @import url('components/windows.css');
   @import url('components/buttons.css');
   @import url('components/forms.css');
   @import url('components/tabs.css');
   @import url('components/dialogs.css');
   @import url('components/tooltips.css');
   @import url('components/emoji-picker.css');

   /* Features */
   @import url('features/boot-screen.css');
   @import url('features/clippy.css');
   @import url('features/desktop-pet.css');
   @import url('features/screensaver.css');
   @import url('features/crt-effect.css');
   @import url('features/achievements.css');
   @import url('features/bsod.css');

   /* Apps */
   @import url('apps/calculator.css');
   @import url('apps/terminal.css');
   @import url('apps/notepad.css');
   @import url('apps/paint.css');
   @import url('apps/minesweeper.css');
   @import url('apps/snake.css');
   @import url('apps/media-player.css');
   @import url('apps/doom.css');
   @import url('apps/asteroids.css');
   @import url('apps/calendar.css');

   /* Effects - animations last */
   @import url('effects/animations.css');

   /* Utilities - last for highest specificity */
   @import url('utilities/helpers.css');
   ```

4. **Phase 4: Update index.html**
   ```html
   <!-- Old -->
   <link rel="stylesheet" href="styles.css">

   <!-- New -->
   <link rel="stylesheet" href="styles/main.css">
   ```

5. **Phase 5: Keep backup**
   ```bash
   mv styles.css styles.css.backup
   ```

6. **Phase 6: Test thoroughly**
   - Visual regression testing
   - Test all apps, features, UI components
   - Verify color schemes
   - Check responsive behavior

### Benefits
- ✅ Each file is 50-400 lines instead of 4,803
- ✅ Easy to find and edit specific component styles
- ✅ Clear separation of concerns
- ✅ Better for collaboration (fewer merge conflicts)
- ✅ Easier to add new app styles (just create new file)
- ✅ Can lazy-load CSS for specific apps in future

---

## Part 2: Semantic Event Architecture

### Current State
- EventBus.js provides basic pub/sub (on, emit, off, once)
- 25+ predefined string events: `'window:open'`, `'app:launch'`, etc.
- Events are loosely typed (just strings + data objects)
- No event validation or metadata
- No debugging/tracing tools

### Problems to Solve
1. **Type Safety**: Events are just strings, easy to typo
2. **Discoverability**: Hard to know what events exist
3. **Documentation**: Event payloads are undocumented
4. **Debugging**: Difficult to trace event flow
5. **Validation**: No way to validate event data
6. **Middleware**: No way to intercept/transform events
7. **Namespacing**: Flat namespace (window:open vs window.open)

### Proposed Semantic Event System

#### Event Schema Definition

```javascript
// core/EventSchema.js - Define all semantic events with metadata

const EventSchema = {
  // Window Events
  'window:create': {
    namespace: 'window',
    action: 'create',
    description: 'Triggered when a new window is created',
    payload: {
      id: 'string',           // Window ID
      title: 'string',        // Window title
      appId: 'string',        // Source app ID
      width: 'number',        // Window width
      height: 'number',       // Window height
      x: 'number?',           // Optional X position
      y: 'number?'            // Optional Y position
    },
    example: {
      id: 'window-123',
      title: 'Notepad',
      appId: 'notepad',
      width: 500,
      height: 400
    }
  },

  'window:open': {
    namespace: 'window',
    action: 'open',
    description: 'Triggered after window is opened and rendered',
    payload: {
      id: 'string',
      element: 'HTMLElement'
    }
  },

  'window:close': {
    namespace: 'window',
    action: 'close',
    description: 'Triggered when window is closing',
    payload: {
      id: 'string',
      appId: 'string'
    }
  },

  'window:focus': {
    namespace: 'window',
    action: 'focus',
    description: 'Triggered when window receives focus',
    payload: {
      id: 'string',
      previousId: 'string?'
    }
  },

  // App Events
  'app:launch': {
    namespace: 'app',
    action: 'launch',
    description: 'Request to launch an application',
    payload: {
      appId: 'string',
      params: 'object?'
    }
  },

  'app:open': {
    namespace: 'app',
    action: 'open',
    description: 'Triggered when app successfully opens',
    payload: {
      appId: 'string',
      windowId: 'string',
      instance: 'number'
    }
  },

  'app:close': {
    namespace: 'app',
    action: 'close',
    description: 'Triggered when app closes',
    payload: {
      appId: 'string',
      windowId: 'string'
    }
  },

  // System Events
  'system:boot': {
    namespace: 'system',
    action: 'boot',
    description: 'System boot sequence started',
    payload: {
      timestamp: 'number',
      phase: 'string'
    }
  },

  'system:ready': {
    namespace: 'system',
    action: 'ready',
    description: 'System fully initialized and ready',
    payload: {
      timestamp: 'number',
      bootTime: 'number'
    }
  },

  'system:shutdown': {
    namespace: 'system',
    action: 'shutdown',
    description: 'System shutdown initiated',
    payload: {
      reason: 'string'
    }
  },

  // UI Events
  'ui:menu:open': {
    namespace: 'ui',
    action: 'menu:open',
    description: 'Start menu opened',
    payload: {}
  },

  'ui:menu:close': {
    namespace: 'ui',
    action: 'menu:close',
    description: 'Start menu closed',
    payload: {}
  },

  'ui:context:show': {
    namespace: 'ui',
    action: 'context:show',
    description: 'Context menu shown',
    payload: {
      x: 'number',
      y: 'number',
      items: 'array',
      target: 'string?'
    }
  },

  // State Events
  'state:change': {
    namespace: 'state',
    action: 'change',
    description: 'State value changed',
    payload: {
      path: 'string',
      value: 'any',
      oldValue: 'any'
    }
  },

  // Feature Events
  'feature:enable': {
    namespace: 'feature',
    action: 'enable',
    description: 'Feature enabled',
    payload: {
      featureId: 'string'
    }
  },

  'feature:disable': {
    namespace: 'feature',
    action: 'disable',
    description: 'Feature disabled',
    payload: {
      featureId: 'string'
    }
  },

  // Sound Events
  'sound:play': {
    namespace: 'sound',
    action: 'play',
    description: 'Play a system sound',
    payload: {
      type: 'string',  // 'open', 'close', 'error', 'startup'
      volume: 'number?'
    }
  },

  // File System Events
  'fs:file:create': {
    namespace: 'fs',
    action: 'file:create',
    description: 'File created in virtual filesystem',
    payload: {
      path: 'string',
      type: 'string',
      content: 'any'
    }
  },

  'fs:file:update': {
    namespace: 'fs',
    action: 'file:update',
    description: 'File updated',
    payload: {
      path: 'string',
      content: 'any'
    }
  },

  'fs:file:delete': {
    namespace: 'fs',
    action: 'file:delete',
    description: 'File deleted',
    payload: {
      path: 'string'
    }
  }
};
```

#### Enhanced EventBus

```javascript
// core/SemanticEventBus.js - Enhanced EventBus with semantic events

class SemanticEventBus {
  constructor() {
    this.listeners = new Map();
    this.middleware = [];
    this.eventLog = []; // For debugging
    this.maxLogSize = 100;
    this.validationEnabled = true;
    this.loggingEnabled = false;
  }

  /**
   * Register middleware to intercept events
   * @param {Function} fn - Middleware function (event, next)
   */
  use(fn) {
    this.middleware.push(fn);
  }

  /**
   * Emit a semantic event
   * @param {string} eventName - Event name from EventSchema
   * @param {object} payload - Event payload
   * @param {object} options - { validate, log, metadata }
   */
  emit(eventName, payload = {}, options = {}) {
    const {
      validate = this.validationEnabled,
      log = this.loggingEnabled,
      metadata = {}
    } = options;

    // Validate event schema
    if (validate && EventSchema[eventName]) {
      const isValid = this._validatePayload(eventName, payload);
      if (!isValid) {
        console.warn(`[EventBus] Invalid payload for event "${eventName}"`, payload);
      }
    }

    // Create event object
    const event = {
      name: eventName,
      payload,
      metadata: {
        timestamp: Date.now(),
        source: metadata.source || 'unknown',
        ...metadata
      }
    };

    // Log event
    if (log) {
      this._logEvent(event);
    }

    // Run through middleware
    this._runMiddleware(event, () => {
      // Execute listeners
      const listeners = this.listeners.get(eventName);
      if (listeners) {
        listeners.forEach(listener => {
          try {
            listener(event.payload, event.metadata);
          } catch (error) {
            console.error(`[EventBus] Error in listener for "${eventName}":`, error);
          }
        });
      }
    });

    return event;
  }

  /**
   * Subscribe to an event
   * @param {string} eventName - Event name
   * @param {Function} callback - Callback function
   */
  on(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName).add(callback);
  }

  /**
   * Unsubscribe from an event
   */
  off(eventName, callback) {
    const listeners = this.listeners.get(eventName);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  /**
   * Subscribe once
   */
  once(eventName, callback) {
    const onceCallback = (...args) => {
      callback(...args);
      this.off(eventName, onceCallback);
    };
    this.on(eventName, onceCallback);
  }

  /**
   * Subscribe to events matching a pattern
   * @param {string} pattern - Glob pattern (e.g., 'window:*', 'app:*')
   */
  onPattern(pattern, callback) {
    const regex = this._patternToRegex(pattern);
    const wrappedCallback = (eventName) => {
      if (regex.test(eventName)) {
        callback(eventName);
      }
    };

    // Store pattern subscription
    if (!this._patternListeners) {
      this._patternListeners = new Map();
    }
    this._patternListeners.set(pattern, { regex, callback: wrappedCallback });

    // Subscribe to all matching events
    Object.keys(EventSchema).forEach(eventName => {
      if (regex.test(eventName)) {
        this.on(eventName, callback);
      }
    });
  }

  /**
   * Validate event payload against schema
   */
  _validatePayload(eventName, payload) {
    const schema = EventSchema[eventName];
    if (!schema || !schema.payload) return true;

    for (const [key, type] of Object.entries(schema.payload)) {
      const isOptional = type.endsWith('?');
      const baseType = isOptional ? type.slice(0, -1) : type;
      const value = payload[key];

      // Check if required field is missing
      if (!isOptional && value === undefined) {
        console.error(`[EventBus] Missing required field "${key}" for event "${eventName}"`);
        return false;
      }

      // Check type if value exists
      if (value !== undefined && !this._checkType(value, baseType)) {
        console.error(`[EventBus] Invalid type for field "${key}" in event "${eventName}". Expected ${baseType}, got ${typeof value}`);
        return false;
      }
    }

    return true;
  }

  /**
   * Check if value matches type
   */
  _checkType(value, type) {
    if (type === 'any') return true;
    if (type === 'array') return Array.isArray(value);
    if (type === 'object') return typeof value === 'object' && !Array.isArray(value);
    if (type === 'HTMLElement') return value instanceof HTMLElement;
    return typeof value === type;
  }

  /**
   * Run middleware chain
   */
  _runMiddleware(event, done) {
    let index = 0;

    const next = () => {
      if (index >= this.middleware.length) {
        done();
        return;
      }

      const middleware = this.middleware[index++];
      try {
        middleware(event, next);
      } catch (error) {
        console.error('[EventBus] Middleware error:', error);
        next();
      }
    };

    next();
  }

  /**
   * Log event to history
   */
  _logEvent(event) {
    this.eventLog.push(event);
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog.shift();
    }

    if (this.loggingEnabled) {
      console.log(`[EventBus] ${event.name}`, event.payload, event.metadata);
    }
  }

  /**
   * Convert glob pattern to regex
   */
  _patternToRegex(pattern) {
    const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    const regex = escaped.replace(/\*/g, '.*');
    return new RegExp(`^${regex}$`);
  }

  /**
   * Get event log (for debugging)
   */
  getEventLog() {
    return this.eventLog;
  }

  /**
   * Clear event log
   */
  clearEventLog() {
    this.eventLog = [];
  }

  /**
   * Get all registered events
   */
  getRegisteredEvents() {
    return Object.keys(EventSchema);
  }

  /**
   * Get event schema
   */
  getEventSchema(eventName) {
    return EventSchema[eventName];
  }
}

// Export singleton
const eventBus = new SemanticEventBus();
export default eventBus;
```

### Migration Strategy

1. **Phase 1: Create SemanticEventBus (backward compatible)**
   - Implement SemanticEventBus.js with EventSchema.js
   - Keep old EventBus.js intact
   - Make SemanticEventBus extend or wrap EventBus

2. **Phase 2: Add backward compatibility layer**
   ```javascript
   // Make new EventBus work with old code
   class SemanticEventBus {
     // ... new methods above ...

     // Backward compatible emit (accepts old string-only format)
     emit(eventName, payload, options) {
       // Support both old and new calling conventions
       if (typeof payload !== 'object' || payload === null) {
         payload = { data: payload };
       }

       // ... rest of emit logic
     }
   }
   ```

3. **Phase 3: Gradual migration**
   - Update core systems first (WindowManager, AppRegistry)
   - Then features (SoundSystem, ClippyAssistant)
   - Then apps (one at a time)
   - Keep both old and new events firing during transition

4. **Phase 4: Developer tools**
   ```javascript
   // Add global debugging helpers
   window.__ILLUMINATOS_DEBUG = {
     // Enable event logging
     enableEventLog: () => eventBus.loggingEnabled = true,

     // View event log
     showEventLog: () => console.table(eventBus.getEventLog()),

     // List all events
     listEvents: () => console.table(eventBus.getRegisteredEvents()),

     // Show event schema
     describeEvent: (name) => console.log(eventBus.getEventSchema(name))
   };
   ```

### Benefits

- ✅ **Type Safety**: All events defined in schema with payload types
- ✅ **Documentation**: Self-documenting event system
- ✅ **Validation**: Automatic payload validation
- ✅ **Debugging**: Event log and developer tools
- ✅ **Middleware**: Intercept/transform events (logging, analytics, etc.)
- ✅ **Patterns**: Subscribe to multiple events with wildcards (`window:*`)
- ✅ **Metadata**: Track event source, timestamp, custom metadata
- ✅ **Backward Compatible**: Old code continues to work
- ✅ **Discoverability**: Easy to see all available events
- ✅ **Testability**: Easy to mock and test event flows

---

## Implementation Order

### Week 1: CSS Modularization (Low Risk)
1. ✅ Create directory structure
2. ✅ Extract CSS into modules
3. ✅ Create main.css with imports
4. ✅ Update index.html
5. ✅ Test all functionality
6. ✅ Keep styles.css.backup

### Week 2: Semantic Event System Foundation
1. ✅ Create EventSchema.js
2. ✅ Create SemanticEventBus.js
3. ✅ Add backward compatibility
4. ✅ Add developer tools
5. ✅ Write tests

### Week 3: Core System Migration
1. ✅ Migrate WindowManager to semantic events
2. ✅ Migrate StateManager to semantic events
3. ✅ Migrate AppRegistry to semantic events
4. ✅ Test thoroughly

### Week 4: Feature Migration
1. ✅ Migrate SoundSystem
2. ✅ Migrate ClippyAssistant
3. ✅ Migrate other features
4. ✅ Test thoroughly

### Week 5: App Migration
1. ✅ Migrate 3-5 apps as proof of concept
2. ✅ Document migration pattern
3. ✅ Gradually migrate remaining apps

### Week 6: Cleanup & Documentation
1. ✅ Remove old EventBus (if fully migrated)
2. ✅ Update documentation
3. ✅ Performance testing
4. ✅ Final regression testing

---

## Success Criteria

✅ All existing functionality works exactly as before
✅ CSS is split into ~25 manageable files (<400 lines each)
✅ Events are semantically typed and validated
✅ Developer tools available for debugging events
✅ Documentation is complete and up-to-date
✅ No performance degradation
✅ Code is easier to maintain and extend

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| CSS cascade breaks | High | Preserve import order exactly, test thoroughly |
| Event changes break apps | High | Keep backward compatibility, gradual migration |
| Performance regression | Medium | Profile before/after, optimize if needed |
| Developer confusion | Low | Clear documentation, migration guides |

---

## Notes

- This is a **major architectural improvement** but done incrementally
- **Backward compatibility** is maintained throughout
- **Testing** at each phase is critical
- Can be done over several weeks without disrupting development
- Sets foundation for future improvements (TypeScript, build system, etc.)
