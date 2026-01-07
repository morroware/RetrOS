/**
 * ArrayBuiltins - Array manipulation functions for RetroScript
 */

export function registerArrayBuiltins(interpreter) {
    // Basic operations
    interpreter.registerBuiltin('count', (arr) => {
        if (Array.isArray(arr)) return arr.length;
        if (typeof arr === 'object' && arr !== null) return Object.keys(arr).length;
        return String(arr).length;
    });

    interpreter.registerBuiltin('first', (arr) => {
        if (Array.isArray(arr) && arr.length > 0) return arr[0];
        return null;
    });

    interpreter.registerBuiltin('last', (arr) => {
        if (Array.isArray(arr) && arr.length > 0) return arr[arr.length - 1];
        return null;
    });

    interpreter.registerBuiltin('at', (arr, index) => {
        if (Array.isArray(arr)) return arr[Number(index)];
        return null;
    });

    // Stack operations
    interpreter.registerBuiltin('push', (arr, ...items) => {
        if (Array.isArray(arr)) {
            return [...arr, ...items];
        }
        return arr;
    });

    interpreter.registerBuiltin('pop', (arr) => {
        if (Array.isArray(arr) && arr.length > 0) {
            return arr[arr.length - 1];
        }
        return null;
    });

    interpreter.registerBuiltin('shift', (arr) => {
        if (Array.isArray(arr) && arr.length > 0) {
            return arr[0];
        }
        return null;
    });

    interpreter.registerBuiltin('unshift', (arr, ...items) => {
        if (Array.isArray(arr)) {
            return [...items, ...arr];
        }
        return arr;
    });

    // Search
    interpreter.registerBuiltin('includes', (arr, item) => {
        if (Array.isArray(arr)) return arr.includes(item);
        return false;
    });

    interpreter.registerBuiltin('findIndex', (arr, item) => {
        if (Array.isArray(arr)) return arr.indexOf(item);
        return -1;
    });

    interpreter.registerBuiltin('find', (arr, predicate) => {
        // Simple find by value (not callback-based)
        if (Array.isArray(arr)) {
            return arr.find(item => item === predicate) ?? null;
        }
        return null;
    });

    // Sorting
    interpreter.registerBuiltin('sort', (arr) => {
        if (Array.isArray(arr)) {
            return [...arr].sort((a, b) => {
                if (typeof a === 'number' && typeof b === 'number') return a - b;
                return String(a).localeCompare(String(b));
            });
        }
        return arr;
    });

    interpreter.registerBuiltin('sortDesc', (arr) => {
        if (Array.isArray(arr)) {
            return [...arr].sort((a, b) => {
                if (typeof a === 'number' && typeof b === 'number') return b - a;
                return String(b).localeCompare(String(a));
            });
        }
        return arr;
    });

    // Transformations
    interpreter.registerBuiltin('unique', (arr) => {
        if (Array.isArray(arr)) return [...new Set(arr)];
        return arr;
    });

    interpreter.registerBuiltin('flatten', (arr, depth = 1) => {
        if (Array.isArray(arr)) return arr.flat(Number(depth));
        return arr;
    });

    // Creation
    interpreter.registerBuiltin('range', (start, end, step = 1) => {
        const s = Number(start);
        const e = Number(end);
        const st = Number(step) || 1;
        const result = [];
        if (st > 0) {
            for (let i = s; i < e; i += st) result.push(i);
        } else if (st < 0) {
            for (let i = s; i > e; i += st) result.push(i);
        }
        return result;
    });

    interpreter.registerBuiltin('fill', (count, value) => {
        return Array(Math.max(0, Math.floor(Number(count)))).fill(value);
    });

    // Aggregation
    interpreter.registerBuiltin('sum', (arr) => {
        if (Array.isArray(arr)) {
            return arr.reduce((acc, val) => acc + Number(val), 0);
        }
        return 0;
    });

    interpreter.registerBuiltin('avg', (arr) => {
        if (Array.isArray(arr) && arr.length > 0) {
            const total = arr.reduce((acc, val) => acc + Number(val), 0);
            return total / arr.length;
        }
        return 0;
    });

    interpreter.registerBuiltin('product', (arr) => {
        if (Array.isArray(arr)) {
            return arr.reduce((acc, val) => acc * Number(val), 1);
        }
        return 0;
    });

    // Filtering (simple equality-based)
    interpreter.registerBuiltin('filter', (arr, value) => {
        if (Array.isArray(arr)) {
            return arr.filter(item => item === value);
        }
        return [];
    });

    interpreter.registerBuiltin('reject', (arr, value) => {
        if (Array.isArray(arr)) {
            return arr.filter(item => item !== value);
        }
        return [];
    });

    // Mapping (simple operations)
    interpreter.registerBuiltin('map', (arr, operation) => {
        if (!Array.isArray(arr)) return [];

        // Simple operations as strings
        switch (operation) {
            case 'double': return arr.map(x => Number(x) * 2);
            case 'square': return arr.map(x => Number(x) * Number(x));
            case 'string': return arr.map(String);
            case 'number': return arr.map(Number);
            case 'boolean': return arr.map(Boolean);
            default: return arr;
        }
    });

    // Splice (returns new array)
    interpreter.registerBuiltin('splice', (arr, start, deleteCount, ...items) => {
        if (Array.isArray(arr)) {
            const copy = [...arr];
            copy.splice(Number(start), Number(deleteCount), ...items);
            return copy;
        }
        return arr;
    });

    // Concatenation
    interpreter.registerBuiltin('arrayConcat', (...arrays) => {
        return arrays.flat();
    });
}

export default registerArrayBuiltins;
