import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiUser, FiHome, FiBook, FiCalendar, FiFileText, FiAward, FiVideo, FiCheckSquare, FiUsers, FiSettings, FiBookOpen, FiBarChart2 } from 'react-icons/fi';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { classNames } from '../utils/classNames';
import { authAPI } from '../services/api';

interface LayoutProps {
  children: ReactNode;
}

interface NavigationItem {
  name: string;
  path: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface BufferData {
  type: 'Buffer';
  data: number[];
}

interface AvatarObject {
  data: BufferData;
  contentType: string;
}

type AvatarType = string | AvatarObject | null | undefined;

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!isAuthenticated) {
          navigate('/login');
          return;
        }

        const currentPath = location.pathname;
        const userRole = user?.role?.toLowerCase() || 'student';
        
        // Define admin and student routes
        const adminRoutes = ['/admin', '/admin/dashboard', '/admin/courses', '/admin/students', '/admin/teachers', '/admin/live-classes', '/admin/assignments'];
        const studentRoutes = ['/student', '/student/dashboard', '/student/courses', '/student/live-classes', '/student/assignments'];
        const publicRoutes = ['/login', '/admin/login', '/register', '/admin/register'];

        // If on a public route and authenticated, redirect to appropriate dashboard
        if (publicRoutes.includes(currentPath)) {
          if (userRole === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/student/dashboard');
          }
          return;
        }

        // Handle routing based on role and current path
        if (userRole === 'admin') {
          // If admin is on a student route, redirect to admin dashboard
          if (studentRoutes.some(route => currentPath.startsWith(route.split('/')[1]))) {
            console.log('Admin attempting to access student route, redirecting to admin dashboard');
            navigate('/admin/dashboard');
            return;
          }
        } else {
          // If student is on an admin route, redirect to student dashboard
          if (adminRoutes.some(route => currentPath.startsWith(route.split('/')[1]))) {
            console.log('Student attempting to access admin route, redirecting to student dashboard');
            navigate('/student/dashboard');
            return;
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        navigate('/login');
      }
    };

    checkAuth();
  }, [location.pathname, navigate, isAuthenticated, user?.role]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderAvatar = (avatar: any) => {
    if (!avatar) {
      return (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
          <FiUser className="w-4 h-4 text-gray-400" />
        </div>
      );
    }

    try {
      let imageSrc = '';
      
      // Handle MongoDB Buffer object
      if (avatar.data && avatar.data.type === 'Buffer' && Array.isArray(avatar.data.data)) {
        // Process the buffer data in chunks to avoid stack overflow
        const bufferData = avatar.data.data;
        let binary = '';
        const chunkSize = 1000;
        for (let i = 0; i < bufferData.length; i += chunkSize) {
          const chunk = bufferData.slice(i, i + chunkSize);
          binary += String.fromCharCode.apply(null, chunk);
        }
        imageSrc = `data:image/jpeg;base64,${btoa(binary)}`;
      }
      // Handle raw MongoDB Buffer
      else if (avatar.type === 'Buffer' && Array.isArray(avatar.data)) {
        // Process the buffer data in chunks to avoid stack overflow
        const bufferData = avatar.data;
        let binary = '';
        const chunkSize = 1000;
        for (let i = 0; i < bufferData.length; i += chunkSize) {
          const chunk = bufferData.slice(i, i + chunkSize);
          binary += String.fromCharCode.apply(null, chunk);
        }
        imageSrc = `data:image/jpeg;base64,${btoa(binary)}`;
      }
      // Handle base64 string
      else if (typeof avatar === 'string') {
        if (avatar.startsWith('data:')) {
          imageSrc = avatar;
        }
        else if (avatar.startsWith('/9j/') || avatar.startsWith('iVBOR')) {
          imageSrc = `data:image/jpeg;base64,${avatar}`;
        }
        else {
          // Assume it's a filename
          imageSrc = `${import.meta.env.VITE_API_URL}/uploads/${avatar}`;
        }
      }
      // Handle object with data property (from Profile page)
      else if (typeof avatar === 'object' && avatar.data) {
        if (typeof avatar.data === 'string') {
          // If it's already a complete data URL, return it
          if (avatar.data.startsWith('data:')) {
            imageSrc = avatar.data;
          } else {
            // If it's a raw base64 string, add the data URL prefix
            const contentType = avatar.contentType || 'image/jpeg';
            imageSrc = `data:${contentType};base64,${avatar.data}`;
          }
        }
      }
      // Handle any other object format
      else if (typeof avatar === 'object') {
        console.log('Avatar object structure:', JSON.stringify(avatar, null, 2));
        // Try to extract any string property that might be a URL or base64
        for (const key in avatar) {
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
          return (
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <FiUser className="w-4 h-4 text-gray-400" />
            </div>
          );
        }
      }
      else {
        console.error('Unknown avatar format:', avatar);
        return (
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <FiUser className="w-4 h-4 text-gray-400" />
          </div>
        );
      }

      return (
        <img
          src={imageSrc}
          alt={user?.name || 'User avatar'}
          className="w-8 h-8 rounded-full object-cover"
          onError={(e) => {
            console.error('Error loading avatar image:', e);
            setImageError(true);
          }}
          onLoad={() => {
            console.log('Avatar image loaded successfully');
            setImageError(false);
          }}
        />
      );
    } catch (error) {
      console.error('Error processing avatar:', error);
      return (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
          <FiUser className="w-4 h-4 text-gray-400" />
        </div>
      );
    }
  };

  const navigation: NavigationItem[] = [
    { name: 'Dashboard', path: '/dashboard', icon: FiHome },
    { name: 'Courses', path: '/courses', icon: FiBook },
    { name: 'Live Classes', path: '/live-classes', icon: FiCalendar },
    { name: 'Assignments', path: '/assignments', icon: FiFileText },
    { name: 'My Results', path: '/my-results', icon: FiBarChart2 },
    { name: 'Attendance', path: '/attendance', icon: FiCheckSquare },
    { name: 'Certificates', path: '/certificates', icon: FiAward },
    { name: 'Profile', path: '/profile', icon: FiUser },
  ];

  // Add admin-specific navigation items
  const adminNavItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: FiHome },
    { name: 'Courses', path: '/admin/courses', icon: FiBook },
    { name: 'Live Classes', path: '/admin/live-classes', icon: FiVideo },
    { name: 'Assignments', path: '/admin/assignments', icon: FiFileText },
    { name: 'Class Management', path: '/admin/class-management', icon: FiCalendar },
    { name: 'Profile', path: '/admin/profile', icon: FiUser },
  ];

  // Use the correct navigation items based on user role
  const currentNavigation = isAdmin ? adminNavItems : navigation;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-['Roboto']">
      {/* Top Navigation Bar */}
      <header className="fixed inset-x-0 top-0 z-50 bg-[#002147] text-white shadow-md">
        <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <Link to="/" className="-m-1.5 p-1.5">
              <span className="text-2xl font-bold text-white">LMS Platform</span>
            </Link>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-white hover:bg-[#003366] transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 text-sm font-semibold leading-6 text-white hover:text-blue-200 transition-colors"
              >
                <span>{user?.name}</span>
                {renderAvatar(user?.avatar)}
              </button>
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
                  >
                    <div className="py-1" role="menu">
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#002147] transition-colors"
                        role="menuitem"
                      >
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </nav>
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden"
            >
              <div className="fixed inset-0 z-50" />
              <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-[#002147] px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
                <div className="flex items-center justify-between">
                  <Link to="/" className="-m-1.5 p-1.5">
                    <span className="text-2xl font-bold text-white">LMS</span>
                  </Link>
                  <button
                    type="button"
                    className="-m-2.5 rounded-md p-2.5 text-white hover:bg-[#003366] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="sr-only">Close menu</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-6 flow-root">
                  <div className="-my-6 divide-y divide-blue-500/10">
                    <div className="py-6">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3 px-3 py-2">
                          {renderAvatar(user?.avatar)}
                          <div className="text-base font-semibold leading-7 text-white">
                            {user?.name}
                          </div>
                        </div>
                        <Link
                          to="/profile"
                          className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-white hover:bg-[#003366] transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-white hover:bg-[#003366] transition-colors"
                        >
                          Logout
                        </button>
                      </div>
            </div>
          </div>
        </div>
      </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-[#002147] shadow-lg mt-16">
        <div className="flex flex-col h-full">
          {/* Navigation Menu */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {currentNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={classNames(
                  location.pathname === item.path
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                )}
              >
                {item.icon && <item.icon className="mr-3 h-6 w-6 flex-shrink-0" />}
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64 pt-16">
        <main className="py-6">
          <div className="px-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;