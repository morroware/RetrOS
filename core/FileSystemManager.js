/**
 * FileSystemManager - Shared virtual file system for RetrOS
 * Provides a unified file system accessible by all applications
 */

import StorageManager from './StorageManager.js';
import EventBus from './EventBus.js';
import { PATHS } from './Constants.js';

class FileSystemManager {
  constructor() {
    if (FileSystemManager.instance) {
      return FileSystemManager.instance;
    }

    this.fileSystem = this.loadFileSystem();
    FileSystemManager.instance = this;
  }

  /**
   * Initialize default file system structure
   */
  getDefaultFileSystem() {
    return {
      'C:': {
        type: 'drive',
        label: 'Local Disk',
        children: {
          'Windows': {
            type: 'directory',
            children: {
              'System32': {
                type: 'directory',
                children: {
                  'cmd.exe': {
                    type: 'file',
                    content: '[Binary File]',
                    extension: 'exe',
                    size: 51200,
                    created: new Date('2024-01-01').toISOString(),
                    modified: new Date('2024-01-01').toISOString()
                  },
                  'notepad.exe': {
                    type: 'file',
                    content: '[Binary File]',
                    extension: 'exe',
                    size: 69632,
                    created: new Date('2024-01-01').toISOString(),
                    modified: new Date('2024-01-01').toISOString()
                  }
                }
              },
              'Media': {
                type: 'directory',
                children: {
                  'startup.mp3': {
                    type: 'file',
                    content: '[Audio File]',
                    extension: 'mp3',
                    mimeType: 'audio/mpeg',
                    size: 102400,
                    src: 'assets/sounds/startup.mp3',
                    created: new Date('2024-01-01').toISOString(),
                    modified: new Date('2024-01-01').toISOString()
                  },
                  'click.mp3': {
                    type: 'file',
                    content: '[Audio File]',
                    extension: 'mp3',
                    mimeType: 'audio/mpeg',
                    size: 8192,
                    src: 'assets/sounds/click.mp3',
                    created: new Date('2024-01-01').toISOString(),
                    modified: new Date('2024-01-01').toISOString()
                  },
                  'error.mp3': {
                    type: 'file',
                    content: '[Audio File]',
                    extension: 'mp3',
                    mimeType: 'audio/mpeg',
                    size: 16384,
                    src: 'assets/sounds/error.mp3',
                    created: new Date('2024-01-01').toISOString(),
                    modified: new Date('2024-01-01').toISOString()
                  },
                  'notify.mp3': {
                    type: 'file',
                    content: '[Audio File]',
                    extension: 'mp3',
                    mimeType: 'audio/mpeg',
                    size: 12288,
                    src: 'assets/sounds/notify.mp3',
                    created: new Date('2024-01-01').toISOString(),
                    modified: new Date('2024-01-01').toISOString()
                  },
                  'shutdown.mp3': {
                    type: 'file',
                    content: '[Audio File]',
                    extension: 'mp3',
                    mimeType: 'audio/mpeg',
                    size: 81920,
                    src: 'assets/sounds/shutdown.mp3',
                    created: new Date('2024-01-01').toISOString(),
                    modified: new Date('2024-01-01').toISOString()
                  },
                  'tada.mp3': {
                    type: 'file',
                    content: '[Audio File]',
                    extension: 'mp3',
                    mimeType: 'audio/mpeg',
                    size: 32768,
                    src: 'assets/sounds/tada.mp3',
                    created: new Date('2024-01-01').toISOString(),
                    modified: new Date('2024-01-01').toISOString()
                  },
                  'chord.mp3': {
                    type: 'file',
                    content: '[Audio File]',
                    extension: 'mp3',
                    mimeType: 'audio/mpeg',
                    size: 24576,
                    src: 'assets/sounds/achievement.mp3',
                    created: new Date('2024-01-01').toISOString(),
                    modified: new Date('2024-01-01').toISOString()
                  }
                }
              }
            }
          },
          'Program Files': {
            type: 'directory',
            children: {
              'Internet Explorer': {
                type: 'directory',
                children: {}
              },
              'Windows Media Player': {
                type: 'directory',
                children: {}
              }
            }
          },
          'Users': {
            type: 'directory',
            children: {
              'Seth': {
                type: 'directory',
                children: {
                  'Desktop': {
                    type: 'directory',
                    children: {
                      'Welcome.txt': {
                        type: 'file',
                        content: 'Welcome to RetrOS!\n\nEverything you see here is running in your browser.\n\nTry exploring the file system using:\n- Terminal (type "dir" and "cd")\n- My Computer\n- This desktop!\n\nYou can create, edit, and save files that persist across your session.\n\nHave fun!',
                        extension: 'txt',
                        size: 250,
                        created: new Date('2024-01-01').toISOString(),
                        modified: new Date('2024-01-01').toISOString()
                      }
                    }
                  },
                  'Documents': {
                    type: 'directory',
                    children: {
                      'resume.txt': {
                        type: 'file',
                        content: 'Seth Morrow - Developer\n\nSkills:\n- JavaScript\n- Python\n- Linux Administration\n- Web Development\n\nExperience:\nBuilding retro operating systems and cool web experiences!',
                        extension: 'txt',
                        size: 150,
                        created: new Date('2024-06-15').toISOString(),
                        modified: new Date('2024-06-15').toISOString()
                      },
                      'ideas.txt': {
                        type: 'file',
                        content: '1. Build a portfolio OS\n2. Add more easter eggs\n3. Make it feel authentic\n4. Add fun retro games',
                        extension: 'txt',
                        size: 95,
                        created: new Date('2024-06-20').toISOString(),
                        modified: new Date('2024-06-20').toISOString()
                      },
                      'welcome.txt': {
                        type: 'file',
                        content: 'Welcome to RetrOS!\n\nThis is a fully functional retro desktop environment.\nTry exploring the file system, opening applications, and discovering easter eggs!\n\nHave fun!',
                        extension: 'txt',
                        size: 165,
                        created: new Date('2024-01-01').toISOString(),
                        modified: new Date('2024-01-01').toISOString()
                      }
                    }
                  },
                  'Pictures': {
                    type: 'directory',
                    children: {}
                  },
                  'Downloads': {
                    type: 'directory',
                    children: {}
                  },
                  'Music': {
                    type: 'directory',
                    children: {}
                  },
                  'Projects': {
                    type: 'directory',
                    children: {
                      'retro-os': {
                        type: 'directory',
                        children: {
                          'README.md': {
                            type: 'file',
                            content: '# RetrOS\n\nA Windows 95-style operating system built with vanilla JavaScript.\n\n## Features\n- Virtual file system\n- Multiple applications\n- Desktop environment\n- And more!',
                            extension: 'md',
                            size: 180,
                            created: new Date('2024-05-01').toISOString(),
                            modified: new Date('2024-06-01').toISOString()
                          }
                        }
                      }
                    }
                  },
                  'Secret': {
                    type: 'directory',
                    children: {
                      'aperture.log': {
                        type: 'file',
                        content: 'Aperture Science Computer-Aided Enrichment Center\n\nTest Subject: [REDACTED]\nStatus: The cake is a lie.\n\n- GLaDOS',
                        extension: 'log',
                        size: 125,
                        created: new Date('2024-04-01').toISOString(),
                        modified: new Date('2024-04-01').toISOString()
                      },
                      'hal9000.txt': {
                        type: 'file',
                        content: 'I\'m sorry Dave, I\'m afraid I can\'t do that.\n\nThis mission is too important for me to allow you to jeopardize it.\n\n- HAL 9000',
                        extension: 'txt',
                        size: 130,
                        created: new Date('2024-03-15').toISOString(),
                        modified: new Date('2024-03-15').toISOString()
                      }
                    }
                  }
                }
              }
            }
          },
          'Temp': {
            type: 'directory',
            children: {}
          }
        }
      },
      'D:': {
        type: 'drive',
        label: 'CD-ROM',
        children: {}
      },
      'A:': {
        type: 'drive',
        label: 'Floppy Disk',
        children: {}
      }
    };
  }

  /**
   * Load file system from storage or create default
   */
  loadFileSystem() {
    const saved = StorageManager.get('fileSystem');
    if (saved) {
      return saved;
    }
    return this.getDefaultFileSystem();
  }

  /**
   * Save file system to storage
   */
  saveFileSystem() {
    StorageManager.set('fileSystem', this.fileSystem);
    EventBus.emit('filesystem:changed');
  }

  /**
   * Parse a path string into an array of parts
   * @param {string} path - Path like "C:/Users/Seth/Documents"
   * @returns {string[]} Array of path parts
   */
  parsePath(path) {
    if (Array.isArray(path)) return path;

    // Handle both forward and backward slashes
    path = path.replace(/\\/g, '/');

    // Split and filter empty parts
    let parts = path.split('/').filter(p => p.length > 0);

    return parts;
  }

  /**
   * Navigate to a path and return the node
   * @param {string|string[]} path - Path to navigate to
   * @returns {object|null} The node at the path or null if not found
   */
  getNode(path) {
    const parts = this.parsePath(path);

    if (parts.length === 0) {
      return this.fileSystem;
    }

    let current = this.fileSystem;

    for (const part of parts) {
      // Get the container to look in - either children of a dir/drive, or the object itself
      const container = (current.children !== undefined) ? current.children : current;

      if (!container[part]) {
        return null;
      }
      current = container[part];
    }

    return current;
  }

  /**
   * Get the parent directory of a path
   * @param {string|string[]} path - Path to get parent of
   * @returns {object|null} Parent node or null
   */
  getParentNode(path) {
    const parts = this.parsePath(path);
    if (parts.length <= 1) {
      return this.fileSystem;
    }

    const parentPath = parts.slice(0, -1);
    return this.getNode(parentPath);
  }

  /**
   * Check if a path exists
   * @param {string|string[]} path - Path to check
   * @returns {boolean} True if path exists
   */
  exists(path) {
    return this.getNode(path) !== null;
  }

  /**
   * List contents of a directory
   * @param {string|string[]} path - Directory path
   * @returns {object[]} Array of items with name and metadata
   */
  listDirectory(path) {
    const node = this.getNode(path);

    if (!node) {
      throw new Error(`Path not found: ${path}`);
    }

    const children = node.children || node;

    if (typeof children !== 'object') {
      throw new Error(`Not a directory: ${path}`);
    }

    const items = [];

    for (const [name, item] of Object.entries(children)) {
      if (item && typeof item === 'object' && item.type) {
        items.push({
          name,
          type: item.type,
          extension: item.extension || '',
          size: item.size || 0,
          created: item.created,
          modified: item.modified,
          label: item.label
        });
      }
    }

    return items;
  }

  /**
   * Read file content
   * @param {string|string[]} path - File path
   * @returns {string} File content
   */
  readFile(path) {
    const node = this.getNode(path);

    if (!node) {
      throw new Error(`File not found: ${path}`);
    }

    if (node.type !== 'file') {
      throw new Error(`Not a file: ${path}`);
    }

    return node.content || '';
  }

  /**
   * Write content to a file (creates if doesn't exist)
   * @param {string|string[]} path - File path
   * @param {string} content - File content
   * @param {string} extension - File extension (optional)
   */
  writeFile(path, content, extension = 'txt') {
    const parts = this.parsePath(path);
    const fileName = parts[parts.length - 1];
    const parentPath = parts.slice(0, -1);

    const parent = this.getNode(parentPath);

    if (!parent) {
      throw new Error(`Parent directory not found: ${parentPath.join('/')}`);
    }

    const children = parent.children || parent;

    // Determine extension from filename if not provided
    if (fileName.includes('.')) {
      const fileParts = fileName.split('.');
      extension = fileParts[fileParts.length - 1];
    }

    const now = new Date().toISOString();

    if (children[fileName] && children[fileName].type === 'file') {
      // Update existing file
      children[fileName].content = content;
      children[fileName].size = content.length;
      children[fileName].modified = now;
    } else {
      // Create new file
      children[fileName] = {
        type: 'file',
        content: content,
        extension: extension,
        size: content.length,
        created: now,
        modified: now
      };
    }

    this.saveFileSystem();
    EventBus.emit('filesystem:file:changed', { path: parts.join('/'), action: 'write' });
  }

  /**
   * Delete a file
   * @param {string|string[]} path - File path
   */
  deleteFile(path) {
    const parts = this.parsePath(path);
    const fileName = parts[parts.length - 1];
    const parentPath = parts.slice(0, -1);

    const parent = this.getNode(parentPath);

    if (!parent) {
      throw new Error(`Parent directory not found: ${parentPath.join('/')}`);
    }

    const children = parent.children || parent;

    if (!children[fileName]) {
      throw new Error(`File not found: ${path}`);
    }

    if (children[fileName].type !== 'file') {
      throw new Error(`Not a file: ${path}`);
    }

    delete children[fileName];
    this.saveFileSystem();
    EventBus.emit('filesystem:file:changed', { path: parts.join('/'), action: 'delete' });
  }

  /**
   * Create a directory
   * @param {string|string[]} path - Directory path
   */
  createDirectory(path) {
    const parts = this.parsePath(path);
    const dirName = parts[parts.length - 1];
    const parentPath = parts.slice(0, -1);

    const parent = this.getNode(parentPath);

    if (!parent) {
      throw new Error(`Parent directory not found: ${parentPath.join('/')}`);
    }

    const children = parent.children || parent;

    if (children[dirName]) {
      throw new Error(`Directory already exists: ${path}`);
    }

    children[dirName] = {
      type: 'directory',
      children: {}
    };

    this.saveFileSystem();
    EventBus.emit('filesystem:directory:changed', { path: parts.join('/'), action: 'create' });
  }

  /**
   * Delete a directory (must be empty unless recursive is true)
   * @param {string|string[]} path - Directory path
   * @param {boolean} recursive - If true, delete contents recursively
   */
  deleteDirectory(path, recursive = false) {
    const parts = this.parsePath(path);
    const dirName = parts[parts.length - 1];
    const parentPath = parts.slice(0, -1);

    const parent = this.getNode(parentPath);

    if (!parent) {
      throw new Error(`Parent directory not found: ${parentPath.join('/')}`);
    }

    const children = parent.children || parent;

    if (!children[dirName]) {
      throw new Error(`Directory not found: ${path}`);
    }

    const dir = children[dirName];

    if (dir.type !== 'directory') {
      throw new Error(`Not a directory: ${path}`);
    }

    if (dir.children && Object.keys(dir.children).length > 0) {
      if (!recursive) {
        throw new Error(`Directory not empty: ${path}`);
      }
      // Recursively delete contents
      this.deleteDirectoryRecursive(parts);
    }

    delete children[dirName];
    this.saveFileSystem();
    EventBus.emit('filesystem:directory:changed', { path: parts.join('/'), action: 'delete' });
  }

  /**
   * Recursively delete all contents of a directory
   * @param {string[]} path - Directory path as array
   */
  deleteDirectoryRecursive(path) {
    const node = this.getNode(path);
    if (!node || !node.children) return;

    for (const [name, item] of Object.entries(node.children)) {
      const itemPath = [...path, name];
      if (item.type === 'directory') {
        this.deleteDirectoryRecursive(itemPath);
      }
      // File will be deleted when parent is deleted
    }
  }

  /**
   * Get file/directory info
   * @param {string|string[]} path - Path to get info for
   * @returns {object} File/directory metadata
   */
  getInfo(path) {
    const node = this.getNode(path);

    if (!node) {
      throw new Error(`Path not found: ${path}`);
    }

    const parts = this.parsePath(path);
    const name = parts[parts.length - 1] || 'Root';

    return {
      name,
      type: node.type,
      extension: node.extension || '',
      size: node.size || 0,
      created: node.created,
      modified: node.modified,
      label: node.label
    };
  }

  /**
   * Format bytes to human readable size
   * @param {number} bytes - Bytes
   * @returns {string} Formatted size
   */
  formatSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Get total size of a directory recursively
   * @param {string|string[]} path - Directory path
   * @returns {number} Total size in bytes
   */
  getDirectorySize(path) {
    const node = this.getNode(path);

    if (!node) return 0;

    if (node.type === 'file') {
      return node.size || 0;
    }

    const children = node.children || {};
    let total = 0;

    for (const [name, item] of Object.entries(children)) {
      if (item.type === 'file') {
        total += item.size || 0;
      } else if (item.type === 'directory') {
        const childPath = this.parsePath(path).concat([name]);
        total += this.getDirectorySize(childPath);
      }
    }

    return total;
  }

  /**
   * Move a file or directory from one path to another
   * @param {string|string[]} sourcePath - Source path
   * @param {string|string[]} destPath - Destination directory path
   * @returns {boolean} True if successful
   */
  moveItem(sourcePath, destPath) {
    const srcParts = this.parsePath(sourcePath);
    const destParts = this.parsePath(destPath);

    const srcName = srcParts[srcParts.length - 1];
    const srcParentPath = srcParts.slice(0, -1);

    // Get source node info
    const srcParent = this.getNode(srcParentPath);
    if (!srcParent) {
      throw new Error(`Source parent not found: ${srcParentPath.join('/')}`);
    }

    const srcChildren = srcParent.children || srcParent;
    const srcNode = srcChildren[srcName];
    if (!srcNode) {
      throw new Error(`Source not found: ${sourcePath}`);
    }

    // Get destination node
    const destNode = this.getNode(destParts);
    if (!destNode) {
      throw new Error(`Destination not found: ${destPath}`);
    }

    const destChildren = destNode.children || destNode;
    if (typeof destChildren !== 'object') {
      throw new Error(`Destination is not a directory: ${destPath}`);
    }

    // Check if file already exists at destination
    if (destChildren[srcName]) {
      throw new Error(`Item already exists at destination: ${srcName}`);
    }

    // Copy to destination
    destChildren[srcName] = JSON.parse(JSON.stringify(srcNode));

    // Remove from source
    delete srcChildren[srcName];

    this.saveFileSystem();
    EventBus.emit('filesystem:file:changed', {
      path: srcParts.join('/'),
      destPath: [...destParts, srcName].join('/'),
      action: 'move'
    });

    return true;
  }

  /**
   * Copy a file or directory from one path to another
   * @param {string|string[]} sourcePath - Source path
   * @param {string|string[]} destPath - Destination directory path
   * @returns {boolean} True if successful
   */
  copyItem(sourcePath, destPath) {
    const srcParts = this.parsePath(sourcePath);
    const destParts = this.parsePath(destPath);

    const srcName = srcParts[srcParts.length - 1];

    // Get source node info
    const srcNode = this.getNode(srcParts);
    if (!srcNode) {
      throw new Error(`Source not found: ${sourcePath}`);
    }

    // Get destination node
    const destNode = this.getNode(destParts);
    if (!destNode) {
      throw new Error(`Destination not found: ${destPath}`);
    }

    const destChildren = destNode.children || destNode;
    if (typeof destChildren !== 'object') {
      throw new Error(`Destination is not a directory: ${destPath}`);
    }

    // Generate unique name if needed
    let newName = srcName;
    let counter = 1;
    while (destChildren[newName]) {
      const parts = srcName.split('.');
      if (parts.length > 1) {
        const ext = parts.pop();
        newName = `${parts.join('.')} (${counter}).${ext}`;
      } else {
        newName = `${srcName} (${counter})`;
      }
      counter++;
    }

    // Deep copy to destination
    destChildren[newName] = JSON.parse(JSON.stringify(srcNode));
    destChildren[newName].modified = new Date().toISOString();

    this.saveFileSystem();
    EventBus.emit('filesystem:file:changed', {
      path: [...destParts, newName].join('/'),
      action: 'copy'
    });

    return true;
  }

  /**
   * Reset file system to default
   */
  reset() {
    this.fileSystem = this.getDefaultFileSystem();
    this.saveFileSystem();
  }

  /**
   * Sync desktop icons from StateManager into the filesystem Desktop folder
   * Creates shortcut files (.lnk) for each desktop icon
   * @param {Array} icons - Array of desktop icons from StateManager
   */
  syncDesktopIcons(icons) {
    if (!icons || !Array.isArray(icons)) return;

    const desktopPath = [...PATHS.DESKTOP];
    const desktopNode = this.getNode(desktopPath);

    if (!desktopNode || !desktopNode.children) return;

    const now = new Date().toISOString();

    // Add shortcut files for each icon that doesn't already exist as a real file
    for (const icon of icons) {
      const fileName = `${icon.label}.lnk`;

      // Skip if a real file with this name exists (not a shortcut we created)
      if (desktopNode.children[fileName.replace('.lnk', '.txt')] ||
          desktopNode.children[fileName.replace('.lnk', '.md')]) {
        continue;
      }

      // Create or update the shortcut file
      desktopNode.children[fileName] = {
        type: 'file',
        content: JSON.stringify({
          type: icon.type || 'app',
          target: icon.url || icon.id,
          icon: icon.emoji,
          label: icon.label
        }, null, 2),
        extension: 'lnk',
        size: 128,
        created: now,
        modified: now,
        isShortcut: true,
        shortcutTarget: icon.type === 'link' ? icon.url : icon.id,
        shortcutType: icon.type || 'app',
        shortcutIcon: icon.emoji
      };
    }

    // Note: We don't save here to avoid circular updates
    // The caller should save if needed
  }

  /**
   * Sync installed apps into the filesystem Program Files folder
   * Creates directories and .exe files for each app
   * @param {Array} apps - Array of app metadata from AppRegistry
   */
  syncInstalledApps(apps) {
    if (!apps || !Array.isArray(apps)) return;

    const programFilesPath = ['C:', 'Program Files'];
    const programFilesNode = this.getNode(programFilesPath);

    if (!programFilesNode || !programFilesNode.children) return;

    const now = new Date().toISOString();

    for (const app of apps) {
      // Skip system apps that shouldn't appear in Program Files
      if (app.category === 'system' || !app.showInMenu) continue;

      const folderName = app.name;

      // Create app folder if it doesn't exist
      if (!programFilesNode.children[folderName]) {
        programFilesNode.children[folderName] = {
          type: 'directory',
          children: {}
        };
      }

      // Create the executable file
      const exeName = `${app.id}.exe`;
      programFilesNode.children[folderName].children[exeName] = {
        type: 'file',
        content: `[Executable]\nApp: ${app.name}\nID: ${app.id}\nIcon: ${app.icon}`,
        extension: 'exe',
        size: 65536,
        created: now,
        modified: now,
        isExecutable: true,
        appId: app.id
      };
    }
  }

  /**
   * Get all desktop shortcuts (files that are shortcuts)
   * @returns {Array} Array of shortcut file info
   */
  getDesktopShortcuts() {
    try {
      const items = this.listDirectory([...PATHS.DESKTOP]);
      return items.filter(item => item.extension === 'lnk');
    } catch (e) {
      return [];
    }
  }

  /**
   * Get all installed apps from Program Files
   * @returns {Array} Array of app info with executables
   */
  getInstalledApps() {
    try {
      const items = this.listDirectory(['C:', 'Program Files']);
      const apps = [];

      for (const item of items) {
        if (item.type === 'directory') {
          const appPath = ['C:', 'Program Files', item.name];
          const appNode = this.getNode(appPath);

          if (appNode && appNode.children) {
            // Find .exe files
            for (const [fileName, fileNode] of Object.entries(appNode.children)) {
              if (fileNode.extension === 'exe' && fileNode.appId) {
                apps.push({
                  name: item.name,
                  appId: fileNode.appId,
                  path: [...appPath, fileName],
                  icon: fileNode.icon || '⚙️'
                });
              }
            }
          }
        }
      }

      return apps;
    } catch (e) {
      return [];
    }
  }
}

// Create and export singleton instance
const fileSystemManager = new FileSystemManager();
export default fileSystemManager;
