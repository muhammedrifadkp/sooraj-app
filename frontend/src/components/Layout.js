"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var framer_motion_1 = require("framer-motion");
var AuthContext_1 = require("../context/AuthContext");
var fi_1 = require("react-icons/fi");
var outline_1 = require("@heroicons/react/24/outline");
var classNames_1 = require("../utils/classNames");
var Layout = function (_a) {
    var children = _a.children;
    var location = (0, react_router_dom_1.useLocation)();
    var navigate = (0, react_router_dom_1.useNavigate)();
    var _b = (0, react_1.useState)(false), isDropdownOpen = _b[0], setIsDropdownOpen = _b[1];
    var _c = (0, react_1.useState)(false), mobileMenuOpen = _c[0], setMobileMenuOpen = _c[1];
    var _d = (0, AuthContext_1.useAuth)(), user = _d.user, logout = _d.logout, isAuthenticated = _d.isAuthenticated, isAdmin = _d.isAdmin;
    var _e = (0, react_1.useState)(false), imageError = _e[0], setImageError = _e[1];
    var _f = (0, react_1.useState)(true), isLoading = _f[0], setIsLoading = _f[1];
    (0, react_1.useEffect)(function () {
        var checkAuth = function () { return __awaiter(void 0, void 0, void 0, function () {
            var currentPath_1, userRole, adminRoutes, studentRoutes, publicRoutes;
            var _a;
            return __generator(this, function (_b) {
                try {
                    if (!isAuthenticated) {
                        navigate('/login');
                        return [2 /*return*/];
                    }
                    currentPath_1 = location.pathname;
                    userRole = ((_a = user === null || user === void 0 ? void 0 : user.role) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || 'student';
                    adminRoutes = ['/admin', '/admin/dashboard', '/admin/courses', '/admin/students', '/admin/teachers', '/admin/live-classes', '/admin/assignments'];
                    studentRoutes = ['/student', '/student/dashboard', '/student/courses', '/student/live-classes', '/student/assignments'];
                    publicRoutes = ['/login', '/admin/login', '/register', '/admin/register'];
                    // If on a public route and authenticated, redirect to appropriate dashboard
                    if (publicRoutes.includes(currentPath_1)) {
                        if (userRole === 'admin') {
                            navigate('/admin/dashboard');
                        }
                        else {
                            navigate('/student/dashboard');
                        }
                        return [2 /*return*/];
                    }
                    // Handle routing based on role and current path
                    if (userRole === 'admin') {
                        // If admin is on a student route, redirect to admin dashboard
                        if (studentRoutes.some(function (route) { return currentPath_1.startsWith(route.split('/')[1]); })) {
                            console.log('Admin attempting to access student route, redirecting to admin dashboard');
                            navigate('/admin/dashboard');
                            return [2 /*return*/];
                        }
                    }
                    else {
                        // If student is on an admin route, redirect to student dashboard
                        if (adminRoutes.some(function (route) { return currentPath_1.startsWith(route.split('/')[1]); })) {
                            console.log('Student attempting to access admin route, redirecting to student dashboard');
                            navigate('/student/dashboard');
                            return [2 /*return*/];
                        }
                    }
                    setIsLoading(false);
                }
                catch (error) {
                    console.error('Auth check error:', error);
                    navigate('/login');
                }
                return [2 /*return*/];
            });
        }); };
        checkAuth();
    }, [location.pathname, navigate, isAuthenticated, user === null || user === void 0 ? void 0 : user.role]);
    var handleLogout = function () {
        logout();
        navigate('/login');
    };
    var renderAvatar = function (avatar) {
        if (!avatar) {
            return (<div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
          <fi_1.FiUser className="w-4 h-4 text-gray-400"/>
        </div>);
        }
        try {
            var imageSrc = '';
            // Handle MongoDB Buffer object
            if (avatar.data && avatar.data.type === 'Buffer' && Array.isArray(avatar.data.data)) {
                // Process the buffer data in chunks to avoid stack overflow
                var bufferData = avatar.data.data;
                var binary = '';
                var chunkSize = 1000;
                for (var i = 0; i < bufferData.length; i += chunkSize) {
                    var chunk = bufferData.slice(i, i + chunkSize);
                    binary += String.fromCharCode.apply(null, chunk);
                }
                imageSrc = "data:image/jpeg;base64,".concat(btoa(binary));
            }
            // Handle raw MongoDB Buffer
            else if (avatar.type === 'Buffer' && Array.isArray(avatar.data)) {
                // Process the buffer data in chunks to avoid stack overflow
                var bufferData = avatar.data;
                var binary = '';
                var chunkSize = 1000;
                for (var i = 0; i < bufferData.length; i += chunkSize) {
                    var chunk = bufferData.slice(i, i + chunkSize);
                    binary += String.fromCharCode.apply(null, chunk);
                }
                imageSrc = "data:image/jpeg;base64,".concat(btoa(binary));
            }
            // Handle base64 string
            else if (typeof avatar === 'string') {
                if (avatar.startsWith('data:')) {
                    imageSrc = avatar;
                }
                else if (avatar.startsWith('/9j/') || avatar.startsWith('iVBOR')) {
                    imageSrc = "data:image/jpeg;base64,".concat(avatar);
                }
                else {
                    // Assume it's a filename
                    imageSrc = "".concat(import.meta.env.VITE_API_URL, "/uploads/").concat(avatar);
                }
            }
            // Handle object with data property (from Profile page)
            else if (typeof avatar === 'object' && avatar.data) {
                if (typeof avatar.data === 'string') {
                    // If it's already a complete data URL, return it
                    if (avatar.data.startsWith('data:')) {
                        imageSrc = avatar.data;
                    }
                    else {
                        // If it's a raw base64 string, add the data URL prefix
                        var contentType = avatar.contentType || 'image/jpeg';
                        imageSrc = "data:".concat(contentType, ";base64,").concat(avatar.data);
                    }
                }
            }
            // Handle any other object format
            else if (typeof avatar === 'object') {
                console.log('Avatar object structure:', JSON.stringify(avatar, null, 2));
                // Try to extract any string property that might be a URL or base64
                for (var key in avatar) {
                    if (typeof avatar[key] === 'string') {
                        if (avatar[key].startsWith('data:') || avatar[key].startsWith('http')) {
                            imageSrc = avatar[key];
                            break;
                        }
                    }
                }
                // If we couldn't find a valid image source, fall back to default
                if (!imageSrc) {
                    console.error('Unknown avatar format:', avatar);
                    return (<div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <fi_1.FiUser className="w-4 h-4 text-gray-400"/>
            </div>);
                }
            }
            else {
                console.error('Unknown avatar format:', avatar);
                return (<div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <fi_1.FiUser className="w-4 h-4 text-gray-400"/>
          </div>);
            }
            return (<img src={imageSrc} alt={(user === null || user === void 0 ? void 0 : user.name) || 'User avatar'} className="w-8 h-8 rounded-full object-cover" onError={function (e) {
                    console.error('Error loading avatar image:', e);
                    setImageError(true);
                }} onLoad={function () {
                    console.log('Avatar image loaded successfully');
                    setImageError(false);
                }}/>);
        }
        catch (error) {
            console.error('Error processing avatar:', error);
            return (<div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
          <fi_1.FiUser className="w-4 h-4 text-gray-400"/>
        </div>);
        }
    };
    var navigation = [
        { name: 'Dashboard', path: '/dashboard', icon: fi_1.FiHome },
        { name: 'Courses', path: '/courses', icon: fi_1.FiBook },
        { name: 'Live Classes', path: '/live-classes', icon: fi_1.FiCalendar },
        { name: 'Assignments', path: '/assignments', icon: fi_1.FiFileText },
        { name: 'My Results', path: '/my-results', icon: fi_1.FiBarChart2 },
        { name: 'Attendance', path: '/attendance', icon: fi_1.FiCheckSquare },
        { name: 'Certificates', path: '/certificates', icon: fi_1.FiAward },
        { name: 'Profile', path: '/profile', icon: fi_1.FiUser },
    ];
    // Add admin-specific navigation items
    var adminNavItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: fi_1.FiHome },
        { name: 'Courses', path: '/admin/courses', icon: fi_1.FiBook },
        { name: 'Live Classes', path: '/admin/live-classes', icon: fi_1.FiVideo },
        { name: 'Assignments', path: '/admin/assignments', icon: fi_1.FiFileText },
        { name: 'Class Management', path: '/admin/class-management', icon: fi_1.FiCalendar },
        { name: 'Profile', path: '/admin/profile', icon: fi_1.FiUser },
    ];
    // Use the correct navigation items based on user role
    var currentNavigation = isAdmin ? adminNavItems : navigation;
    if (isLoading) {
        return (<div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>);
    }
    return (<div className="min-h-screen bg-[#F5F5F5] font-['Roboto']">
      {/* Top Navigation Bar */}
      <header className="fixed inset-x-0 top-0 z-50 bg-[#002147] text-white shadow-md">
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
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <div className="relative">
              <button onClick={function () { return setIsDropdownOpen(!isDropdownOpen); }} className="flex items-center space-x-2 text-sm font-semibold leading-6 text-white hover:text-blue-200 transition-colors">
                <span>{user === null || user === void 0 ? void 0 : user.name}</span>
                {renderAvatar(user === null || user === void 0 ? void 0 : user.avatar)}
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
                    <div className="py-6">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3 px-3 py-2">
                          {renderAvatar(user === null || user === void 0 ? void 0 : user.avatar)}
                          <div className="text-base font-semibold leading-7 text-white">
                            {user === null || user === void 0 ? void 0 : user.name}
                          </div>
                        </div>
                        <react_router_dom_1.Link to="/profile" className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-white hover:bg-[#003366] transition-colors" onClick={function () { return setMobileMenuOpen(false); }}>
                          Profile
                        </react_router_dom_1.Link>
                        <button onClick={handleLogout} className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-white hover:bg-[#003366] transition-colors">
                          Logout
                        </button>
                      </div>
            </div>
          </div>
        </div>
      </div>
            </framer_motion_1.motion.div>)}
        </framer_motion_1.AnimatePresence>
      </header>

      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-[#002147] shadow-lg mt-16">
        <div className="flex flex-col h-full">
          {/* Navigation Menu */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {currentNavigation.map(function (item) { return (<react_router_dom_1.Link key={item.name} to={item.path} className={(0, classNames_1.classNames)(location.pathname === item.path
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white', 'group flex items-center px-2 py-2 text-sm font-medium rounded-md')}>
                {item.icon && <item.icon className="mr-3 h-6 w-6 flex-shrink-0"/>}
                {item.name}
              </react_router_dom_1.Link>); })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64 pt-16">
        <main className="py-6">
          <div className="px-6">{children}</div>
        </main>
      </div>
    </div>);
};
exports.default = Layout;
