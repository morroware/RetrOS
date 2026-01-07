/**
 * AutoexecLoader - Run startup scripts automatically
 *
 * Checks for autoexec.retro files in standard locations
 * and executes the first one found during system boot.
 *
 * Autoexec File Locations (checked in order):
 *   1. C:/Windows/autoexec.retro - System-level startup
 *   2. C:/Scripts/autoexec.retro - User scripts folder
 *   3. C:/Users/User/autoexec.retro - User home folder
 */

// Import the main (legacy) ScriptEngine for compatibility
import ScriptEngine from '../ScriptEngine.js';
import { DEFAULT_LIMITS } from './utils/SafetyLimits.js';

/**
 * Paths to check for autoexec scripts (in order)
 */
const AUTOEXEC_PATHS = [
    'C:/Windows/autoexec.retro',
    'C:/Scripts/autoexec.retro',
    'C:/Users/User/autoexec.retro'
];

/**
 * Autoexec execution options
 */
const AUTOEXEC_OPTIONS = {
    timeout: DEFAULT_LIMITS.AUTOEXEC_TIMEOUT, // 10 second timeout
    variables: {
        AUTOEXEC: true,
        BOOT_TIME: Date.now()
    }
};

/**
 * Run autoexec script if one exists
 * @param {Object} context - System context with FileSystemManager, EventBus, etc.
 * @returns {Object|null} Execution result or null if no autoexec found
 */
export async function runAutoexec(context = {}) {
    const FileSystemManager = context.FileSystemManager;
    const EventBus = context.EventBus;

    if (!FileSystemManager) {
        console.warn('[AutoexecLoader] FileSystemManager not available, skipping autoexec');
        return null;
    }

    for (const path of AUTOEXEC_PATHS) {
        try {
            // Check if file exists
            const exists = FileSystemManager.exists(path);

            if (exists) {
                console.log(`[AutoexecLoader] Found autoexec script: ${path}`);

                // Emit start event
                if (EventBus) {
                    EventBus.emit('autoexec:start', { path, timestamp: Date.now() });
                }

                // Execute the script using legacy ScriptEngine API
                // The legacy ScriptEngine.runFile takes (path, context) not (path, options)
                const execContext = {
                    ...context,
                    AUTOEXEC: true,
                    BOOT_TIME: Date.now()
                };

                const result = await ScriptEngine.runFile(path, execContext);

                if (result.success) {
                    console.log(`[AutoexecLoader] Autoexec completed successfully`);

                    if (EventBus) {
                        EventBus.emit('autoexec:complete', {
                            path,
                            success: true,
                            timestamp: Date.now()
                        });
                    }
                } else {
                    console.error(`[AutoexecLoader] Autoexec failed:`, result.error);

                    if (EventBus) {
                        EventBus.emit('autoexec:error', {
                            path,
                            error: result.error,
                            timestamp: Date.now()
                        });
                    }
                }

                // Only run the first found autoexec
                return result;
            }
        } catch (error) {
            console.error(`[AutoexecLoader] Error checking ${path}:`, error);
        }
    }

    console.log('[AutoexecLoader] No autoexec.retro found');
    return null;
}

/**
 * Check if any autoexec file exists
 * @param {Object} context - System context
 * @returns {string|null} Path to first found autoexec or null
 */
export function findAutoexec(context = {}) {
    const FileSystemManager = context.FileSystemManager;

    if (!FileSystemManager) {
        return null;
    }

    for (const path of AUTOEXEC_PATHS) {
        try {
            if (FileSystemManager.exists(path)) {
                return path;
            }
        } catch (error) {
            // Ignore errors and continue checking
        }
    }

    return null;
}

/**
 * Create a sample autoexec file
 * @param {Object} context - System context
 * @param {string} [path] - Path to create (defaults to C:/Windows/autoexec.retro)
 * @param {string} [content] - Script content
 */
export function createSampleAutoexec(context = {}, path = 'C:/Windows/autoexec.retro', content = null) {
    const FileSystemManager = context.FileSystemManager;

    if (!FileSystemManager) {
        console.warn('[AutoexecLoader] Cannot create autoexec: FileSystemManager not available');
        return false;
    }

    const defaultContent = `# ═══════════════════════════════════════════════════════════
# RetrOS Autoexec Script
# This script runs automatically when the system boots
# ═══════════════════════════════════════════════════════════

# Display welcome message
print ═══════════════════════════════════════════════════════════
print   Welcome to RetrOS!
print   Autoexec script is running...
print ═══════════════════════════════════════════════════════════

# Show boot notification
notify RetrOS startup complete!

# Play startup sound
play notify

# Log boot time
set $bootTime = call now
set $formattedTime = call formatTime $bootTime
print   Boot time: $formattedTime

# You can customize this script to:
# - Launch specific applications on boot
# - Set up environment variables
# - Run system checks
# - Display custom messages

# Example: Auto-launch an app (uncomment to use)
# launch calculator

print   Autoexec complete!
`;

    try {
        FileSystemManager.writeFile(path, content || defaultContent);
        console.log(`[AutoexecLoader] Created autoexec at: ${path}`);
        return true;
    } catch (error) {
        console.error(`[AutoexecLoader] Failed to create autoexec:`, error);
        return false;
    }
}

export default {
    runAutoexec,
    findAutoexec,
    createSampleAutoexec,
    AUTOEXEC_PATHS
};
