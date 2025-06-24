"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_router_dom_1 = require("react-router-dom");
var react_toastify_1 = require("react-toastify");
require("react-toastify/dist/ReactToastify.css");
// Import global styles
require("./styles/globals.css");
// Import components
var Layout_1 = require("./components/layout/Layout");
var Login_1 = require("./pages/Login");
var AdminLogin_1 = require("./pages/AdminLogin");
var AdminSignUp_1 = require("./pages/AdminSignUp");
var SignUp_1 = require("./pages/SignUp");
var ForgotPassword_1 = require("./pages/ForgotPassword");
var Dashboard_1 = require("./pages/Dashboard");
var AdminDashboard_1 = require("./pages/admin/AdminDashboard");
var AddPage_1 = require("./pages/admin/AddPage");
var AddCourse_1 = require("./pages/admin/AddCourse");
var AddAssignment_1 = require("./pages/admin/AddAssignment");
var AddLiveClass_1 = require("./pages/admin/AddLiveClass");
var SelectRole_1 = require("./pages/SelectRole");
var Courses_1 = require("./pages/Courses");
var LiveClasses_1 = require("./pages/LiveClasses");
var Assignments_1 = require("./pages/Assignments");
var Profile_1 = require("./pages/Profile");
var AuthContext_1 = require("./context/AuthContext");
var CourseDetails_1 = require("./pages/CourseDetails");
var RecentActivity_1 = require("./pages/admin/RecentActivity");
var AdminCourses_1 = require("./pages/admin/AdminCourses");
var AdminAssignments_1 = require("./pages/admin/AdminAssignments");
var AdminLiveClasses_1 = require("./pages/admin/AdminLiveClasses");
var EditCourse_1 = require("./pages/admin/EditCourse");
var EditAssignment_1 = require("./pages/admin/EditAssignment");
var EditLiveClass_1 = require("./pages/admin/EditLiveClass");
var AssignmentDetails_1 = require("./pages/AssignmentDetails");
var Attendance_1 = require("./pages/Attendance");
var ClassManagement_1 = require("./pages/admin/ClassManagement");
var AdminUsers_1 = require("./pages/admin/AdminUsers");
var AdminSettings_1 = require("./pages/admin/AdminSettings");
var AdminProfile_1 = require("./pages/admin/AdminProfile");
var Certificates_1 = require("./pages/Certificates");
var CertificatePage_1 = require("./pages/CertificatePage");
var MyResults_1 = require("./pages/MyResults");
var NotFound_1 = require("./components/NotFound");
var UpcomingEventsManager_1 = require("./pages/admin/UpcomingEventsManager");
var ProtectedRoute = function (_a) {
    var children = _a.children, _b = _a.requireAdmin, requireAdmin = _b === void 0 ? false : _b;
    var _c = (0, AuthContext_1.useAuth)(), isAuthenticated = _c.isAuthenticated, isAdmin = _c.isAdmin, isLoading = _c.isLoading;
    if (isLoading) {
        return (<div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>);
    }
    if (!isAuthenticated) {
        return <react_router_dom_1.Navigate to="/login" replace/>;
    }
    if (requireAdmin && !isAdmin) {
        return <react_router_dom_1.Navigate to="/admin/login" replace/>;
    }
    return children;
};
var AppContent = function () {
    var _a = (0, AuthContext_1.useAuth)(), isAuthenticated = _a.isAuthenticated, isAdmin = _a.isAdmin;
    // Define public routes that don't require authentication
    var publicRoutes = ["/", "/login", "/admin/login", "/admin/signup", "/signup", "/forgot-password"];
    // Check if current path is a public route
    var isPublicRoute = function (path) {
        // Handle exact matches
        if (publicRoutes.includes(path)) {
            return true;
        }
        // For paths with parameters (like :id), we need to check the base path
        // This handles routes like /courses/:id by checking if they start with a public route prefix
        return publicRoutes.some(function (publicPath) {
            // Skip the root path as it would match everything
            if (publicPath === '/')
                return false;
            return path.startsWith(publicPath);
        });
    };
    // Enhanced ProtectedRoute that checks the current path
    var RouteGuard = function (_a) {
        var path = _a.path, element = _a.element;
        if (isPublicRoute(path)) {
            // If already authenticated, redirect to dashboard for certain public routes
            if (isAuthenticated && (path === "/login" || path === "/signup" || path === "/")) {
                return <react_router_dom_1.Navigate to="/dashboard" replace/>;
            }
            // If already authenticated as admin, redirect to admin dashboard for admin login/signup
            if (isAuthenticated && isAdmin && (path === "/admin/login" || path === "/admin/signup")) {
                return <react_router_dom_1.Navigate to="/admin/dashboard" replace/>;
            }
            return <>{element}</>;
        }
        // For non-public routes, use the ProtectedRoute component
        return <ProtectedRoute requireAdmin={path.startsWith("/admin/")}>{element}</ProtectedRoute>;
    };
    var router = (0, react_router_dom_1.createBrowserRouter)([
        {
            path: "/",
            element: <RouteGuard path="/" element={<SelectRole_1.default />}/>,
        },
        {
            path: "/login",
            element: <RouteGuard path="/login" element={<Login_1.default />}/>,
        },
        {
            path: "/admin/login",
            element: <RouteGuard path="/admin/login" element={<AdminLogin_1.default />}/>,
        },
        {
            path: "/admin/signup",
            element: <RouteGuard path="/admin/signup" element={<AdminSignUp_1.default />}/>,
        },
        {
            path: "/signup",
            element: <RouteGuard path="/signup" element={<SignUp_1.default />}/>,
        },
        {
            path: "/forgot-password",
            element: <RouteGuard path="/forgot-password" element={<ForgotPassword_1.default />}/>,
        },
        {
            path: "/admin/dashboard",
            element: <RouteGuard path="/admin/dashboard" element={<Layout_1.default>
          <AdminDashboard_1.default />
        </Layout_1.default>}/>,
        },
        {
            path: "/admin/recent-activity",
            element: <RouteGuard path="/admin/recent-activity" element={<Layout_1.default>
          <RecentActivity_1.default />
        </Layout_1.default>}/>,
        },
        {
            path: "/admin/add",
            element: <RouteGuard path="/admin/add" element={<Layout_1.default>
          <AddPage_1.default />
        </Layout_1.default>}/>,
        },
        {
            path: "/admin/add-course",
            element: <RouteGuard path="/admin/add-course" element={<Layout_1.default>
          <AddCourse_1.default />
        </Layout_1.default>}/>,
        },
        {
            path: "/admin/add-assignment",
            element: <RouteGuard path="/admin/add-assignment" element={<Layout_1.default>
          <AddAssignment_1.default />
        </Layout_1.default>}/>,
        },
        {
            path: "/admin/add-live-class",
            element: <RouteGuard path="/admin/add-live-class" element={<Layout_1.default>
          <AddLiveClass_1.default />
        </Layout_1.default>}/>,
        },
        {
            path: "/admin/courses",
            element: <RouteGuard path="/admin/courses" element={<Layout_1.default>
          <AdminCourses_1.default />
        </Layout_1.default>}/>,
        },
        {
            path: "/admin/assignments",
            element: <RouteGuard path="/admin/assignments" element={<Layout_1.default>
          <AdminAssignments_1.default />
        </Layout_1.default>}/>,
        },
        {
            path: "/admin/live-classes",
            element: <RouteGuard path="/admin/live-classes" element={<Layout_1.default>
          <AdminLiveClasses_1.default />
        </Layout_1.default>}/>,
        },
        {
            path: "/admin/edit-course/:id",
            element: <RouteGuard path="/admin/edit-course/:id" element={<Layout_1.default>
          <EditCourse_1.default />
        </Layout_1.default>}/>,
        },
        {
            path: "/admin/edit-assignment/:id",
            element: <RouteGuard path="/admin/edit-assignment/:id" element={<Layout_1.default>
          <EditAssignment_1.default />
        </Layout_1.default>}/>,
        },
        {
            path: "/admin/edit-live-class/:id",
            element: <RouteGuard path="/admin/edit-live-class/:id" element={<Layout_1.default>
          <EditLiveClass_1.default />
        </Layout_1.default>}/>,
        },
        {
            path: "/dashboard",
            element: <RouteGuard path="/dashboard" element={<Layout_1.default>
          <Dashboard_1.default />
        </Layout_1.default>}/>,
        },
        {
            path: "/courses",
            element: <RouteGuard path="/courses" element={<Layout_1.default>
          <Courses_1.default />
        </Layout_1.default>}/>,
        },
        {
            path: "/courses/:id",
            element: <RouteGuard path="/courses/:id" element={<Layout_1.default>
          <CourseDetails_1.default />
        </Layout_1.default>}/>,
        },
        {
            path: "/live-classes",
            element: <RouteGuard path="/live-classes" element={<Layout_1.default>
          <LiveClasses_1.default />
        </Layout_1.default>}/>,
        },
        {
            path: "/assignments",
            element: <RouteGuard path="/assignments" element={<Layout_1.default>
          <Assignments_1.default />
        </Layout_1.default>}/>,
        },
        {
            path: "/assignments/:id",
            element: <RouteGuard path="/assignments/:id" element={<Layout_1.default>
          <AssignmentDetails_1.default />
        </Layout_1.default>}/>,
        },
        {
            path: "/my-results",
            element: <RouteGuard path="/my-results" element={<Layout_1.default>
          <MyResults_1.default />
        </Layout_1.default>}/>,
        },
        {
            path: "/attendance",
            element: <RouteGuard path="/attendance" element={<Layout_1.default>
          <Attendance_1.default />
        </Layout_1.default>}/>,
        },
        {
            path: "/profile",
            element: <RouteGuard path="/profile" element={<Layout_1.default>
          <Profile_1.default />
        </Layout_1.default>}/>,
        },
        {
            path: "/admin/class-management",
            element: <RouteGuard path="/admin/class-management" element={<Layout_1.default>
          <ClassManagement_1.default />
        </Layout_1.default>}/>,
        },
        {
            path: "/admin/users",
            element: <RouteGuard path="/admin/users" element={<Layout_1.default>
          <AdminUsers_1.default />
        </Layout_1.default>}/>,
        },
        {
            path: "/admin/settings",
            element: <RouteGuard path="/admin/settings" element={<Layout_1.default>
          <AdminSettings_1.default />
        </Layout_1.default>}/>,
        },
        {
            path: "/admin/profile",
            element: <RouteGuard path="/admin/profile" element={<Layout_1.default>
          <AdminProfile_1.default />
        </Layout_1.default>}/>,
        },
        {
            path: "/admin/upcoming-events",
            element: <RouteGuard path="/admin/upcoming-events" element={<Layout_1.default>
          <UpcomingEventsManager_1.default />
        </Layout_1.default>}/>,
        },
        {
            path: "/certificates",
            element: <RouteGuard path="/certificates" element={<Layout_1.default>
          <Certificates_1.default />
        </Layout_1.default>}/>,
        },
        {
            path: "/certificates/:id",
            element: <RouteGuard path="/certificates/:id" element={<Layout_1.default>
          <CertificatePage_1.default />
        </Layout_1.default>}/>,
        },
        // Catch-all route for unknown paths - shows 404 page
        {
            path: "*",
            element: <NotFound_1.default />
        },
    ]);
    return <react_router_dom_1.RouterProvider router={router}/>;
};
var App = function () {
    return (<AuthContext_1.AuthProvider>
      <AppContent />
      <react_toastify_1.ToastContainer position="top-right" autoClose={3000}/>
    </AuthContext_1.AuthProvider>);
};
exports.default = App;
