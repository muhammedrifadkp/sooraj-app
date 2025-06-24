"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
/**
 * A component that safely displays any value, preventing the common
 * "Objects are not valid as React child" error
 */
var SafeDisplay = function (_a) {
    var value = _a.value, _b = _a.defaultValue, defaultValue = _b === void 0 ? '' : _b;
    if (value === null || value === undefined) {
        return <>{defaultValue}</>;
    }
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return <>{value}</>;
    }
    if (typeof value === 'object') {
        // Handle objects that might be directly rendered
        if (value.name && typeof value.name === 'string') {
            return <>{value.name}</>;
        }
        // For arrays, join the elements
        if (Array.isArray(value)) {
            return <>{value.map(function (item) { return typeof item === 'object' ?
                    JSON.stringify(item) :
                    String(item); }).join(', ')}</>;
        }
        // For objects, stringify them
        return <>{defaultValue || '[Object]'}</>;
    }
    // For functions or symbols or any other type
    return <>{defaultValue || String(value)}</>;
};
exports.default = SafeDisplay;
