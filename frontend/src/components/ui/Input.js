"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Input = void 0;
var React = require("react");
var framer_motion_1 = require("framer-motion");
var utils_1 = require("../../lib/utils");
var Input = React.forwardRef(function (_a, ref) {
    var className = _a.className, type = _a.type, label = _a.label, error = _a.error, props = __rest(_a, ["className", "type", "label", "error"]);
    return (<div className="relative w-full">
        {label && (<label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>)}
        <framer_motion_1.motion.input type={type} className={(0, utils_1.cn)('flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50', error && 'border-red-500 focus-visible:ring-red-500', className)} ref={ref} whileFocus={{ scale: 1.01 }} {...props}/>
        {error && (<framer_motion_1.motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-1 text-sm text-red-500">
            {error}
          </framer_motion_1.motion.p>)}
      </div>);
});
exports.Input = Input;
Input.displayName = 'Input';
