/**
 * Test existing .retro scripts for backwards compatibility
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { default: ScriptEngine } = await import('./core/script/ScriptEngine.js');

// Initialize engine
ScriptEngine.initialize({ EventBus: null, CommandBus: null });

// Test scripts
const testScripts = [
    'simple_test.retro',
    'minimal_test.retro',
    'terminal_test.retro'
];

console.log('═══════════════════════════════════════════════════════════');
console.log('  Testing Existing .retro Scripts for Compatibility');
console.log('═══════════════════════════════════════════════════════════\n');

let passed = 0;
let failed = 0;

for (const scriptName of testScripts) {
    const scriptPath = join(__dirname, scriptName);

    try {
        console.log(`\n[Test] ${scriptName}`);
        console.log('─'.repeat(60));

        const scriptContent = readFileSync(scriptPath, 'utf8');
        const outputs = [];

        const result = await ScriptEngine.run(scriptContent, {
            onOutput: (msg) => outputs.push(msg)
        });

        if (result.success) {
            console.log(`✓ PASS - ${outputs.length} output lines`);
            passed++;
        } else {
            console.log(`✗ FAIL - ${result.error?.message || result.error}`);
            failed++;
        }
    } catch (error) {
        console.log(`✗ ERROR - ${error.message}`);
        failed++;
    }
}

console.log('\n═══════════════════════════════════════════════════════════');
console.log('  Summary');
console.log('═══════════════════════════════════════════════════════════');
console.log(`Passed: ${passed}/${testScripts.length}`);
console.log(`Failed: ${failed}/${testScripts.length}`);

process.exit(failed > 0 ? 1 : 0);
