import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiBook, FiClock, FiUser, FiStar, FiArrowLeft, FiYoutube } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import courseService from '../services/courseService';
import { Course } from '../types/course';
import { API_URL } from '../config';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { assignmentAPI } from '../services/api';

import SafeDisplay from '../components/SafeDisplay';




// Function to extract YouTube video ID from URL
const getYouTubeVideoId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const CourseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await courseService.getCourseById(id);
        setCourse(data);
        
        // Fetch course assignments
        await assignmentAPI.getAssignmentsByCourse(id);
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Failed to load course details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, user?.id]);

  const handleMaterialDownload = async (courseId: string, materialId: string) => {
    try {
      // Get the auth token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required. Please log in again.');
        return;
      }

      const response = await axios.get(`${API_URL}/courses/${courseId}/materials/${materialId}`, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const material = course?.materials.find(m => m._id === materialId);
      if (!material) return;

      // Get the file extension from the content type
      const contentType = response.headers['content-type'];
      const extension = contentType.split('/')[1] || 'pdf';
      
      // Create a blob with the correct content type
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${material.title}.${extension}`);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Material downloaded successfully');
    } catch (error) {
      console.error('Error downloading material:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
      } else {
        toast.error('Failed to download material');
      }
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Error</h3>
        <p className="mt-1 text-gray-500">{error || 'Course not found'}</p>
        <button
          onClick={() => navigate('/courses')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FiArrowLeft className="mr-2" /> Back to Courses
        </button>
      </div>
    );
  }

  const videoId = course.youtubeLink ? getYouTubeVideoId(course.youtubeLink) : null;

  const getInstructorDisplayName = () => {
    if (typeof course.instructor === 'object' && course.instructor !== null) {
      return course.instructor.name || 'Instructor';
    }
    return typeof course.instructor === 'string' ? course.instructor : 'Instructor';
  };

  const getInstructorEmail = () => {
    if (typeof course.instructor === 'object' && course.instructor !== null) {
      return course.instructor.email || '';
    }
    return '';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <button
        onClick={() => navigate('/courses')}
        className="mb-6 inline-flex items-center text-blue-600 hover:text-blue-800"
      >
        <FiArrowLeft className="mr-2" /> Back to Courses
      </button>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Course Header */}
        <div className="relative h-64 bg-gradient-to-r from-blue-500 to-purple-600 overflow-hidden">
          {course.thumbnail ? (
            <img
              src={`${API_URL}/courses/${course._id}/thumbnail`}
              alt={course.title}
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                console.error('Error loading thumbnail:', e);
                e.currentTarget.src = `${API_URL}/uploads/thumbnails/default.jpg`;
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FiBook className="text-white text-6xl" />
            </div>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <h1 className="text-3xl font-bold text-white text-center px-4">
              <SafeDisplay value={course.title} defaultValue="Untitled Course" />
            </h1>
          </div>
        </div>

        {/* Course Info */}
        <div className="p-6">
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center text-gray-600">
              <FiClock className="mr-2" />
              <span><SafeDisplay value={course.duration} defaultValue="N/A" /></span>
            </div>
            <div className="flex items-center text-gray-600">
              <FiUser className="mr-2" />
              <span><SafeDisplay value={course.enrolledCount || 0} defaultValue="0" /> enrolled</span>
            </div>
            <div className="flex items-center text-gray-600">
              <FiStar className="mr-2 text-yellow-400" />
              <span><SafeDisplay value={course.rating ? course.rating.toFixed(1) : 'New'} defaultValue="New" /></span>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold">Description</h2>
            </div>
            <p className="text-gray-700"><SafeDisplay value={course?.description} defaultValue="No description available" /></p>
          </div>

          {/* YouTube Video Section */}
          <div className="mb-8 bg-gray-50 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FiYoutube className="mr-2 text-red-500" />
              Course Video
            </h2>
            {videoId ? (
              <>
                <div className="relative pt-[56.25%] w-full bg-black rounded-xl overflow-hidden shadow-lg">
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title="Course Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <a 
                    href={course.youtubeLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <FiYoutube className="mr-2" />
                    Watch on YouTube
                  </a>
                  <span className="text-sm text-gray-500">
                    Click to watch this video directly on YouTube
                  </span>
                </div>
              </>
            ) : (
              <div className="bg-gray-100 rounded-xl p-8 text-center">
                <FiYoutube className="mx-auto text-4xl text-gray-400 mb-2" />
                <p className="text-gray-600">No video available for this course</p>
              </div>
            )}
          </div>

          {/* Course Materials */}
          {course.materials && course.materials.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-bold text-gray-900">Course Materials</h3>
              <div className="mt-2 divide-y divide-gray-200">
                {course.materials.map((material) => (
                  <div key={material._id} className="bg-white p-4 rounded-lg shadow">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold">{material.title}</h3>
                        <p className="text-gray-600">{material.description}</p>
                      </div>
                      <button
                        onClick={() => handleMaterialDownload(course._id, material._id)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Course Modules */}
          {course.modules && course.modules.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-bold text-gray-900">Course Modules</h3>
              <div className="mt-2 space-y-4">
                {course.modules.map((module, index) => (
                  <div key={module._id} className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-blue-600 font-semibold">{index + 1}</span>
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-lg font-semibold"><SafeDisplay value={module.title} defaultValue="Untitled Module" /></h3>
                        <p className="text-gray-600 mt-1"><SafeDisplay value={module.description} defaultValue="No description" /></p>
                        {module.content && (
                          <div className="mt-2 text-gray-700">
                            <p><SafeDisplay value={module.content} defaultValue="" /></p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructor Info */}
          <div>
            <h2 className="text-xl font-bold mb-2">Instructor</h2>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                <FiUser className="text-gray-500" />
              </div>
              <div>
                <h3 className="font-medium">
                  <SafeDisplay value={getInstructorDisplayName()} defaultValue="Unknown Instructor" />
                </h3>
                <p className="text-sm text-gray-600">
                  <SafeDisplay value={getInstructorEmail()} defaultValue="" />
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseDetails; 