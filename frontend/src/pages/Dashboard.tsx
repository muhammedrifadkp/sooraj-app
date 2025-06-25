import React, { useState, useEffect } from 'react';
import { Container, Card } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { FiBook, FiCalendar, FiVideo, FiClock, FiExternalLink } from 'react-icons/fi';
import { courseAPI, assignmentAPI, liveClassAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import StudentDashboardComponent from '../components/Dashboard/StudentDashboard';

interface Course {
    _id: string;
  title: string;
    description: string;
    department: 'CSE' | 'EEE' | 'MECH';
}

interface LiveClass {
    _id: string;
  title: string;
    startTime: string;
    endTime: string;
    instructor: string;
    meetingLink?: string;
    courseId?: string;
    courseName?: string;
}

interface DashboardStats {
    coursesInProgress: number;
    totalAssignments: number;
    liveClasses: number;
    totalCourses: number;
}

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [liveClasses, setLiveClasses] = useState<any[]>([]);
    const [upcomingLiveClasses, setUpcomingLiveClasses] = useState<LiveClass[]>([]);
    const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
        coursesInProgress: 0,
        totalAssignments: 0,
        liveClasses: 0,
        totalCourses: 0
    });

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all courses
            const allCoursesResponse = await courseAPI.getAllCourses();
            const allCourses = allCoursesResponse?.data || [];

            // Fetch enrolled courses
            const enrolledCoursesResponse = await courseAPI.getEnrolledCourses();

            // Handle both array and object responses
            let enrolledCourses = [];
            if (Array.isArray(enrolledCoursesResponse)) {
                enrolledCourses = enrolledCoursesResponse;
            } else if (enrolledCoursesResponse?.data && Array.isArray(enrolledCoursesResponse.data)) {
                enrolledCourses = enrolledCoursesResponse.data;
            } else if (typeof enrolledCoursesResponse === 'object') {
                const possibleArrays = Object.values(enrolledCoursesResponse).filter(val => Array.isArray(val));
                if (possibleArrays.length > 0) {
                    enrolledCourses = possibleArrays[0];
                } else if (enrolledCoursesResponse.data && typeof enrolledCoursesResponse.data === 'object') {
                    const nestedPossibleArrays = Object.values(enrolledCoursesResponse.data).filter(val => Array.isArray(val));
                    if (nestedPossibleArrays.length > 0) {
                        enrolledCourses = nestedPossibleArrays[0];
                    }
                }
            }

            setEnrolledCourses(enrolledCourses);

            // Calculate dashboard stats
            const enrolledCount = enrolledCourses.length;
            const studentDepartment = user?.department || 'CSE';
            const departmentCoursesCount = allCourses.filter((course: Course) => course.department === studentDepartment).length;

            // Fetch assignments for enrolled courses
            const assignments = await Promise.all(
                enrolledCourses.map(async (course) => {
                    try {
                        const courseAssignments = await assignmentAPI.getAssignmentsByCourse(course._id);
                        return courseAssignments;
                    } catch (error) {
                        console.error(`Error fetching assignments for course ${course._id}:`, error);
                        return [];
                    }
                })
            ).then(results => results.flat());

            // Calculate total assignments
            const today = new Date();
            const totalAssignments = assignments.length;

            // Log the total assignments for debugging
            console.log('Total assignments:', totalAssignments);

            // Fetch live classes
            const liveClasses = await liveClassAPI.getMyLiveClasses();
            const upcomingLiveClasses = liveClasses.filter(liveClass => {
                const classDate = new Date(liveClass.startTime);
                return classDate > today;
            });

            setLiveClasses(liveClasses);
            setUpcomingLiveClasses(upcomingLiveClasses);

            // Set the dashboard stats
            setDashboardStats({
                coursesInProgress: enrolledCount,
                totalAssignments: totalAssignments,
                liveClasses: upcomingLiveClasses.length,
                totalCourses: departmentCoursesCount
            });

            // Set assignments for display
            setAssignments(assignments);

            // Update the title to show total assignments count
            document.title = `LMS - ${totalAssignments > 0 ? `(${totalAssignments} Total Assignments)` : ''}`;

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            setError('Failed to load dashboard data');
            toast.error('Failed to load dashboard data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Container className="py-8">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-8">
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            </Container>
        );
    }

    const stats = [
        {
            title: `Total ${user?.department || 'CSE'} Courses`,
            value: dashboardStats.totalCourses,
            icon: <FiBook className="text-xl" />,
            color: 'bg-green-500'
        },
        {
            title: "Today's Live Classes",
            value: dashboardStats.liveClasses,
            icon: <FiCalendar className="text-xl" />,
            color: 'bg-yellow-500'
        },
        {
            title: 'Total Assignments',
            value: dashboardStats.totalAssignments,
            icon: <FiCalendar className="text-xl" />,
            color: 'bg-orange-500'
        }
    ];

  return (
    <div>
      {loading ? (
        <Container className="py-8">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </Container>
      ) : error ? (
        <Container className="py-8">
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        </Container>
      ) : (
        // Use our new styled dashboard component
        <StudentDashboardComponent />
      )}
    </div>
  );
};

export default Dashboard;