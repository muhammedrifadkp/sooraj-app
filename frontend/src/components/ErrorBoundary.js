"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var ErrorBoundary = function () {
    var _a;
    var error = (0, react_router_dom_1.useRouteError)();
    if ((0, react_router_dom_1.isRouteErrorResponse)(error)) {
        if (error.status === 404) {
            return (<div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <h1 className="text-4xl font-bold text-red-600 mb-4">404</h1>
            <p className="text-xl text-gray-700 mb-4">Page Not Found</p>
            <p className="text-gray-500">The page you're looking for doesn't exist.</p>
            <button onClick={function () { return window.history.back(); }} className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
              Go Back
            </button>
          </div>
        </div>);
        }
        return (<div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-4xl font-bold text-red-600 mb-4">{error.status}</h1>
          <p className="text-xl text-gray-700 mb-4">{error.statusText}</p>
          <p className="text-gray-500">{((_a = error.data) === null || _a === void 0 ? void 0 : _a.message) || 'An unexpected error occurred'}</p>
          <button onClick={function () { return window.history.back(); }} className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            Go Back
          </button>
        </div>
      </div>);
    }
    return (<div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Oops!</h1>
        <p className="text-xl text-gray-700 mb-4">Something went wrong</p>
        <p className="text-gray-500">
          {error instanceof Error ? error.message : 'An unexpected error occurred'}
        </p>
        <button onClick={function () { return window.history.back(); }} className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
          Go Back
        </button>
      </div>
    </div>);
};
exports.default = ErrorBoundary;
