"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Navbar = Navbar;
var react_1 = require("react");
var framer_motion_1 = require("framer-motion");
var react_router_dom_1 = require("react-router-dom");
var outline_1 = require("@heroicons/react/24/outline");
var navigation = [
    { name: 'Home', href: '/' },
    { name: 'Courses', href: '/courses' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
];
function Navbar() {
    var _a = (0, react_1.useState)(false), mobileMenuOpen = _a[0], setMobileMenuOpen = _a[1];
    var _b = (0, react_1.useState)(false), isDropdownOpen = _b[0], setIsDropdownOpen = _b[1];
    var handleLogout = function () {
        // Add your logout logic here
        console.log('Logging out...');
    };
    return (<header className="fixed inset-x-0 top-0 z-50 bg-[#002147] text-white shadow-md">
      <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <react_router_dom_1.Link to="/" className="-m-1.5 p-1.5">
            <span className="text-2xl font-bold text-white">LMS Platform</span>
          </react_router_dom_1.Link>
        </div>
        <div className="flex lg:hidden">
          <button type="button" className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-white hover:bg-[#003366] transition-colors" onClick={function () { return setMobileMenuOpen(true); }}>
            <span className="sr-only">Open main menu</span>
            <outline_1.Bars3Icon className="h-6 w-6" aria-hidden="true"/>
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map(function (item) { return (<react_router_dom_1.Link key={item.name} to={item.href} className="text-sm font-semibold leading-6 text-white hover:text-blue-200 transition-colors">
              {item.name}
            </react_router_dom_1.Link>); })}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <div className="relative">
            <button onClick={function () { return setIsDropdownOpen(!isDropdownOpen); }} className="flex items-center space-x-2 text-sm font-semibold leading-6 text-white hover:text-blue-200 transition-colors">
              <span>shibin</span>
              <outline_1.ChevronDownIcon className="h-4 w-4"/>
            </button>
            <framer_motion_1.AnimatePresence>
              {isDropdownOpen && (<framer_motion_1.motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1" role="menu">
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#002147] transition-colors" role="menuitem">
                      Logout
                    </button>
                  </div>
                </framer_motion_1.motion.div>)}
            </framer_motion_1.AnimatePresence>
          </div>
        </div>
      </nav>
      <framer_motion_1.AnimatePresence>
        {mobileMenuOpen && (<framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="lg:hidden">
            <div className="fixed inset-0 z-50"/>
            <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-[#002147] px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
              <div className="flex items-center justify-between">
                <react_router_dom_1.Link to="/" className="-m-1.5 p-1.5">
                  <span className="text-2xl font-bold text-white">LMS</span>
                </react_router_dom_1.Link>
                <button type="button" className="-m-2.5 rounded-md p-2.5 text-white hover:bg-[#003366] transition-colors" onClick={function () { return setMobileMenuOpen(false); }}>
                  <span className="sr-only">Close menu</span>
                  <outline_1.XMarkIcon className="h-6 w-6" aria-hidden="true"/>
                </button>
              </div>
              <div className="mt-6 flow-root">
                <div className="-my-6 divide-y divide-blue-500/10">
                  <div className="space-y-2 py-6">
                    {navigation.map(function (item) { return (<react_router_dom_1.Link key={item.name} to={item.href} className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-[#1e3a8a] transition-colors" onClick={function () { return setMobileMenuOpen(false); }}>
                        {item.name}
                      </react_router_dom_1.Link>); })}
                  </div>
                  <div className="py-6">
                    <div className="space-y-2">
                      <div className="px-3 py-2 text-base font-semibold leading-7 text-white">
                        shibin
                      </div>
                      <button onClick={handleLogout} className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-white hover:bg-[#1e3a8a] transition-colors">
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </framer_motion_1.motion.div>)}
      </framer_motion_1.AnimatePresence>
    </header>);
}
;
exports.default = Navbar;
