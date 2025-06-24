import { BrowserRouter as Router, Routes, Route, Navigate, createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import global styles
import './styles/globals.css';

// Import components
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import AdminSignUp from './pages/AdminSignUp';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AddPage from './pages/admin/AddPage';
import AddCourse from './pages/admin/AddCourse';
import AddAssignment from './pages/admin/AddAssignment';
import AddLiveClass from './pages/admin/AddLiveClass';
import SelectRole from './pages/SelectRole';
import Courses from './pages/Courses';
import LiveClasses from './pages/LiveClasses';
import Assignments from './pages/Assignments';
import Profile from './pages/Profile';
import { AuthProvider, useAuth } from './context/AuthContext';
import CourseDetails from './pages/CourseDetails';
import RecentActivity from './pages/admin/RecentActivity';
import AdminCourses from './pages/admin/AdminCourses';
import AdminAssignments from './pages/admin/AdminAssignments';
import AdminLiveClasses from './pages/admin/AdminLiveClasses';
import EditCourse from './pages/admin/EditCourse';
import EditAssignment from './pages/admin/EditAssignment';
import EditLiveClass from './pages/admin/EditLiveClass';
import AssignmentDetails from './pages/AssignmentDetails';
import Attendance from './pages/Attendance';
import ClassManagement from './pages/admin/ClassManagement';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSettings from './pages/admin/AdminSettings';
import AdminProfile from './pages/admin/AdminProfile';
import Certificates from './pages/Certificates';
import CertificatePage from './pages/CertificatePage';
import MyResults from './pages/MyResults';
import NotFound from './components/NotFound';
import UpcomingEventsManager from './pages/admin/UpcomingEventsManager';

// Import new dashboard components
import StudentDashboardComponent from './components/Dashboard/StudentDashboard';
import AdminDashboardComponent from './components/Dashboard/AdminDashboard';

const ProtectedRoute = ({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

const AppContent = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  // Define public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/admin/login", "/admin/signup", "/signup", "/forgot-password"];

  // Check if current path is a public route
  const isPublicRoute = (path: string) => {
    // Handle exact matches
    if (publicRoutes.includes(path)) {
      return true;
    }

    // For paths with parameters (like :id), we need to check the base path
    // This handles routes like /courses/:id by checking if they start with a public route prefix
    return publicRoutes.some(publicPath => {
      // Skip the root path as it would match everything
      if (publicPath === '/') return false;
      return path.startsWith(publicPath);
    });
  };

  // Enhanced ProtectedRoute that checks the current path
  const RouteGuard = ({ path, element }: { path: string, element: React.ReactNode }) => {
    if (isPublicRoute(path)) {
      // If already authenticated, redirect to dashboard for certain public routes
      if (isAuthenticated && (path === "/login" || path === "/signup" || path === "/")) {
        return <Navigate to="/dashboard" replace />;
      }
      // If already authenticated as admin, redirect to admin dashboard for admin login/signup
      if (isAuthenticated && isAdmin && (path === "/admin/login" || path === "/admin/signup")) {
        return <Navigate to="/admin/dashboard" replace />;
      }
      return <>{element}</>;
    }

    // For non-public routes, use the ProtectedRoute component
    return <ProtectedRoute requireAdmin={path.startsWith("/admin/")}>{element}</ProtectedRoute>;
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: <RouteGuard path="/" element={<SelectRole />} />,
    },
    {
      path: "/login",
      element: <RouteGuard path="/login" element={<Login />} />,
    },
    {
      path: "/admin/login",
      element: <RouteGuard path="/admin/login" element={<AdminLogin />} />,
    },
    {
      path: "/admin/signup",
      element: <RouteGuard path="/admin/signup" element={<AdminSignUp />} />,
    },
    {
      path: "/signup",
      element: <RouteGuard path="/signup" element={<SignUp />} />,
    },
    {
      path: "/forgot-password",
      element: <RouteGuard path="/forgot-password" element={<ForgotPassword />} />,
    },
    {
      path: "/admin/dashboard",
      element: <RouteGuard path="/admin/dashboard" element={
        <Layout>
          <AdminDashboard />
        </Layout>
      } />,
    },
    {
      path: "/admin/recent-activity",
      element: <RouteGuard path="/admin/recent-activity" element={
        <Layout>
          <RecentActivity />
        </Layout>
      } />,
    },
    {
      path: "/admin/add",
      element: <RouteGuard path="/admin/add" element={
        <Layout>
          <AddPage />
        </Layout>
      } />,
    },
    {
      path: "/admin/add-course",
      element: <RouteGuard path="/admin/add-course" element={
        <Layout>
          <AddCourse />
        </Layout>
      } />,
    },
    {
      path: "/admin/add-assignment",
      element: <RouteGuard path="/admin/add-assignment" element={
        <Layout>
          <AddAssignment />
        </Layout>
      } />,
    },
    {
      path: "/admin/add-live-class",
      element: <RouteGuard path="/admin/add-live-class" element={
        <Layout>
          <AddLiveClass />
        </Layout>
      } />,
    },
    {
      path: "/admin/courses",
      element: <RouteGuard path="/admin/courses" element={
        <Layout>
          <AdminCourses />
        </Layout>
      } />,
    },
    {
      path: "/admin/assignments",
      element: <RouteGuard path="/admin/assignments" element={
        <Layout>
          <AdminAssignments />
        </Layout>
      } />,
    },
    {
      path: "/admin/live-classes",
      element: <RouteGuard path="/admin/live-classes" element={
        <Layout>
          <AdminLiveClasses />
        </Layout>
      } />,
    },
    {
      path: "/admin/edit-course/:id",
      element: <RouteGuard path="/admin/edit-course/:id" element={
        <Layout>
          <EditCourse />
        </Layout>
      } />,
    },
    {
      path: "/admin/edit-assignment/:id",
      element: <RouteGuard path="/admin/edit-assignment/:id" element={
        <Layout>
          <EditAssignment />
        </Layout>
      } />,
    },
    {
      path: "/admin/edit-live-class/:id",
      element: <RouteGuard path="/admin/edit-live-class/:id" element={
        <Layout>
          <EditLiveClass />
        </Layout>
      } />,
    },
    {
      path: "/dashboard",
      element: <RouteGuard path="/dashboard" element={
        <Layout>
          <Dashboard />
        </Layout>
      } />,
    },
    {
      path: "/courses",
      element: <RouteGuard path="/courses" element={
        <Layout>
          <Courses />
        </Layout>
      } />,
    },
    {
      path: "/courses/:id",
      element: <RouteGuard path="/courses/:id" element={
        <Layout>
          <CourseDetails />
        </Layout>
      } />,
    },
    {
      path: "/live-classes",
      element: <RouteGuard path="/live-classes" element={
        <Layout>
          <LiveClasses />
        </Layout>
      } />,
    },
    {
      path: "/assignments",
      element: <RouteGuard path="/assignments" element={
        <Layout>
          <Assignments />
        </Layout>
      } />,
    },
    {
      path: "/assignments/:id",
      element: <RouteGuard path="/assignments/:id" element={
        <Layout>
          <AssignmentDetails />
        </Layout>
      } />,
    },
    {
      path: "/my-results",
      element: <RouteGuard path="/my-results" element={
        <Layout>
          <MyResults />
        </Layout>
      } />,
    },
    {
      path: "/attendance",
      element: <RouteGuard path="/attendance" element={
        <Layout>
          <Attendance />
        </Layout>
      } />,
    },
    {
      path: "/profile",
      element: <RouteGuard path="/profile" element={
        <Layout>
          <Profile />
        </Layout>
      } />,
    },
    {
      path: "/admin/class-management",
      element: <RouteGuard path="/admin/class-management" element={
        <Layout>
          <ClassManagement />
        </Layout>
      } />,
    },
    {
      path: "/admin/users",
      element: <RouteGuard path="/admin/users" element={
        <Layout>
          <AdminUsers />
        </Layout>
      } />,
    },
    {
      path: "/admin/settings",
      element: <RouteGuard path="/admin/settings" element={
        <Layout>
          <AdminSettings />
        </Layout>
      } />,
    },
    {
      path: "/admin/profile",
      element: <RouteGuard path="/admin/profile" element={
        <Layout>
          <AdminProfile />
        </Layout>
      } />,
    },
    {
      path: "/admin/upcoming-events",
      element: <RouteGuard path="/admin/upcoming-events" element={
        <Layout>
          <UpcomingEventsManager />
        </Layout>
      } />,
    },
    {
      path: "/certificates",
      element: <RouteGuard path="/certificates" element={
        <Layout>
          <Certificates />
        </Layout>
      } />,
    },
    {
      path: "/certificates/:id",
      element: <RouteGuard path="/certificates/:id" element={
        <Layout>
          <CertificatePage />
        </Layout>
      } />,
    },
    // Catch-all route for unknown paths - shows 404 page
    {
      path: "*",
      element: <NotFound />
    },
  ]);

  return <RouterProvider router={router} />;
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  );
};

export default App;
