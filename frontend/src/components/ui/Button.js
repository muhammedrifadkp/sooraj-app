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
exports.buttonVariants = exports.Button = void 0;
var react_1 = require("react");
var framer_motion_1 = require("framer-motion");
var class_variance_authority_1 = require("class-variance-authority");
var utils_1 = require("../../lib/utils");
var buttonVariants = (0, class_variance_authority_1.cva)('inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none', {
    variants: {
        variant: {
            default: 'bg-primary text-primary-foreground hover:bg-primary/90',
            destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
            outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
            secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            ghost: 'hover:bg-accent hover:text-accent-foreground',
            link: 'underline-offset-4 hover:underline text-primary',
        },
        size: {
            default: 'h-10 py-2 px-4',
            sm: 'h-9 px-3',
            lg: 'h-11 px-8',
            icon: 'h-10 w-10',
        },
    },
    defaultVariants: {
        variant: 'default',
        size: 'default',
    },
});
exports.buttonVariants = buttonVariants;
var Button = (0, react_1.forwardRef)(function (_a, ref) {
    var className = _a.className, variant = _a.variant, size = _a.size, isLoading = _a.isLoading, children = _a.children, props = __rest(_a, ["className", "variant", "size", "isLoading", "children"]);
    return (<framer_motion_1.motion.button className={(0, utils_1.cn)(buttonVariants({ variant: variant, size: size, className: className }))} ref={ref} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} {...props}>
        {isLoading ? (<div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"/>) : null}
        {children}
      </framer_motion_1.motion.button>);
});
exports.Button = Button;
Button.displayName = 'Button';
