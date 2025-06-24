import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiCalendar, FiClock, FiUsers, FiVideo, FiLock, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Button, Container } from 'react-bootstrap';
import { liveClassService } from '../services/liveClassService';
import { LiveClass } from '../types/liveClass';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
}

export default function LiveClasses() {
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [allLiveClasses, setAllLiveClasses] = useState<LiveClass[]>([]);

  useEffect(() => {
    loadData();
    
    // Update current time every minute to check class status
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Filter classes for the selected date whenever the date changes
    filterClassesByDate();
  }, [selectedDate, allLiveClasses]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching live classes for user role:', user?.role);
      
      const liveClassesData = await liveClassService.getAllLiveClasses(user?.role);
      console.log(`Successfully fetched ${liveClassesData.length} live classes`);
      
      setAllLiveClasses(liveClassesData);
      filterClassesByDate();
    } catch (error) {
      console.error('Error loading live classes:', error);
      if (error instanceof Error) {
        setError(error.message || 'Failed to load live classes');
        toast.error(error.message || 'Failed to load live classes');
      } else {
        setError('An unexpected error occurred while loading live classes');
        toast.error('An unexpected error occurred while loading live classes');
      }
    } finally {
      setLoading(false);
    }
  };

  const filterClassesByDate = () => {
    // Set the time to midnight for date comparison
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const filteredClasses = allLiveClasses.filter(liveClass => {
      const classDate = new Date(liveClass.startTime);
      return classDate >= startOfDay && classDate <= endOfDay;
    });
    
    setLiveClasses(filteredClasses);
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const goToPreviousDay = () => {
    const prevDay = new Date(selectedDate);
    prevDay.setDate(prevDay.getDate() - 1);
    setSelectedDate(prevDay);
  };

  const goToNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setSelectedDate(nextDay);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const formatSelectedDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredLiveClasses = liveClasses.filter(liveClass => {
    const matchesSearch = liveClass.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      liveClass.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const [messages] = useState<Message[]>([
    {
      id: '1',
      sender: 'John Doe',
      content: 'Hello everyone!',
      timestamp: '10:00 AM',
    },
    {
      id: '2',
      sender: 'Dr. Sarah Johnson',
      content: 'Welcome to the class!',
      timestamp: '10:01 AM',
    },
  ]);

  const [selectedClass, setSelectedClass] = useState<LiveClass | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: LiveClass['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getJoinButtonStyle = (liveClass: LiveClass) => {
    const startTime = new Date(liveClass.startTime);
    const endTime = new Date(liveClass.endTime);
    const isOngoing = currentTime >= startTime && currentTime <= endTime;
    const hasStarted = currentTime >= startTime;
    const hasEnded = currentTime > endTime;

    if (hasEnded) {
      return 'bg-gray-400 cursor-not-allowed opacity-50';
    }

    if (isOngoing) {
      return 'bg-green-500 hover:bg-green-600 transform hover:scale-105 transition-all duration-200 shadow-lg';
    }

    if (hasStarted) {
      return 'bg-blue-500 hover:bg-blue-600 transform hover:scale-105 transition-all duration-200 shadow-lg';
    }

    return 'bg-indigo-500 hover:bg-indigo-600 transform hover:scale-105 transition-all duration-200 shadow-lg';
  };

  const getJoinButtonText = (liveClass: LiveClass) => {
    const startTime = new Date(liveClass.startTime);
    const endTime = new Date(liveClass.endTime);
    const isOngoing = currentTime >= startTime && currentTime <= endTime;
    const hasStarted = currentTime >= startTime;
    const hasEnded = currentTime > endTime;

    if (hasEnded) {
      return 'Class Ended';
    }

    if (isOngoing) {
      return 'Join Now';
    }

    if (hasStarted) {
      return 'Join Late';
    }

    return 'Join Now';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Live Classes</h1>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 p-1">
            <button 
              onClick={goToPreviousDay}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Previous day"
            >
              <FiChevronLeft className="text-gray-600" />
            </button>
            
            <button 
              onClick={goToToday}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                selectedDate.toDateString() === new Date().toDateString() 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              Today
            </button>
            
            <div className="px-3 py-1 text-sm font-medium text-gray-700">
              {formatSelectedDate(selectedDate)}
            </div>
            
            <button 
              onClick={goToNextDay}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Next day"
            >
              <FiChevronRight className="text-gray-600" />
            </button>
          </div>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Search classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg my-4">
          <p className="font-medium">Error loading live classes</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={() => loadData()} 
            className="mt-2 bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-md text-sm"
          >
            Try Again
          </button>
        </div>
      ) : filteredLiveClasses.length === 0 ? (
        <div className="text-center py-12">
          <FiVideo className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No live classes scheduled for {formatSelectedDate(selectedDate)}</h3>
          <p className="mt-1 text-sm text-gray-500">Try selecting a different date or check back later.</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLiveClasses.map((liveClass) => (
            <motion.div
              key={liveClass._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300"
          >
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{liveClass.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(liveClass.status)}`}>
                    {liveClass.status}
                </span>
              </div>
                <p className="text-gray-600 mb-4">{liveClass.description}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-500">
                    <FiCalendar className="mr-2" />
                    <span>{formatDate(liveClass.startTime)}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <FiClock className="mr-2" />
                    <span>{new Date(liveClass.startTime).toLocaleTimeString()} - {new Date(liveClass.endTime).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <FiUsers className="mr-2" />
                    <span>{liveClass.participants?.length || 0} participants</span>
                  </div>
                </div>
                
                {currentTime > new Date(liveClass.endTime) ? (
                  <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 flex items-center">
                    <FiLock className="mr-2" />
                    <span>This class has ended and is no longer available to join.</span>
                  </div>
                ) : currentTime < new Date(liveClass.startTime) ? (
                  <div className="bg-blue-50 text-blue-700 p-3 rounded-lg mb-4">
                    <div className="font-medium">Upcoming Class</div>
                    <div className="text-sm">This class will start at the scheduled time.</div>
                  </div>
                ) : (
                  <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4">
                    <div className="font-medium">Class is in progress</div>
                    <div className="text-sm">You can join this class now.</div>
              </div>
                )}
                
                <button
                  onClick={() => {
                    if (currentTime <= new Date(liveClass.endTime)) {
                      window.open(liveClass.meetingLink, '_blank');
                    }
                  }}
                  className={`w-full py-2 px-4 rounded-md text-white font-medium flex items-center justify-center space-x-2 ${getJoinButtonStyle(liveClass)}`}
                  disabled={currentTime > new Date(liveClass.endTime)}
                >
                  <FiVideo className="mr-2" />
                  <span>{getJoinButtonText(liveClass)}</span>
                  </button>
              </div>
            </motion.div>
        ))}
      </div>
      )}

      {/* Chat Section */}
      {selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 hover:text-[#4A90E2] transition-colors duration-200">
                  {selectedClass.title}
                </h2>
                <button
                  onClick={() => setSelectedClass(null)}
                  className="text-gray-500 hover:text-gray-700 hover:scale-110 transition-all duration-200"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className="flex items-start space-x-3 hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200"
                >
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center hover:bg-blue-200 transition-colors duration-200">
                      <span className="text-blue-600 text-sm font-medium">
                        {message.sender.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-baseline space-x-2">
                      <p className="text-sm font-medium text-gray-900 hover:text-[#4A90E2] transition-colors duration-200">
                        {message.sender}
                      </p>
                      <p className="text-xs text-gray-500 hover:text-gray-700 transition-colors duration-200">{message.timestamp}</p>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t">
              <div className="flex space-x-4">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400 transition-colors duration-200"
                />
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 