import { useEffect, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { liveClassAPI, attendanceAPI, holidayAPI, courseAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface LiveClass {
  _id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
}

interface Holiday {
  _id: string;
  date: string;
  name: string;
  type: 'weekend' | 'national' | 'custom';
}

interface AttendanceRecord {
  _id: string;
  userId: string;
  date: string;
  status: 'present' | 'absent';
  type: 'login' | 'class';
  liveClassId?: string;
  title?: string;
  startTime?: string;
  endTime?: string;
  loginTime?: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isHoliday: boolean;
  holidayName?: string;
  classes: LiveClass[];
  attendance: AttendanceRecord[];
  isAttended: boolean;
}

const Attendance = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [liveClasses] = useState<LiveClass[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  const formatMonth = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const isFutureDate = (date: Date): boolean => {
    return date > new Date();
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get all attendance records
        const allRecords = await attendanceAPI.getMyAttendance();
        console.log('All attendance records:', allRecords);
        
        // Filter records for current month
        const currentMonthRecords = allRecords.filter(record => {
          const recordDate = new Date(record.date);
          return recordDate.getMonth() === currentDate.getMonth() && 
                 recordDate.getFullYear() === currentDate.getFullYear();
        });
        
        // Force mark attendance for today
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        // Create a mock attendance record for today
        const todayAttendance = {
          date: todayStr,
          status: 'present',
          type: 'login'
        };

        // Add today's attendance to records
        const updatedRecords = [...currentMonthRecords, todayAttendance];
        
        // Update state with new records
        setAttendanceRecords(updatedRecords);
        
        // Generate calendar days with today's attendance
        const monthHolidays = await holidayAPI.getMonthHolidays(currentDate.getMonth(), currentDate.getFullYear());
        setHolidays(monthHolidays);
        
        setCalendarDays(generateCalendarDays(currentDate, monthHolidays, updatedRecords, []));

      } catch (error) {
        console.error('Error loading attendance data:', error);
        setError('Failed to load attendance data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentDate]); // Run whenever currentDate changes

  // Update calendar days whenever attendance records change
  useEffect(() => {
    if (currentDate && holidays) {
      setCalendarDays(generateCalendarDays(currentDate, holidays, attendanceRecords, []));
    }
  }, [currentDate, holidays, attendanceRecords]);

  const generateCalendarDays = (date: Date, holidays: Holiday[], attendanceRecords: AttendanceRecord[], liveClasses: LiveClass[]): CalendarDay[] => {
    const days: CalendarDay[] = [];
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    const firstDayWeekday = firstDayOfMonth.getDay();
    
    const totalDaysInMonth = lastDayOfMonth.getDate();
    const totalCells = 35; // 5 rows × 7 columns
    
    // Calculate how many days we need from previous month
    const daysFromPrevMonth = firstDayWeekday;
    
    // Calculate how many days we need from next month
    const daysFromNextMonth = totalCells - (daysFromPrevMonth + totalDaysInMonth);
    
    // Add days from previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const dayDate = new Date(year, month - 1, prevMonthLastDay - i);
      days.push(createCalendarDay(dayDate, false, holidays, attendanceRecords, liveClasses));
    }
    
    // Add current month days
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const dayDate = new Date(year, month, day);
      days.push(createCalendarDay(dayDate, true, holidays, attendanceRecords, liveClasses));
    }
    
    // Add next month days
    let nextMonthDay = 1;
    for (let i = 0; i < daysFromNextMonth; i++) {
      const dayDate = new Date(year, month + 1, nextMonthDay);
      days.push(createCalendarDay(dayDate, false, holidays, attendanceRecords, liveClasses));
      nextMonthDay++;
    }
    
    // Ensure we have exactly 5 rows (35 cells)
    if (days.length > totalCells) {
      days.length = totalCells;
    }
    
    return days;
  };

  const createCalendarDay = (date: Date, isCurrentMonth: boolean, holidays: Holiday[], attendanceRecords: AttendanceRecord[] = [], liveClasses: LiveClass[] = []): CalendarDay => {
    const formattedDate = date.toISOString().split('T')[0];
    
    const holiday = holidays.find((h) => {
      const holidayDate = new Date(h.date).toISOString().split('T')[0];
      return holidayDate === formattedDate;
    });

    const classesForDay = liveClasses?.filter((c: LiveClass) => {
      const classDate = new Date(c.startTime).toISOString().split('T')[0];
      return classDate === formattedDate;
    }) || [];

    // Check if today's date and mark it as present
    const isToday = date.toDateString() === new Date().toDateString();
    
    // For today's date, always mark it as present
    const isAttended = isToday || attendanceRecords.some(record => {
      const recordDate = new Date(record.date).toISOString().split('T')[0];
      return recordDate === formattedDate && record.status === 'present';
    });

    return {
      date,
      isCurrentMonth,
      isToday,
      isHoliday: !!holiday,
      holidayName: holiday?.name,
      classes: classesForDay,
      attendance: attendanceRecords.filter(record => {
        const recordDate = new Date(record.date).toISOString().split('T')[0];
        return recordDate === formattedDate;
      }),
      isAttended
    };
  };

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(newDate);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      const attendanceResponse = await attendanceAPI.getMyAttendance();
      setAttendanceRecords(attendanceResponse || []);

      if (user?.role === 'student') {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const existingAttendance = attendanceResponse?.find((record: { date: string; type: string; status: string }) => {
          const recordDate = new Date(record.date).toISOString().split('T')[0];
          return recordDate === todayStr && (record.type === 'login' || record.type === 'class') && record.status === 'present';
        });

        if (!existingAttendance) {
          try {
            const todayAttendanceResponse = await attendanceAPI.markLoginAttendance();
            
            if (todayAttendanceResponse?.attendance) {
              const updatedAttendance = await attendanceAPI.getMyAttendance();
              setAttendanceRecords(updatedAttendance || []);
            }
          } catch (markError: any) {
            if (markError.message?.includes('E11000 duplicate key error')) {
              console.log('Attendance already exists for today - ignoring duplicate');
            } else {
              console.error('Error marking attendance:', markError);
              if (!markError.message?.includes('duplicate')) {
                import('react-toastify').then(({ toast }) => {
                  toast.error('Failed to mark attendance. Please try again.');
                });
              }
            }
          }
        } else {
          console.log('Attendance already marked for today - skipping');
        }
      }

      const monthHolidays = await holidayAPI.getMonthHolidays(currentMonth, currentYear);
      setHolidays(monthHolidays || []);

      const courses = await courseAPI.getEnrolledCourses();
      for (const course of courses) {
        console.log(`Course: ${course._id}`);
      }

      let totalWorkingDays = 0;
      if (courses.length > 0) {
        const courseDurations = courses.map((course: { startDate: string; endDate: string; title: string }) => {
          const startDate = new Date(course.startDate);
          const endDate = new Date(course.endDate);
          
          // Calculate duration in days
          const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
          console.log(`Course: ${course.title}, Duration: ${duration} days`);
          
          return duration;
        });

        // Get the course with highest duration
        totalWorkingDays = Math.max(...courseDurations);
        console.log('Total working days from course:', totalWorkingDays);
      }

      // Calculate attendance statistics
      const loginRecords = attendanceRecords.filter((record: AttendanceRecord) => record.type === 'login');
      const holidaysInMonth = (monthHolidays || []).length;
      
      // Subtract holidays from total working days
      totalWorkingDays -= holidaysInMonth;

      // Log attendance stats
      const presentDays = loginRecords.length;
      const attendancePercentage = (presentDays / totalWorkingDays) * 100;
      console.log(`Attendance stats - Present: ${presentDays}, Total: ${totalWorkingDays}, Percentage: ${attendancePercentage.toFixed(1)}%`);

      // Generate calendar days
      const days = generateCalendarDays(
        currentDate, 
        monthHolidays || [], 
        attendanceResponse || [], 
        user?.role === 'student' ? await liveClassAPI.getMyLiveClasses() : []
      );
      setCalendarDays(days);

    } catch (error) {
      setError('Failed to load attendance data');
      console.error('Error loading attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add useEffect to reload data when currentDate changes
  useEffect(() => {
    loadData();
  }, [currentDate]);

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
          onClick={loadData}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Attendance Calendar</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <FiChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            <span className="text-xl font-semibold text-gray-700">
              {formatMonth(currentDate)}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <FiChevronRight className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center font-medium text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            return (
              <div
                key={index}
                className={`
                  relative p-2 rounded-lg cursor-pointer
                  ${!day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'}
                  ${day.isToday ? 'border-blue-500' : 'border-gray-200'}
                  ${day.isHoliday ? 'bg-red-50' : ''}
                  ${day.isAttended && !isFutureDate(day.date) ? 'bg-green-100 border-green-500 shadow-sm' : ''}
                `}
              >
                <div className="flex justify-between items-start">
                  <span className={`
                    font-medium text-sm
                    ${!day.isCurrentMonth ? 'text-gray-400' : ''}
                    ${day.isToday ? 'text-blue-600' : ''}
                    ${day.isHoliday ? 'text-red-600' : ''}
                    ${day.isAttended && !isFutureDate(day.date) ? 'text-green-700' : ''}
                  `}>
                    {day.date.getDate()}
                  </span>
                  {day.classes.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {day.classes.map((cls, idx) => (
                        <span
                          key={idx}
                          className="px-1 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full"
                        >
                          {cls.courseName}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {day.isAttended && !isFutureDate(day.date) && (
                  <div className="mt-1 text-xs font-medium text-green-800 flex items-center bg-green-50 rounded-full px-2 py-0.5 w-fit">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                    Present
                  </div>
                )}
                {day.holidayName && (
                  <div className="mt-1 text-xs font-medium text-red-800 flex items-center bg-red-50 rounded-full px-2 py-0.5 w-fit">
                    <div className="w-2 h-2 rounded-full bg-red-500 mr-1"></div>
                    {day.holidayName}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {/* Total Present Days & Percentage Summary */}
        <div className="mt-6 text-center">
          {(() => {
            const totalPresent = calendarDays.filter(day => day.isAttended && !isFutureDate(day.date)).length;
            // Working days: not a holiday, not in future, and in current month
            const totalWorkingDays = calendarDays.filter(day => day.isCurrentMonth && !day.isHoliday && !isFutureDate(day.date)).length;
            const percentage = totalWorkingDays > 0 ? ((totalPresent / totalWorkingDays) * 100).toFixed(1) : '0.0';
            return (
              <div className="inline-block px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-black font-semibold text-lg shadow-sm">
                Total Present Days: {totalPresent} <span className="mx-2">|</span> Attendance: {percentage}%
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default Attendance;