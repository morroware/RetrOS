# RetrOS Features Extensibility Plan

## Executive Summary

This plan transforms the RetrOS feature system to match the extensibility and architecture quality of the app system. Currently, features require manual imports, hard-coded initialization, and lack runtime configuration. This plan introduces a formal feature architecture with registry, lifecycle hooks, configuration, and plugin support.

---

## Current State Analysis

### What Works (App System Reference)
- ✅ **AppBase class** - Inheritance with lifecycle hooks
- ✅ **AppRegistry** - Central registration and management
- ✅ **Category system** - Automatic organization
- ✅ **Metadata** - Rich app information
- ✅ **Multi-instance support** - Per-window state isolation
- ✅ **Auto-cleanup** - Event handlers cleaned on close

### What Needs Improvement (Feature System)
- ❌ **No FeatureBase class** - Inconsistent patterns across features
- ❌ **No FeatureRegistry** - Manual imports in index.js
- ❌ **No configuration** - Hard-coded feature toggles
- ❌ **No enable/disable** - Cannot turn features on/off at runtime
- ❌ **No extension points** - Features cannot extend other features
- ❌ **No dependency management** - Manual initialization order
- ❌ **No plugin system** - Cannot add third-party features

---

## Architecture Goals

### 1. Mirror App System Excellence
- Features should be as easy to create as apps
- Consistent base class with lifecycle hooks
- Central registry for management
- Rich metadata and configuration

### 2. Enable Runtime Control
- Enable/disable features without code changes
- User preferences for feature toggles
- Feature settings UI in Settings app

### 3. Developer Experience
- Convention over configuration
- Minimal boilerplate
- Clear extension points
- Excellent documentation

### 4. Extensibility First
- Plugin architecture for third-party features
- Hook system for extending features
- Feature dependencies and ordering
- Configuration-driven behavior

---

## Proposed Architecture

### Core Components

```
/core/FeatureRegistry.js       # Central feature management
/core/FeatureBase.js           # Base class for all features
/features/config.json          # Feature metadata & configuration
/features/                     # Individual feature files (existing)
/plugins/features/             # Third-party feature plugins
```

---

## Phase 1: Core Infrastructure

### 1.1 Create FeatureBase Class

**File:** `/core/FeatureBase.js`

```javascript
class FeatureBase {
    constructor(metadata) {
        this.id = metadata.id;
        this.name = metadata.name;
        this.description = metadata.description;
        this.icon = metadata.icon;
        this.enabled = true;
        this.initialized = false;
        this.dependencies = metadata.dependencies || [];
        this.config = metadata.config || {};
    }

    // Lifecycle Hooks (to be overridden)
    async initialize() {
        // Feature initialization logic
        // EventBus subscriptions
        // Setup state
    }

    async enable() {
        // Enable feature at runtime
        if (!this.initialized) await this.initialize();
        this.enabled = true;
    }

    async disable() {
        // Disable feature at runtime
        this.cleanup();
        this.enabled = false;
    }

    cleanup() {
        // Cleanup resources
        // Unsubscribe from events
        // Remove DOM elements
    }

    getConfig(key, defaultValue) {
        // Access feature configuration
        return this.config[key] ?? defaultValue;
    }

    setConfig(key, value) {
        // Update feature configuration
        this.config[key] = value;
        StateManager.setFeatureConfig(this.id, key, value);
    }

    // Helper: Check if feature should run
    isEnabled() {
        return this.enabled;
    }

    // Helper: Check if dependencies are met
    checkDependencies() {
        return this.dependencies.every(dep =>
            FeatureRegistry.isEnabled(dep)
        );
    }

    // Extension Points
    registerHook(hookName, handler) {
        // Allow other features to hook into this feature
    }

    triggerHook(hookName, data) {
        // Trigger registered hooks
    }
}
```

**Benefits:**
- Consistent lifecycle across all features
- Built-in enable/disable support
- Configuration management
- Dependency checking
- Extension point system

---

### 1.2 Create FeatureRegistry

**File:** `/core/FeatureRegistry.js`

```javascript
class FeatureRegistryClass {
    constructor() {
        this.features = new Map();        // id -> FeatureBase instance
        this.metadata = new Map();        // id -> metadata
        this.hooks = new Map();           // hookName -> [handlers]
        this.initOrder = [];              // Dependency-sorted init order
    }

    // Registration
    register(feature, metadata) {
        this.features.set(feature.id, feature);
        this.metadata.set(feature.id, metadata);
    }

    registerAll(features) {
        features.forEach(f => this.register(f, f.metadata));
    }

    // Initialization (dependency-aware)
    async initializeAll() {
        // Sort by dependencies
        this.initOrder = this.resolveDependencies();

        // Initialize in order
        for (const featureId of this.initOrder) {
            const feature = this.features.get(featureId);
            if (feature && this.isEnabled(featureId)) {
                await feature.initialize();
            }
        }
    }

    // Runtime Control
    async enable(featureId) {
        const feature = this.features.get(featureId);
        if (!feature) throw new Error(`Feature ${featureId} not found`);

        await feature.enable();
        StateManager.setFeatureSetting(featureId, 'enabled', true);
        EventBus.emit('feature:enabled', { featureId });
    }

    async disable(featureId) {
        const feature = this.features.get(featureId);
        if (!feature) throw new Error(`Feature ${featureId} not found`);

        await feature.disable();
        StateManager.setFeatureSetting(featureId, 'enabled', false);
        EventBus.emit('feature:disabled', { featureId });
    }

    // Queries
    isEnabled(featureId) {
        const feature = this.features.get(featureId);
        return feature?.isEnabled() ?? false;
    }

    getAll() {
        return Array.from(this.metadata.values());
    }

    getByCategory(category) {
        return Array.from(this.metadata.values())
            .filter(m => m.category === category);
    }

    get(featureId) {
        return this.features.get(featureId);
    }

    // Dependency Resolution
    resolveDependencies() {
        // Topological sort for dependency order
        // Returns: ['core', 'soundsystem', 'achievements', ...]
    }

    // Hook System
    registerGlobalHook(hookName, handler) {
        if (!this.hooks.has(hookName)) {
            this.hooks.set(hookName, []);
        }
        this.hooks.get(hookName).push(handler);
    }

    triggerGlobalHook(hookName, data) {
        const handlers = this.hooks.get(hookName) || [];
        handlers.forEach(handler => handler(data));
    }
}

const FeatureRegistry = new FeatureRegistryClass();
export default FeatureRegistry;
```

**Benefits:**
- Central feature management (like AppRegistry)
- Dependency-aware initialization
- Runtime enable/disable
- Hook system for extensibility
- Category-based organization

---

### 1.3 Feature Metadata Configuration

**File:** `/features/config.json`

```json
{
  "soundsystem": {
    "id": "soundsystem",
    "name": "Sound System",
    "description": "Centralized audio management with MP3 support and synthesized fallbacks",
    "icon": "🔊",
    "category": "core",
    "enabled": true,
    "dependencies": [],
    "config": {
      "masterVolume": 1.0,
      "enableMp3": true,
      "enableFallbacks": true
    },
    "settings": [
      {
        "key": "masterVolume",
        "label": "Master Volume",
        "type": "slider",
        "min": 0,
        "max": 1,
        "step": 0.1
      },
      {
        "key": "enableMp3",
        "label": "Enable MP3 Sounds",
        "type": "checkbox"
      }
    ]
  },

  "achievements": {
    "id": "achievements",
    "name": "Achievement System",
    "description": "Unlock achievements and track milestones",
    "icon": "🏆",
    "category": "enhancement",
    "enabled": true,
    "dependencies": ["soundsystem"],
    "config": {
      "showToasts": true,
      "toastDuration": 3000,
      "playSound": true
    }
  },

  "clippy": {
    "id": "clippy",
    "name": "Clippy Assistant",
    "description": "Context-aware help from Clippy",
    "icon": "📎",
    "category": "enhancement",
    "enabled": true,
    "dependencies": ["soundsystem"],
    "config": {
      "appearanceChance": 0.15,
      "autoHideDelay": 8000,
      "showHints": true
    },
    "settings": [
      {
        "key": "enabled",
        "label": "Enable Clippy",
        "type": "checkbox",
        "description": "Show/hide the Clippy assistant"
      },
      {
        "key": "appearanceChance",
        "label": "Appearance Frequency",
        "type": "slider",
        "min": 0,
        "max": 1,
        "step": 0.05,
        "description": "How often Clippy appears (0 = never, 1 = always)"
      }
    ]
  },

  "eastereggs": {
    "id": "eastereggs",
    "name": "Easter Eggs",
    "description": "Hidden surprises and secrets",
    "icon": "🥚",
    "category": "enhancement",
    "enabled": true,
    "dependencies": ["achievements"],
    "config": {
      "enableKonami": true,
      "enableSecrets": true
    }
  },

  "desktoppet": {
    "id": "desktoppet",
    "name": "Desktop Pet",
    "description": "Animated desktop companion",
    "icon": "🐱",
    "category": "enhancement",
    "enabled": true,
    "dependencies": [],
    "config": {
      "petType": "cat",
      "animationSpeed": 1.0
    },
    "settings": [
      {
        "key": "enabled",
        "label": "Enable Desktop Pet",
        "type": "checkbox"
      },
      {
        "key": "petType",
        "label": "Pet Type",
        "type": "select",
        "options": ["cat", "dog", "bird", "fish"]
      }
    ]
  },

  "screensaver": {
    "id": "screensaver",
    "name": "Screensaver",
    "description": "Idle screensaver with multiple modes",
    "icon": "🌌",
    "category": "core",
    "enabled": true,
    "dependencies": [],
    "config": {
      "idleTimeout": 300000,
      "mode": "starfield"
    },
    "settings": [
      {
        "key": "enabled",
        "label": "Enable Screensaver",
        "type": "checkbox"
      },
      {
        "key": "idleTimeout",
        "label": "Idle Time (seconds)",
        "type": "number",
        "min": 60,
        "max": 3600,
        "transform": "seconds"
      },
      {
        "key": "mode",
        "label": "Screensaver Mode",
        "type": "select",
        "options": ["starfield", "matrix", "pipes", "maze"]
      }
    ]
  },

  "systemdialogs": {
    "id": "systemdialogs",
    "name": "System Dialogs",
    "description": "Modal dialogs for file operations and alerts",
    "icon": "💬",
    "category": "core",
    "enabled": true,
    "dependencies": [],
    "config": {
      "defaultPath": "/Desktop",
      "showHiddenFiles": false
    }
  }
}
```

**Benefits:**
- Centralized feature configuration
- User-facing settings definitions
- Dependency declarations
- Enable/disable defaults
- Rich metadata for UI generation

---

## Phase 2: Refactor Existing Features

### 2.1 Migrate Features to FeatureBase

**Example:** Refactor SoundSystem

**Before:** `/features/SoundSystem.js` (current)
```javascript
class SoundSystemClass {
    constructor() {
        this.audioContext = null;
        // ...
    }

    initialize() {
        console.log('[SoundSystem] Initializing...');
        // ...
    }
}

const SoundSystem = new SoundSystemClass();
export default SoundSystem;
```

**After:** `/features/SoundSystem.js` (new)
```javascript
import FeatureBase from '../core/FeatureBase.js';
import config from './config.json' assert { type: 'json' };

class SoundSystem extends FeatureBase {
    constructor() {
        super(config.soundsystem);
        this.audioContext = null;
        this.soundConfig = { /* ... */ };
    }

    async initialize() {
        if (!this.isEnabled()) return;

        console.log('[SoundSystem] Initializing...');

        // Load config
        this.masterVolume = this.getConfig('masterVolume', 1.0);

        // Setup audio context
        this.setupAudioContext();

        // EventBus subscriptions (auto-tracked for cleanup)
        this.subscribe('sound:play', this.handlePlaySound);

        this.initialized = true;
    }

    cleanup() {
        // Close audio context
        if (this.audioContext) {
            this.audioContext.close();
        }

        // Cleanup is automatic via FeatureBase
    }

    // Feature-specific methods
    play(type, force = false) {
        if (!this.isEnabled()) return;
        // ... existing logic
    }

    registerSound(type, config) {
        this.soundConfig[type] = config;
        this.triggerHook('sound:registered', { type, config });
    }
}

export default new SoundSystem();
```

**Migration Checklist for Each Feature:**
- [ ] Extend FeatureBase instead of plain class
- [ ] Use `super(config.featureid)` in constructor
- [ ] Move initialization to `initialize()` method
- [ ] Add `cleanup()` method for resource cleanup
- [ ] Use `getConfig()` / `setConfig()` for settings
- [ ] Check `isEnabled()` before running logic
- [ ] Add hooks for extensibility
- [ ] Export singleton instance

---

### 2.2 Update Index.js to Use FeatureRegistry

**Before:** `/index.js` (lines 167-176)
```javascript
// Phase 2: Features
console.log('[RetrOS] Phase 2: Features');
onProgress(35, 'Loading features...');
initComponent('SoundSystem', () => SoundSystem.initialize());
initComponent('AchievementSystem', () => AchievementSystem.initialize());
initComponent('EasterEggs', () => EasterEggs.initialize());
initComponent('ClippyAssistant', () => ClippyAssistant.initialize());
initComponent('DesktopPet', () => DesktopPet.initialize());
initComponent('Screensaver', () => Screensaver.initialize());
initComponent('SystemDialogs', () => SystemDialogs.initialize());
```

**After:** `/index.js` (new)
```javascript
// Phase 2: Features
console.log('[RetrOS] Phase 2: Features');
onProgress(35, 'Loading features...');

// Initialize FeatureRegistry (auto-discovers and loads all features)
await initComponent('FeatureRegistry', async () => {
    await FeatureRegistry.initialize();
});
```

**Benefits:**
- Single line initialization
- Automatic dependency ordering
- Respects enable/disable settings
- No manual imports needed

---

## Phase 3: Feature Settings UI

### 3.1 Create FeaturesSettings App

**File:** `/apps/FeaturesSettings.js`

```javascript
class FeaturesSettings extends AppBase {
    constructor() {
        super({
            id: 'features-settings',
            name: 'Features',
            icon: '⚙️',
            width: 600,
            height: 500,
            category: 'settings'
        });
    }

    onOpen() {
        const features = FeatureRegistry.getAll();

        return `
            <div class="features-settings">
                <div class="categories">
                    ${this.renderCategories(features)}
                </div>
                <div class="feature-list">
                    ${this.renderFeatureList(features)}
                </div>
            </div>
        `;
    }

    renderFeatureList(features) {
        return features.map(f => `
            <div class="feature-card ${f.enabled ? 'enabled' : 'disabled'}">
                <div class="feature-header">
                    <span class="feature-icon">${f.icon}</span>
                    <h3>${f.name}</h3>
                    <label class="toggle">
                        <input type="checkbox"
                               ${f.enabled ? 'checked' : ''}
                               data-feature="${f.id}">
                        <span class="slider"></span>
                    </label>
                </div>
                <p class="feature-description">${f.description}</p>

                ${f.settings ? this.renderSettings(f) : ''}
            </div>
        `).join('');
    }

    renderSettings(feature) {
        return `
            <div class="feature-settings">
                ${feature.settings.map(setting =>
                    this.renderSetting(feature.id, setting)
                ).join('')}
            </div>
        `;
    }

    renderSetting(featureId, setting) {
        switch (setting.type) {
            case 'checkbox':
                return `<label>
                    <input type="checkbox"
                           data-feature="${featureId}"
                           data-key="${setting.key}">
                    ${setting.label}
                </label>`;

            case 'slider':
                return `<label>
                    ${setting.label}
                    <input type="range"
                           min="${setting.min}"
                           max="${setting.max}"
                           step="${setting.step}"
                           data-feature="${featureId}"
                           data-key="${setting.key}">
                </label>`;

            case 'select':
                return `<label>
                    ${setting.label}
                    <select data-feature="${featureId}"
                            data-key="${setting.key}">
                        ${setting.options.map(opt =>
                            `<option value="${opt}">${opt}</option>`
                        ).join('')}
                    </select>
                </label>`;

            default:
                return '';
        }
    }

    onMount() {
        // Handle feature toggle
        this.addHandler('.toggle input', 'change', async (e) => {
            const featureId = e.target.dataset.feature;
            const enabled = e.target.checked;

            if (enabled) {
                await FeatureRegistry.enable(featureId);
            } else {
                await FeatureRegistry.disable(featureId);
            }
        });

        // Handle setting changes
        this.addHandler('.feature-settings input, .feature-settings select',
                       'change', (e) => {
            const featureId = e.target.dataset.feature;
            const key = e.target.dataset.key;
            const value = e.target.type === 'checkbox' ?
                         e.target.checked : e.target.value;

            const feature = FeatureRegistry.get(featureId);
            feature.setConfig(key, value);
        });
    }
}
```

**Benefits:**
- GUI for enabling/disabling features
- Live configuration editing
- Category organization
- Settings auto-generated from config.json

---

## Phase 4: Plugin System

### 4.1 Plugin Architecture

**File:** `/core/PluginLoader.js`

```javascript
class PluginLoaderClass {
    constructor() {
        this.plugins = new Map();
        this.pluginFeatures = new Map();
    }

    async loadPlugin(pluginPath) {
        try {
            // Dynamic import
            const plugin = await import(pluginPath);

            // Validate plugin structure
            if (!plugin.default || !plugin.default.id) {
                throw new Error('Invalid plugin structure');
            }

            // Register plugin
            this.plugins.set(plugin.default.id, plugin.default);

            // If plugin provides features, register them
            if (plugin.default.features) {
                plugin.default.features.forEach(feature => {
                    FeatureRegistry.register(feature);
                    this.pluginFeatures.set(feature.id, plugin.default.id);
                });
            }

            console.log(`[PluginLoader] Loaded plugin: ${plugin.default.id}`);
            return true;
        } catch (error) {
            console.error(`[PluginLoader] Failed to load ${pluginPath}:`, error);
            return false;
        }
    }

    async loadAllPlugins() {
        // Load from /plugins/features/
        const pluginPaths = await this.discoverPlugins();

        for (const path of pluginPaths) {
            await this.loadPlugin(path);
        }
    }

    async discoverPlugins() {
        // In production: read from manifest
        // In dev: dynamic discovery
        const manifest = StateManager.getPluginManifest();
        return manifest?.features || [];
    }

    unloadPlugin(pluginId) {
        const plugin = this.plugins.get(pluginId);
        if (!plugin) return;

        // Disable all features from this plugin
        plugin.features?.forEach(feature => {
            FeatureRegistry.disable(feature.id);
        });

        this.plugins.delete(pluginId);
    }
}

const PluginLoader = new PluginLoaderClass();
export default PluginLoader;
```

---

### 4.2 Plugin Example

**File:** `/plugins/features/weather-widget/index.js`

```javascript
import FeatureBase from '../../../core/FeatureBase.js';

class WeatherWidget extends FeatureBase {
    constructor() {
        super({
            id: 'weather-widget',
            name: 'Weather Widget',
            description: 'Shows current weather in taskbar',
            icon: '🌤️',
            category: 'enhancement',
            dependencies: [],
            config: {
                location: 'San Francisco',
                units: 'fahrenheit',
                updateInterval: 600000  // 10 minutes
            }
        });
    }

    async initialize() {
        console.log('[WeatherWidget] Initializing...');

        // Add weather widget to taskbar
        this.createWidget();

        // Start update interval
        this.updateWeather();
        this.interval = setInterval(
            () => this.updateWeather(),
            this.getConfig('updateInterval')
        );
    }

    createWidget() {
        const taskbar = document.querySelector('.taskbar');
        const widget = document.createElement('div');
        widget.className = 'weather-widget';
        widget.id = 'weather-widget';
        taskbar.appendChild(widget);
    }

    async updateWeather() {
        // Fetch weather data
        // Update widget
    }

    cleanup() {
        clearInterval(this.interval);
        document.getElementById('weather-widget')?.remove();
    }
}

// Plugin export structure
export default {
    id: 'weather-widget-plugin',
    name: 'Weather Widget Plugin',
    version: '1.0.0',
    author: 'Third Party',
    features: [
        new WeatherWidget()
    ]
};
```

**Plugin Installation:**
1. User downloads plugin to `/plugins/features/weather-widget/`
2. Adds entry to plugin manifest
3. On next boot, PluginLoader auto-discovers and loads
4. Feature appears in FeaturesSettings app
5. User can enable/disable like any other feature

---

## Phase 5: Advanced Extensibility

### 5.1 Hook System

**Global Hooks Available:**

```javascript
// Feature lifecycle hooks
FeatureRegistry.registerGlobalHook('feature:before-init', (data) => {
    console.log(`Feature ${data.featureId} initializing...`);
});

FeatureRegistry.registerGlobalHook('feature:after-init', (data) => {
    console.log(`Feature ${data.featureId} initialized`);
});

FeatureRegistry.registerGlobalHook('feature:enabled', (data) => {
    // React to feature being enabled
});

FeatureRegistry.registerGlobalHook('feature:disabled', (data) => {
    // React to feature being disabled
});

// Feature-specific hooks (example from SoundSystem)
const soundSystem = FeatureRegistry.get('soundsystem');
soundSystem.registerHook('sound:registered', (data) => {
    console.log(`New sound registered: ${data.type}`);
});
```

**Use Cases:**
- Analytics/telemetry features can hook all events
- Debug features can log feature lifecycle
- Third-party features can extend existing features

---

### 5.2 Feature Categories

```javascript
export const FEATURE_CATEGORIES = {
    CORE: 'core',           // Essential system features
    ENHANCEMENT: 'enhancement',  // Optional enhancements
    PLUGIN: 'plugin'        // Third-party plugins
};
```

**Benefits:**
- Organize features in Settings UI
- Different enable/disable rules (can't disable core)
- Clear separation of concerns

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
**Goal:** Core infrastructure without breaking existing code

1. ✅ Create `/core/FeatureBase.js`
2. ✅ Create `/core/FeatureRegistry.js`
3. ✅ Create `/features/config.json`
4. ✅ Add tests for new classes
5. ✅ Update documentation

**Deliverable:** FeatureBase and FeatureRegistry working in parallel with old system

---

### Phase 2: Migration (Week 1-2)
**Goal:** Migrate all features to new architecture

1. ✅ Migrate SoundSystem (most complex)
2. ✅ Migrate AchievementSystem
3. ✅ Migrate SystemDialogs
4. ✅ Migrate Screensaver
5. ✅ Migrate ClippyAssistant
6. ✅ Migrate DesktopPet
7. ✅ Migrate EasterEggs
8. ✅ Update index.js to use FeatureRegistry
9. ✅ Test all features work identically

**Deliverable:** All features using new system, old code removed

---

### Phase 3: Settings UI (Week 2)
**Goal:** User-facing feature management

1. ✅ Create FeaturesSettings app
2. ✅ Implement toggle switches for enable/disable
3. ✅ Implement configuration controls
4. ✅ Add to Settings category in Start Menu
5. ✅ Persist settings to StateManager

**Deliverable:** Users can enable/disable features via GUI

---

### Phase 4: Plugin System (Week 3)
**Goal:** Third-party extensibility

1. ✅ Create `/core/PluginLoader.js`
2. ✅ Define plugin manifest structure
3. ✅ Implement plugin discovery
4. ✅ Add plugin installation UI (optional)
5. ✅ Create example plugin
6. ✅ Document plugin development

**Deliverable:** Working plugin system with example

---

### Phase 5: Advanced Features (Week 3-4)
**Goal:** Advanced extensibility features

1. ✅ Implement hook system
2. ✅ Add feature dependency resolution
3. ✅ Create feature debugging tools
4. ✅ Add hot-reload for development
5. ✅ Performance optimization

**Deliverable:** Production-ready feature system

---

## Developer Experience

### Creating a New Feature (After Implementation)

**Step 1:** Create feature file

```javascript
// features/MyFeature.js
import FeatureBase from '../core/FeatureBase.js';

class MyFeature extends FeatureBase {
    async initialize() {
        console.log('MyFeature initialized!');
    }
}

export default new MyFeature();
```

**Step 2:** Add to config.json

```json
{
  "myfeature": {
    "id": "myfeature",
    "name": "My Feature",
    "description": "Does something awesome",
    "icon": "✨",
    "category": "enhancement",
    "enabled": true,
    "dependencies": [],
    "config": {}
  }
}
```

**Step 3:** Add to FeatureRegistry initialization

```javascript
// core/FeatureRegistry.js
import MyFeature from '../features/MyFeature.js';

initialize() {
    this.registerAll([
        SoundSystem,
        AchievementSystem,
        MyFeature,  // <-- Add here
        // ...
    ]);
}
```

**That's it!** The feature will:
- ✅ Auto-initialize in dependency order
- ✅ Appear in FeaturesSettings app
- ✅ Support enable/disable
- ✅ Persist settings
- ✅ Integrate with hook system

---

### Creating a Plugin (After Implementation)

**Step 1:** Create plugin directory
```
/plugins/features/my-plugin/
  ├── index.js           (plugin entry point)
  ├── MyFeature.js       (feature implementation)
  └── README.md          (plugin docs)
```

**Step 2:** Implement feature
```javascript
// MyFeature.js
import FeatureBase from '../../../core/FeatureBase.js';

class MyFeature extends FeatureBase {
    // ... implementation
}

export default MyFeature;
```

**Step 3:** Create plugin manifest
```javascript
// index.js
import MyFeature from './MyFeature.js';

export default {
    id: 'my-plugin',
    name: 'My Plugin',
    version: '1.0.0',
    author: 'Me',
    features: [
        new MyFeature()
    ]
};
```

**Step 4:** Install plugin
- Copy to `/plugins/features/my-plugin/`
- Plugin auto-loads on next boot
- Appears in FeaturesSettings

---

## Benefits Summary

### For Users
- ✅ **Control:** Enable/disable features via GUI
- ✅ **Customization:** Configure feature settings
- ✅ **Performance:** Disable unused features
- ✅ **Extensibility:** Install third-party plugins

### For Developers
- ✅ **Consistency:** All features follow same pattern
- ✅ **Simplicity:** Minimal boilerplate via FeatureBase
- ✅ **Power:** Lifecycle hooks, configuration, dependencies
- ✅ **Extensibility:** Hook system for advanced use cases
- ✅ **Documentation:** Clear patterns and examples

### For Maintainers
- ✅ **Organized:** Features auto-register, no manual imports
- ✅ **Testable:** Each feature is isolated and mockable
- ✅ **Debuggable:** Feature lifecycle is traceable
- ✅ **Scalable:** Easy to add new features
- ✅ **Maintainable:** Consistent architecture reduces bugs

---

## Risks & Mitigations

### Risk: Breaking Changes
**Mitigation:**
- Implement alongside existing system first
- Migrate one feature at a time
- Comprehensive testing at each step

### Risk: Performance Overhead
**Mitigation:**
- FeatureBase is lightweight
- Lazy initialization only for enabled features
- Benchmark before/after

### Risk: Complexity for Simple Features
**Mitigation:**
- FeatureBase handles boilerplate
- Minimal required implementation
- Clear examples and templates

### Risk: Plugin Security
**Mitigation:**
- Plugin sandboxing (future)
- Clear plugin API boundaries
- User must explicitly enable plugins

---

## Success Metrics

### Technical Metrics
- ✅ All 7 features migrated to FeatureBase
- ✅ Zero regressions in functionality
- ✅ Feature toggle response time < 100ms
- ✅ Boot time not impacted (within 5%)

### Developer Experience Metrics
- ✅ Lines of code to create feature < 50
- ✅ Time to create new feature < 30 minutes
- ✅ Developer documentation coverage 100%

### User Experience Metrics
- ✅ Feature settings accessible in < 3 clicks
- ✅ Feature enable/disable instant feedback
- ✅ Settings persist across sessions

---

## Future Enhancements

### Phase 6: Advanced Features (Future)
- Hot-reload features in development
- Feature marketplace/browser
- Feature analytics (usage tracking)
- A/B testing framework
- Feature flag system for gradual rollouts
- Inter-feature communication bus
- Feature state persistence/export
- Feature version management
- Automatic dependency installation

### Phase 7: Developer Tools (Future)
- Feature development CLI
- Feature generator/scaffolding
- Feature testing framework
- Feature performance profiler
- Feature documentation generator

---

## Comparison: Before vs After

### Before (Current State)

**To add a new feature:**
1. Create `/features/MyFeature.js`
2. Export singleton instance
3. Manually import in `/index.js`
4. Add to initialization sequence
5. Manually manage init order for dependencies
6. Hope you got the order right

**Feature code:**
```javascript
class MyFeatureClass {
    constructor() { /* setup */ }
    initialize() { /* init */ }
}
const MyFeature = new MyFeatureClass();
export default MyFeature;
```

**No runtime control:**
- Cannot disable features
- Cannot configure features
- No settings UI
- Hard-coded behavior

---

### After (Proposed State)

**To add a new feature:**
1. Create `/features/MyFeature.js` extending FeatureBase
2. Add metadata to `/features/config.json`
3. Add to FeatureRegistry initialization
4. **Done!** Auto-initialized in dependency order

**Feature code:**
```javascript
class MyFeature extends FeatureBase {
    async initialize() { /* init */ }
    cleanup() { /* cleanup */ }
}
export default new MyFeature();
```

**Full runtime control:**
- ✅ Enable/disable via GUI
- ✅ Configure via settings
- ✅ Settings auto-generated
- ✅ Plugin system ready
- ✅ Hook system for extensions

---

## Documentation Updates Required

1. **DEVELOPER_GUIDE.md**
   - Add "Creating Features" section
   - Add "Feature Architecture" section
   - Add code examples

2. **ARCHITECTURE.md**
   - Document FeatureBase class
   - Document FeatureRegistry
   - Add architecture diagrams

3. **PLUGIN_DEVELOPMENT.md** (new)
   - Plugin structure
   - Plugin API reference
   - Example plugins
   - Best practices

4. **FEATURES_REFERENCE.md** (new)
   - List all features
   - Configuration options
   - Dependencies
   - Extension points

---

## Conclusion

This plan transforms the RetrOS feature system from a manually-managed collection of singletons into a robust, extensible, plugin-ready architecture that matches the quality of the app system.

**Key Principles:**
1. **Mirror App System Excellence** - Features get the same love as apps
2. **Developer Happiness** - Easy to create, extend, and maintain
3. **User Empowerment** - Runtime control via GUI
4. **Extensibility First** - Plugin system from day one

**Timeline:** ~3-4 weeks for full implementation

**Effort:** Medium (leverages existing patterns from app system)

**Impact:** HIGH - Unlocks community contributions via plugins, improves maintainability, enhances user control

---

**Ready to proceed? Let's start with Phase 1: Foundation! 🚀**
