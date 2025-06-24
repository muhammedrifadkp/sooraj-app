import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiTrash2, FiChevronLeft, FiChevronRight, FiSave, FiEdit2 } from 'react-icons/fi';
import { liveClassAPI } from '../../services/api';
import { LiveClass } from '../../types/liveClass';
import axios from 'axios';
import { API_URL } from '../../config';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  hasClass: boolean;
  classes: LiveClass[];
  isHoliday: boolean;
  holidayName?: string;
}

interface NationalHoliday {
  date: string;
  name: string;
  type: string;
}

interface SavedHoliday {
  _id?: string;
  date: string;
  name: string;
  type: string;
}

const ClassManagement = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [holidays, setHolidays] = useState<Set<string>>(new Set());
  const [holidayNames, setHolidayNames] = useState<Record<string, string>>({});
  const [isSavingHolidays, setIsSavingHolidays] = useState(false);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<{date: Date, name: string} | null>(null);
  const [newHolidayName, setNewHolidayName] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Use useEffect to initialize weekends as holidays
  useEffect(() => {
    const initializeCalendar = async () => {
      try {
        // Load all data in parallel
        const [savedHolidaysResponse, classesResponse] = await Promise.all([
          axios.get(`${API_URL}/holidays`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }),
          liveClassAPI.getAllLiveClasses()
        ]);
        
        // Process saved holidays
        const savedHolidays = Array.isArray(savedHolidaysResponse.data) ? savedHolidaysResponse.data : [];
        console.log('Loaded saved holidays from MongoDB:', savedHolidays);
        
        // Set live classes
        setLiveClasses(classesResponse.data || []);
        
        // Initialize holidays state with saved holidays
        const initialHolidays = new Set<string>();
        const initialHolidayNames: Record<string, string> = {};
        
        // Add saved holidays first
        savedHolidays.forEach(holiday => {
          const dateString = new Date(holiday.date).toISOString().split('T')[0];
          initialHolidays.add(dateString);
          initialHolidayNames[dateString] = holiday.name;
        });
        
        // Then add weekends
        const today = new Date();
        const currentYear = today.getFullYear();
        const nextYear = currentYear + 1;
        
        // Add weekends for current year and next year
        [currentYear, nextYear].forEach(year => {
          for (let month = 0; month < 12; month++) {
            const lastDay = new Date(year, month + 1, 0);
            
            for (let day = 1; day <= lastDay.getDate(); day++) {
              const date = new Date(year, month, day);
              const dayOfWeek = date.getDay();
              
              if (dayOfWeek === 6 || dayOfWeek === 0) {
                const dateString = date.toISOString().split('T')[0];
                initialHolidays.add(dateString);
                
                // Only set weekend name if not already set by a saved holiday
                if (!initialHolidayNames[dateString]) {
                  initialHolidayNames[dateString] = dayOfWeek === 6 ? 'Saturday' : 'Sunday';
                }
              }
            }
          }
        });
        
        console.log('Setting initial holidays state:', Array.from(initialHolidays));
        setHolidays(initialHolidays);
        setHolidayNames(initialHolidayNames);
        
        // Load Indian holidays
        await loadIndianHolidays();
        
        setLoading(false);
      } catch (error) {
        console.error('Error initializing calendar:', error);
        setError('Failed to initialize calendar');
        setLoading(false);
      }
    };

    initializeCalendar();
  }, []);

  // Load saved holidays from MongoDB
  const loadSavedHolidays = async () => {
    try {
      console.log('Loading saved holidays from MongoDB...');
      const response = await axios.get(`${API_URL}/holidays`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const savedHolidays = Array.isArray(response.data) ? response.data : [];
      console.log('Loaded saved holidays:', savedHolidays);
      
      // Create new sets/objects to avoid mutating state directly
      const newHolidays = new Set<string>();
      const newHolidayNames: Record<string, string> = {};
      
      savedHolidays.forEach(holiday => {
        const dateString = new Date(holiday.date).toISOString().split('T')[0];
        newHolidays.add(dateString);
        newHolidayNames[dateString] = holiday.name;
      });
      
      console.log('Setting holidays state with saved holidays:', Array.from(newHolidays));
      setHolidays(newHolidays);
      setHolidayNames(newHolidayNames);
      
      return savedHolidays;
    } catch (error) {
      console.error('Error loading saved holidays:', error);
      // Don't set error state here as it's not critical
      return [];
    }
  };

  // Save holidays to MongoDB
  const saveHolidaysToMongoDB = async () => {
    try {
      setIsSavingHolidays(true);
      setError(null);
      setSaveSuccess(false);
      
      // Convert holidays to array format for saving
      const holidaysToSave = Array.from(holidays).map(dateString => ({
        date: dateString,
        name: holidayNames[dateString] || 'Holiday',
        type: dateString.includes('Saturday') || dateString.includes('Sunday') ? 'weekend' : 'custom'
      }));
      
      console.log('Saving holidays to MongoDB:', holidaysToSave);
      
      const response = await axios.post(`${API_URL}/holidays`, { holidays: holidaysToSave }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('Holidays save response:', response.data);
      
      // Verify the save was successful by fetching the latest holidays
      const verifyResponse = await axios.get(`${API_URL}/holidays`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const savedHolidays = Array.isArray(verifyResponse.data) ? verifyResponse.data : [];
      console.log('Verified saved holidays:', savedHolidays);
      
      // Update local state with the verified saved holidays
      const newHolidays = new Set<string>();
      const newHolidayNames: Record<string, string> = {};
      
      // First add saved holidays from MongoDB
      savedHolidays.forEach((holiday: any) => {
        const dateString = new Date(holiday.date).toISOString().split('T')[0];
        newHolidays.add(dateString);
        newHolidayNames[dateString] = holiday.name;
      });
      
      // Then add weekends that might not be in the database
      const today = new Date();
      const currentYear = today.getFullYear();
      const nextYear = currentYear + 1;
      
      [currentYear, nextYear].forEach(year => {
        for (let month = 0; month < 12; month++) {
          const lastDay = new Date(year, month + 1, 0);
          
          for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(year, month, day);
            const dayOfWeek = date.getDay();
            
            if (dayOfWeek === 6 || dayOfWeek === 0) {
              const dateString = date.toISOString().split('T')[0];
              newHolidays.add(dateString);
              
              // Only set weekend name if not already set by a saved holiday
              if (!newHolidayNames[dateString]) {
                newHolidayNames[dateString] = dayOfWeek === 6 ? 'Saturday' : 'Sunday';
              }
            }
          }
        }
      });
      
      console.log('Updating local state with verified holidays:', Array.from(newHolidays));
      setHolidays(newHolidays);
      setHolidayNames(newHolidayNames);
      
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving holidays:', error);
      setError('Failed to save holidays. Please try again.');
    } finally {
      setIsSavingHolidays(false);
    }
  };

  // Load Indian holidays by default
  const loadIndianHolidays = async () => {
    try {
      // Get the current year
      const currentYear = new Date().getFullYear();
      
      // Fetch holidays for current year and next year
      const years = [currentYear, currentYear + 1];
      const allHolidays: NationalHoliday[] = [];
      
      for (const year of years) {
        // Use the Google Calendar API to fetch holidays
        // Note: In a real implementation, you would need to set up Google Calendar API credentials
        // For this example, we'll simulate the API call with a timeout
        const response = await fetchIndianHolidaysForYear(year);
        allHolidays.push(...response);
      }
      
      // Update holidays state with the fetched holidays while preserving existing holidays
      setHolidays(prevHolidays => {
        const newHolidays = new Set(prevHolidays);
        allHolidays.forEach(holiday => {
          newHolidays.add(holiday.date);
        });
        return newHolidays;
      });
      
      setHolidayNames(prevNames => {
        const newNames = { ...prevNames };
        allHolidays.forEach(holiday => {
          // Only set name if not already set (preserve saved holiday names)
          if (!newNames[holiday.date]) {
            newNames[holiday.date] = holiday.name;
          }
        });
        return newNames;
      });
      
    } catch (error) {
      console.error('Error loading Indian holidays:', error);
      // Don't set error state here as it's not critical
    }
  };

  // Simulate fetching Indian national holidays
  const fetchIndianHolidaysForYear = async (year: number): Promise<NationalHoliday[]> => {
    // In a real implementation, this would be an API call to a holiday calendar service
    // For this example, we'll return a list of Indian national holidays
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Indian national holidays
    const indianHolidays: NationalHoliday[] = [
      { date: `${year}-01-01`, name: "New Year's Day", type: "national" },
      { date: `${year}-01-26`, name: "Republic Day", type: "national" },
      { date: `${year}-08-15`, name: "Independence Day", type: "national" },
      { date: `${year}-10-02`, name: "Gandhi Jayanti", type: "national" },
      { date: `${year}-12-25`, name: "Christmas Day", type: "national" },
    ];
    
    // Add holidays with variable dates based on lunar calendar
    // These are approximate dates and would need to be calculated properly in a real implementation
    
    // Diwali (usually in October or November)
    const diwaliDate = calculateDiwaliDate(year);
    indianHolidays.push({ date: diwaliDate, name: "Diwali", type: "national" });
    
    // Holi (usually in March)
    const holiDate = calculateHoliDate(year);
    indianHolidays.push({ date: holiDate, name: "Holi", type: "national" });
    
    // Eid al-Fitr (end of Ramadan)
    const eidAlFitrDate = calculateEidAlFitrDate(year);
    indianHolidays.push({ date: eidAlFitrDate, name: "Eid al-Fitr", type: "national" });
    
    // Eid al-Adha (Feast of the Sacrifice)
    const eidAlAdhaDate = calculateEidAlAdhaDate(year);
    indianHolidays.push({ date: eidAlAdhaDate, name: "Eid al-Adha", type: "national" });
    
    // Raksha Bandhan (usually in August)
    const rakshaBandhanDate = calculateRakshaBandhanDate(year);
    indianHolidays.push({ date: rakshaBandhanDate, name: "Raksha Bandhan", type: "national" });
    
    // Onam (usually in August or September)
    const onamDate = calculateOnamDate(year);
    indianHolidays.push({ date: onamDate, name: "Onam", type: "national" });
    
    // Dussehra (usually in September or October)
    const dussehraDate = calculateDussehraDate(year);
    indianHolidays.push({ date: dussehraDate, name: "Dussehra", type: "national" });
    
    // Makar Sankranti (usually in January)
    const makarSankrantiDate = calculateMakarSankrantiDate(year);
    indianHolidays.push({ date: makarSankrantiDate, name: "Makar Sankranti", type: "national" });
    
    // Pongal (usually in January)
    const pongalDate = calculatePongalDate(year);
    indianHolidays.push({ date: pongalDate, name: "Pongal", type: "national" });
    
    // Ugadi/Gudi Padwa (usually in March or April)
    const ugadiDate = calculateUgadiDate(year);
    indianHolidays.push({ date: ugadiDate, name: "Ugadi/Gudi Padwa", type: "national" });
    
    // Buddha Purnima (usually in April or May)
    const buddhaPurnimaDate = calculateBuddhaPurnimaDate(year);
    indianHolidays.push({ date: buddhaPurnimaDate, name: "Buddha Purnima", type: "national" });
    
    // Guru Nanak Jayanti (usually in November)
    const guruNanakJayantiDate = calculateGuruNanakJayantiDate(year);
    indianHolidays.push({ date: guruNanakJayantiDate, name: "Guru Nanak Jayanti", type: "national" });
    
    return indianHolidays;
  };

  // Helper functions to calculate approximate dates for Indian festivals
  // These are simplified calculations and would need to be more accurate in a real implementation
  
  const calculateDiwaliDate = (year: number): string => {
    // Diwali is usually in October or November
    // This is a simplified calculation
    const month = 10; // October
    const day = 15 + (year % 10); // Approximate day
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  };
  
  const calculateHoliDate = (year: number): string => {
    // Holi is usually in March
    // This is a simplified calculation
    const month = 3; // March
    const day = 10 + (year % 10); // Approximate day
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  };
  
  const calculateEidAlFitrDate = (year: number): string => {
    // Eid al-Fitr is usually in May or June
    // This is a simplified calculation
    const month = 5; // May
    const day = 15 + (year % 10); // Approximate day
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  };
  
  const calculateEidAlAdhaDate = (year: number): string => {
    // Eid al-Adha is usually in July or August
    // This is a simplified calculation
    const month = 7; // July
    const day = 20 + (year % 10); // Approximate day
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  };
  
  const calculateRakshaBandhanDate = (year: number): string => {
    // Raksha Bandhan is usually in August
    // This is a simplified calculation
    const month = 8; // August
    const day = 5 + (year % 10); // Approximate day
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  };
  
  const calculateOnamDate = (year: number): string => {
    // Onam is usually in August or September
    // This is a simplified calculation
    const month = 8; // August
    const day = 25 + (year % 10); // Approximate day
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  };
  
  const calculateDussehraDate = (year: number): string => {
    // Dussehra is usually in September or October
    // This is a simplified calculation
    const month = 9; // September
    const day = 20 + (year % 10); // Approximate day
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  };
  
  const calculateMakarSankrantiDate = (year: number): string => {
    // Makar Sankranti is usually in January
    // This is a simplified calculation
    const month = 1; // January
    const day = 14 + (year % 10); // Approximate day
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  };
  
  const calculatePongalDate = (year: number): string => {
    // Pongal is usually in January
    // This is a simplified calculation
    const month = 1; // January
    const day = 15 + (year % 10); // Approximate day
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  };
  
  const calculateUgadiDate = (year: number): string => {
    // Ugadi/Gudi Padwa is usually in March or April
    // This is a simplified calculation
    const month = 3; // March
    const day = 25 + (year % 10); // Approximate day
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  };
  
  const calculateBuddhaPurnimaDate = (year: number): string => {
    // Buddha Purnima is usually in April or May
    // This is a simplified calculation
    const month = 4; // April
    const day = 15 + (year % 10); // Approximate day
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  };
  
  const calculateGuruNanakJayantiDate = (year: number): string => {
    // Guru Nanak Jayanti is usually in November
    // This is a simplified calculation
    const month = 11; // November
    const day = 10 + (year % 10); // Approximate day
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    // Generate calendar days regardless of whether there are live classes
    generateCalendarDays();
  }, [currentMonth, liveClasses, holidays, holidayNames]);

  const generateCalendarDays = () => {
    // Ensure liveClasses is defined
    if (liveClasses === undefined) {
      console.error('liveClasses is undefined in generateCalendarDays');
      setCalendarDays([]);
      return;
    }

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Get first and last day of the month
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Get the day of week for the first day (0-6, 0 = Sunday)
    const firstDayWeekday = firstDayOfMonth.getDay();
    
    // Calculate days from previous month to show
    const daysFromPrevMonth = firstDayWeekday;
    
    // Calculate total days to show (including days from prev/next month)
    const totalDays = 35; // 5 rows * 7 days
    
    const days: CalendarDay[] = [];
    
    // Add days from previous month
    const prevMonth = new Date(year, month - 1);
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = prevMonthLastDay - daysFromPrevMonth + 1; i <= prevMonthLastDay; i++) {
      const date = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), i);
      days.push(getDayInfo(date, false));
    }
    
    // Add days from current month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const date = new Date(year, month, i);
      days.push(getDayInfo(date, true));
    }
    
    // Add days from next month
    const remainingDays = totalDays - days.length;
    const nextMonth = new Date(year, month + 1);
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), i);
      days.push(getDayInfo(date, false));
    }
    
    console.log('Calendar days:', days.map(d => ({
      date: d.date.toDateString(),
      isCurrentMonth: d.isCurrentMonth,
      dayNumber: d.date.getDate(),
      isHoliday: d.isHoliday,
      holidayName: d.holidayName
    })));
    
    setCalendarDays(days);
  };

  const getDayInfo = (date: Date, isCurrentMonth: boolean): CalendarDay => {
    // Get live classes for this day
    const dayClasses = liveClasses ? liveClasses.filter((liveClass: LiveClass) => {
      const classDate = new Date(liveClass.startTime);
      return classDate.toDateString() === date.toDateString();
    }) : [];

    // Check if this day is a weekend
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Get the date string for holiday checking
    const dateString = date.toISOString().split('T')[0];
    
    // A day is a holiday if it's either a weekend or in the holidays set
    const isHoliday = isWeekend || holidays.has(dateString);
    
    // Get holiday name - use weekend name if it's a weekend, otherwise use the holiday name from state
    const holidayName = isWeekend ? (dayOfWeek === 0 ? 'Sunday' : 'Saturday') : holidayNames[dateString];

    return {
      date,
      isCurrentMonth,
      hasClass: dayClasses.length > 0,
      classes: dayClasses,
      isHoliday,
      holidayName
    };
  };

  const loadClassData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all live classes
      const response = await liveClassAPI.getAllLiveClasses();
      setLiveClasses(response.data || []);
      
    } catch (error) {
      console.error('Error loading class data:', error);
      setError('Failed to load class data');
      setLiveClasses([]); // Ensure liveClasses is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (classId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await liveClassAPI.deleteLiveClass(classId);
        loadClassData();
      } catch (error) {
        console.error('Error deleting class:', error);
        setError('Failed to delete class');
      }
    }
  };

  const toggleHoliday = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const newHolidays = new Set(holidays);
    const newHolidayNames = { ...holidayNames };
    
    if (holidays.has(dateString)) {
      newHolidays.delete(dateString);
      delete newHolidayNames[dateString];
    } else {
      newHolidays.add(dateString);
      newHolidayNames[dateString] = 'Custom Holiday';
    }
    
    setHolidays(newHolidays);
    setHolidayNames(newHolidayNames);
  };

  const openHolidayModal = (date: Date, e: React.MouseEvent) => {
    e.stopPropagation();
    const dateString = date.toISOString().split('T')[0];
    const name = holidayNames[dateString] || 'Custom Holiday';
    setSelectedHoliday({ date, name });
    setNewHolidayName(name);
    setShowHolidayModal(true);
  };

  const saveHolidayName = () => {
    if (selectedHoliday) {
      const dateString = selectedHoliday.date.toISOString().split('T')[0];
      const newHolidayNames = { ...holidayNames };
      newHolidayNames[dateString] = newHolidayName;
      setHolidayNames(newHolidayNames);
      setShowHolidayModal(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentMonth);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentMonth(newDate);
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-xl">{error}</div>
        <button
          onClick={loadClassData}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-6 mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Class Management</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={saveHolidaysToMongoDB}
              disabled={isSavingHolidays}
              className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              <FiSave className="mr-1" />
              {isSavingHolidays ? 'Saving...' : 'Save Holidays'}
            </button>
            {saveSuccess && (
              <div className="text-green-600 font-medium">
                Holidays saved successfully!
              </div>
            )}
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-lg font-medium">{formatMonth(currentMonth)}</span>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
          {calendarDays.map((day, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.01 }}
              onClick={() => day.isCurrentMonth && toggleHoliday(day.date)}
              className={`
                p-2 rounded-lg text-center cursor-pointer hover:shadow-md transition-shadow min-h-[100px]
                ${day.isCurrentMonth ? 'bg-white border border-gray-200' : 'opacity-40 bg-gray-50'}
                ${day.date.getDate() === new Date().getDate() && 
                  day.date.getMonth() === new Date().getMonth() && 
                  day.date.getFullYear() === new Date().getFullYear() ? 'border-2 border-blue-500' : ''}
                ${day.isHoliday ? 'bg-red-50 border-red-200' : ''}
              `}
            >
              <div className={`text-xl font-bold mb-1 ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                {day.date.getDate()}
              </div>
              <div className={`text-xs mb-2 ${day.isCurrentMonth ? 'text-gray-600' : 'text-gray-400'}`}>
                {formatDate(day.date)}
              </div>
              {day.isHoliday && (
                <div className="text-xs text-red-600 font-medium mb-1 flex items-center justify-center">
                  <span>{day.holidayName || 'Holiday'}</span>
                  {day.isCurrentMonth && (
                    <button 
                      onClick={(e) => openHolidayModal(day.date, e)}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      <FiEdit2 size={12} />
                    </button>
                  )}
                </div>
              )}
              {day.hasClass && (
                <div className="space-y-1">
                  {day.classes.map((liveClass, idx) => (
                    <div 
                      key={idx} 
                      className="text-xs bg-blue-100 text-blue-800 p-1 rounded flex justify-between items-center"
                    >
                      <span className="truncate">{liveClass.title}</span>
                      <button 
                        onClick={(e) => handleDeleteClass(liveClass._id, e)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FiTrash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
        
        <div className="mt-4 flex items-center justify-center space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-white border border-gray-200 rounded mr-2"></div>
            <span>Current Month</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-50 rounded mr-2"></div>
            <span>Previous/Next Month</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 border-2 border-blue-500 rounded mr-2"></div>
            <span>Today</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-100 rounded mr-2"></div>
            <span>Has Classes</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-50 border border-red-200 rounded mr-2"></div>
            <span>Holiday</span>
          </div>
        </div>
      </motion.div>

      {/* Holiday Edit Modal */}
      {showHolidayModal && selectedHoliday && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Edit Holiday</h2>
            <div className="mb-4">
              <p className="text-gray-600 mb-2">
                Date: {selectedHoliday.date.toLocaleDateString()}
              </p>
              <label className="block text-gray-700 mb-2">Holiday Name:</label>
              <input
                type="text"
                value={newHolidayName}
                onChange={(e) => setNewHolidayName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter holiday name"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowHolidayModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={saveHolidayName}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassManagement; 