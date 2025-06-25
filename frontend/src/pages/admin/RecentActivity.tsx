import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiBook, FiCalendar, FiFileText, FiUsers } from 'react-icons/fi';
import courseService from '../../services/courseService';
import assignmentService from '../../services/assignmentService';
import { liveClassService } from '../../services/liveClassService';
import { Course } from '../../types/course';
import { Assignment } from '../../types/assignment';
import { LiveClass } from '../../types/liveClass';

interface RecentItem {
  id: string;
  type: 'course' | 'assignment' | 'liveClass';
  title: string;
  createdAt: string;
  icon: React.ReactNode;
}

const RecentActivity: React.FC = () => {
  const navigate = useNavigate();
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentData = async () => {
      try {
        setLoading(true);
        const [courses, assignments, liveClasses] = await Promise.all([
          courseService.getAllCourses(),
          assignmentService.getAllAssignments(),
          liveClassService.getAllLiveClasses()
        ]);

        const items: RecentItem[] = [
          ...courses.map(course => ({
            id: course._id,
            type: 'course' as const,
            title: course.title,
            createdAt: course.createdAt,
            icon: <FiBook className="text-blue-500" />
          })),
          ...assignments.map(assignment => ({
            id: assignment._id,
            type: 'assignment' as const,
            title: assignment.title,
            createdAt: assignment.createdAt,
            icon: <FiFileText className="text-green-500" />
          })),
          ...liveClasses.map(liveClass => ({
            id: liveClass._id,
            type: 'liveClass' as const,
            title: liveClass.title,
            createdAt: liveClass.createdAt,
            icon: <FiCalendar className="text-purple-500" />
          }))
        ];

        // Sort by creation date, most recent first
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        // Take only the 10 most recent items
        setRecentItems(items.slice(0, 10));
      } catch (err) {
        console.error('Error fetching recent data:', err);
        setError('Failed to load recent activity data');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentData();
  }, []);

  const handleItemClick = (item: RecentItem) => {
    switch (item.type) {
      case 'course':
        navigate(`/courses/${item.id}`);
        break;
      case 'assignment':
        navigate(`/assignments/${item.id}`);
        break;
      case 'liveClass':
        navigate(`/live-classes/${item.id}`);
        break;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'course':
        return 'Course';
      case 'assignment':
        return 'Assignment';
      case 'liveClass':
        return 'Live Class';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Error</h3>
        <p className="mt-1 text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h1>
          
          <div className="space-y-4">
            {recentItems.map((item) => (
              <motion.div
                key={`${item.type}-${item.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => handleItemClick(item)}
              >
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm">
                  {item.icon}
                </div>
                <div className="ml-4 flex-grow">
                  <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="capitalize">{getTypeLabel(item.type)}</span>
                    <span className="mx-2">•</span>
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {recentItems.length === 0 && (
            <div className="text-center py-12">
              <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
              <p className="mt-1 text-sm text-gray-500">New items will appear here as they are added.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default RecentActivity; 