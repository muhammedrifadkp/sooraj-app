import axios, { InternalAxiosRequestConfig, AxiosHeaders } from 'axios';

// Use environment variable with fallback
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Add request interceptor to include auth token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const url = config.url || '';
    const baseURL = config.baseURL || '';

    console.log('Request interceptor - Request URL:', url);
    console.log('Request interceptor - Request method:', config.method);
    console.log('Request interceptor - Request baseURL:', baseURL);
    console.log('Request interceptor - Full URL:', baseURL + url);

    const token = localStorage.getItem('token');
    if (token) {
        if (!config.headers) {
            config.headers = new AxiosHeaders({
                'Content-Type': 'application/json'
            });
        }
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Setting auth token:', token.substring(0, 10) + '...');
        console.log('Request headers:', JSON.stringify(config.headers));
    }
    return config;
}, (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
});

// Add response interceptor to handle token expiration and duplicate attendance
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Handle duplicate attendance errors
        if (error.response?.status === 500 &&
            error.config?.url?.includes('/attendance/student/mark-login') &&
            error.response?.data?.message?.includes('E11000 duplicate key error')) {

            // Return a success response for duplicate attendance
            return Promise.resolve({
                data: {
                    success: true,
                    attendance: true,
                    message: 'Attendance already marked for today',
                    duplicate: true
                }
            });
        }

        // Handle token refresh for 401 errors
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                const response = await api.post('/auth/refresh-token', { refreshToken });
                const { token } = response.data;

                if (!token) {
                    throw new Error('No token received from refresh');
                }

                localStorage.setItem('token', token);
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return api(originalRequest);
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: async (email: string, password: string) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { user, token } = response.data;

            console.log('Login API response data:', response.data);
            console.log('Login API response user:', user);
            console.log('User role from API:', user.role);
            console.log('User department from API:', user.department);

            // Store token and user data in localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                avatar: user.avatar
            }));

            // Set auth header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Record login history
            await api.post('/auth/login-history', {
                deviceInfo: navigator.userAgent,
                ipAddress: window.location.hostname
            });

            return {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    department: user.department,
                    avatar: user.avatar
                },
                token
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to login');
            }
            throw error;
        }
    },

    register: async (name: string, email: string, password: string, role: string, department?: string) => {
        try {
            const response = await api.post('/auth/register', {
                name,
                email,
                password,
                role,
                department: role === 'student' ? department : undefined
            });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to register');
            }
            throw error;
        }
    },

    verifyToken: async () => {
        try {
            const response = await api.get('/auth/verify');
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to verify token');
            }
            throw error;
        }
    },

    changePassword: async (currentPassword: string, newPassword: string) => {
        try {
            const response = await api.put('/auth/change-password', {
                currentPassword,
                newPassword,
            });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to change password');
            }
            throw error;
        }
    },

    getLoginHistory: async () => {
        try {
            const response = await api.get('/auth/login-history');
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to fetch login history');
            }
            throw error;
        }
    },

    requestPasswordReset: async (email: string) => {
        try {
            console.log('Requesting password reset for email:', email);
            const response = await api.post('/auth/forgot-password', { email });
            console.log('Password reset response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Password reset request error:', error);
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to request password reset');
            }
            throw error;
        }
    },

    resetPassword: async (token: string, newPassword: string) => {
        try {
            console.log('Resetting password with token:', token.substring(0, 10) + '...');
            const response = await api.post('/auth/reset-password', { token, newPassword });
            console.log('Password reset response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Password reset error:', error);
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to reset password');
            }
            throw error;
        }
    }
};

// Assignment API
export const assignmentAPI = {
    createAssignment: async (formData: FormData) => {
        try {
            const response = await api.post('/assignments', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to create assignment');
            }
            throw error;
        }
    },

    getAssignments: async () => {
        try {
            const response = await api.get('/assignments');
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to fetch assignments');
            }
            throw error;
        }
    },

    getAssignment: async (id: string) => {
        try {
            const response = await api.get(`/assignments/${id}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to fetch assignment');
            }
            throw error;
        }
    },

    updateAssignment: async (id: string, formData: FormData) => {
        try {
            const response = await api.put(`/assignments/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to update assignment');
            }
            throw error;
        }
    },

    deleteAssignment: async (id: string) => {
        try {
            const response = await api.delete(`/assignments/${id}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to delete assignment');
            }
            throw error;
        }
    },

    getAssignmentsByCourse: async (courseId: string) => {
        try {
            const response = await api.get(`/assignments/course/${courseId}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to fetch course assignments');
            }
            throw error;
        }
    }
};

// Live Class API
export const liveClassAPI = {
    getMyLiveClasses: async () => {
        try {
            const response = await api.get('/live-classes/my-classes');
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to fetch my live classes');
            }
            throw error;
        }
    },

    getAllLiveClasses: async () => {
        try {
            const response = await api.get('/admin/live-classes');
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to fetch live classes');
            }
            throw error;
        }
    },

    getLiveClass: async (id: string) => {
        try {
            const response = await api.get(`/admin/live-classes/${id}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to fetch live class');
            }
            throw error;
        }
    },

    createLiveClass: async (data: any) => {
        try {
            console.log('Creating live class with data:', data);
            const response = await api.post('/admin/live-classes', data);
            return response.data;
        } catch (error) {
            console.error('API Error:', error);
            if (axios.isAxiosError(error)) {
                console.error('Response data:', error.response?.data);
                console.error('Response status:', error.response?.status);
                throw new Error(error.response?.data?.message || 'Failed to create live class');
            }
            throw error;
        }
    },

    updateLiveClass: async (id: string, formData: FormData) => {
        try {
            const response = await api.put(`/admin/live-classes/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to update live class');
            }
            throw error;
        }
    },

    deleteLiveClass: async (id: string) => {
        try {
            const response = await api.delete(`/admin/live-classes/${id}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to delete live class');
            }
            throw error;
        }
    },

    uploadMaterials: async (id: string, files: File[]) => {
        try {
            const formData = new FormData();
            files.forEach(file => {
                formData.append('materials', file);
            });

            const response = await api.post(`/admin/live-classes/${id}/materials`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to upload materials');
            }
            throw error;
        }
    }
};

// Course API
export const courseAPI = {
    // Check if course is completed (all assignments graded above 60%)
    async checkCourseCompletion(id: string) {
        try {
            const response = await api.get(`/courses/${id}/check-completion`);
            return response.data;
        } catch (error) {
            console.error('Error checking course completion:', error);
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to check course completion');
            }
            throw error;
        }
    },

    getAllCourses: () => api.get('/courses'),
    getCourse: (id: string) => api.get(`/courses/${id}`),
    createCourse: (data: FormData) => api.post('/courses', data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
    updateCourse: (id: string, data: FormData) => api.put(`/courses/${id}`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
    deleteCourse: (id: string) => api.delete(`/courses/${id}`),
    enrollCourse: (id: string) => api.post(`/courses/${id}/enroll`),
    getEnrolledCourses: async () => {
        try {
            console.log('Fetching enrolled courses...');
            const token = localStorage.getItem('token');
            console.log('Using token:', token);

            const response = await api.get('/courses/enrolled');
            console.log('Raw API response:', response);
            console.log('Response data:', response.data);

            // Ensure we have valid course data
            if (!response.data) {
                console.error('No data in response');
                return [];
            }

            // Return the data array
            return response.data;
        } catch (error) {
            console.error('Error fetching enrolled courses:', error);
            if (axios.isAxiosError(error)) {
                console.error('Response data:', error.response?.data);
                console.error('Response status:', error.response?.status);
                throw new Error(error.response?.data?.message || 'Failed to fetch enrolled courses');
            }
            throw error;
        }
    },
    getCourseMaterials: (id: string) => api.get(`/courses/${id}/materials`),
    getCourseAssignments: (id: string) => api.get(`/courses/${id}/assignments`),
    getCourseStudents: (id: string) => api.get(`/courses/${id}/students`),
    getCourseProgress(id: string) {
        return api.get(`/courses/${id}/progress`);
    },

    updateCourseProgress(id: string, data: any) {
        return api.put(`/courses/${id}/progress`, data);
    }
};

// User API
export const userAPI = {
    getCurrentUser: async () => {
        try {
            const response = await api.get('/users/me');
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to fetch current user');
            }
            throw error;
        }
    },

    getProfile: async () => {
        try {
            const response = await api.get('/users/me');
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to fetch profile');
            }
            throw error;
        }
    },

    updateProfile: async (profileData: {
        name?: string;
        email?: string;
        bio?: string;
        location?: string;
    }) => {
        try {
            const response = await api.put('/users/profile', profileData);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to update profile');
            }
            throw error;
        }
    },

    uploadPhoto: async (file: File) => {
        try {
            // Convert file to base64
            const reader = new FileReader();
            const base64Promise = new Promise<string>((resolve, reject) => {
                reader.onload = () => {
                    const base64String = reader.result as string;
                    resolve(base64String);
                };
                reader.onerror = reject;
            });
            reader.readAsDataURL(file);
            const base64Data = await base64Promise;

            const response = await api.post('/users/upload-photo', {
                photo: base64Data,
                contentType: file.type
            });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to upload photo');
            }
            throw error;
        }
    }
};

// Certificate API
export const certificateAPI = {
    // Download certificate as PDF
    async downloadCertificate(courseId: string) {
        try {
            const response = await api.get(`/certificates/download/${courseId}`, {
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error('Error downloading certificate:', error);
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to download certificate');
            }
            throw error;
        }
    },

    getMyCertificates: async () => {
        try {
            const response = await api.get('/certificates/my-certificates');
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to fetch certificates');
            }
            throw error;
        }
    },

    getAssignmentCertificates: async (assignmentId: string) => {
        try {
            const response = await api.get(`/certificates/assignment/${assignmentId}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to fetch assignment certificates');
            }
            throw error;
        }
    },

    getCourseCertificates: async (courseId: string) => {
        try {
            const response = await api.get(`/certificates/course/${courseId}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to fetch course certificates');
            }
            throw error;
        }
    },

    issueCertificate: async (data: {
        studentId: string;
        courseId: string;
        assignmentId: string;
        grade: string;
        completionDate: string;
    }) => {
        try {
            const response = await api.post('/certificates', data);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to issue certificate');
            }
            throw error;
        }
    },

    issueCourseCompletionCertificate: async (id: string) => {
        try {
            const response = await api.post('/certificates/course-completion', { courseId: id });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.message || 'Failed to issue certificate';
                console.error('Certificate creation error:', {
                    status: error.response?.status,
                    data: error.response?.data,
                    message: errorMessage
                });
                throw new Error(errorMessage);
            }
            throw error;
        }
    },

    updateCertificateStatus: async (certificateId: string, status: string) => {
        try {
            const response = await api.put(`/certificates/${certificateId}/status`, { status });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to update certificate status');
            }
            throw error;
        }
    },

    deleteCertificate: async (certificateId: string) => {
        try {
            const response = await api.delete(`/certificates/${certificateId}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to delete certificate');
            }
            throw error;
        }
    }
};

// Attendance API
export const attendanceAPI = {
    // Get my attendance records
    getMyAttendance: async () => {
        try {
            const response = await api.get('/attendance/my-attendance');
            return response.data;
        } catch (error) {
            console.error('Error fetching attendance records:', error);
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to fetch attendance records');
            }
            throw error;
        }
    },

    // Mark attendance based on login
    markLoginAttendance: async () => {
        try {
            const response = await api.post('/attendance/student/mark-login');
            return response.data;
        } catch (error) {
            console.error('Error marking login attendance:', error);
            if (axios.isAxiosError(error)) {
                if (error.response?.data?.message?.includes('duplicate')) {
                    return {
                        success: true,
                        attendance: true,
                        message: 'Attendance already marked for today'
                    };
                }
                throw new Error(error.response?.data?.message || 'Failed to mark login attendance');
            }
            throw error;
        }
    }
};

// OTP API
export const otpAPI = {
    // Send OTP for registration
    sendRegistrationOTP: async (email: string) => {
        try {
            console.log('Sending OTP to email:', email);
            const response = await api.post('/otp/send-registration-otp', { email });
            console.log('OTP response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error sending OTP:', error);
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to send OTP');
            }
            throw error;
        }
    },

    // Verify OTP
    verifyOTP: async (email: string, otp: string) => {
        try {
            console.log('Verifying OTP for email:', email);
            const response = await api.post('/otp/verify-otp', { email, otp });
            console.log('OTP verification response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error verifying OTP:', error);
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to verify OTP');
            }
            throw error;
        }
    }
};

// Holiday API
export const holidayAPI = {
    // Get all holidays
    getHolidays: async () => {
        try {
            const response = await api.get('/holidays');
            return response.data;
        } catch (error) {
            console.error('Error getting holidays:', error);
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to fetch holidays');
            }
            throw error;
        }
    },

    // Get holidays for a specific month and year
    getMonthHolidays: async (month: number, year: number) => {
        try {
            const response = await api.get('/holidays', {
                params: { month, year }
            });
            return response.data;
        } catch (error) {
            console.error('Error getting month holidays:', error);
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to fetch monthly holidays');
            }
            throw error;
        }
    },

    // Add a new holiday (admin only)
    addHoliday: async (holiday: { date: string; name: string; type: 'weekend' | 'national' | 'custom' }) => {
        try {
            const response = await api.post('/holidays', holiday);
            return response.data;
        } catch (error) {
            console.error('Error adding holiday:', error);
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to add holiday');
            }
            throw error;
        }
    },

    // Update a holiday (admin only)
    updateHoliday: async (id: string, holiday: { date: string; name: string; type: 'weekend' | 'national' | 'custom' }) => {
        try {
            const response = await api.put(`/holidays/${id}`, holiday);
            return response.data;
        } catch (error) {
            console.error('Error updating holiday:', error);
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to update holiday');
            }
            throw error;
        }
    },

    // Delete a holiday (admin only)
    deleteHoliday: async (id: string) => {
        try {
            const response = await api.delete(`/holidays/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting holiday:', error);
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to delete holiday');
            }
            throw error;
        }
    },

    // Save multiple holidays at once (admin only)
    saveHolidays: async (holidays: { date: string; name: string; type: 'weekend' | 'national' | 'custom' }[]) => {
        try {
            const response = await api.post('/holidays/bulk', { holidays });
            return response.data;
        } catch (error) {
            console.error('Error saving holidays:', error);
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to save holidays in bulk');
            }
            throw error;
        }
    },
};

// GradedResult API
export const gradedResultAPI = {
    // Test endpoint to verify router is working
    async testConnection() {
        try {
            const fullUrl = `${API_URL}/graded-results/test`;
            console.log('Testing connection to:', fullUrl);

            try {
                const response = await api.get('/graded-results/test');
                console.log('Test response:', response);
                return response.data;
            } catch (firstError) {
                console.error('First test attempt failed, trying direct axios call:', firstError);

                // Try a direct axios call as fallback
                const directResponse = await axios.get(fullUrl);
                console.log('Direct test response:', directResponse);
                return directResponse.data;
            }
        } catch (error) {
            console.error('Test connection failed:', error);
            if (axios.isAxiosError(error)) {
                console.error('Test response status:', error.response?.status);
                console.error('Test response data:', error.response?.data);
            }
            throw error;
        }
    },

    // Debug method to test results without authentication
    async getDebugResults() {
        try {
            const fullUrl = `${API_URL}/graded-results/debug/my-results`;
            console.log('Getting debug results from:', fullUrl);

            try {
                const response = await api.get('/graded-results/debug/my-results');
                console.log('Debug response:', response);
                return response.data;
            } catch (firstError) {
                console.error('Debug attempt failed, trying direct axios call:', firstError);

                // Try a direct axios call as fallback
                const directResponse = await axios.get(fullUrl);
                console.log('Direct debug response:', directResponse);
                return directResponse.data;
            }
        } catch (error) {
            console.error('Debug request failed:', error);
            if (axios.isAxiosError(error)) {
                console.error('Debug response status:', error.response?.status);
                console.error('Debug response data:', error.response?.data);
            }
            throw error;
        }
    },

    // Get all graded results (admin only)
    async getAll() {
        try {
            const response = await api.get('/graded-results');
            return response.data;
        } catch (error) {
            console.error('Error fetching all graded results:', error);
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to fetch graded results');
            }
            throw error;
        }
    },

    // Get a specific graded result by ID
    async getById(id: string) {
        try {
            const response = await api.get(`/graded-results/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching graded result with ID ${id}:`, error);
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to fetch graded result');
            }
            throw error;
        }
    },

    // Get graded result for a specific assignment
    async getByAssignmentId(assignmentId: string) {
        try {
            const response = await api.get(`/graded-results/assignment/${assignmentId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching graded result for assignment ${assignmentId}:`, error);
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                // Special case for 404 - not found, which is expected when a student hasn't submitted yet
                console.log('No graded result found - student likely has not submitted yet');
                return null;
            }
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to fetch graded result for assignment');
            }
            throw error;
        }
    },

    // Get all graded results for current student
    async getMyResults() {
        try {
            const fullUrl = `${API_URL}/graded-results/student/my-results`;
            console.log('Fetching graded results from:', fullUrl);

            const token = localStorage.getItem('token');
            console.log('Using token:', token ? 'Token present' : 'No token found');

            try {
                const response = await api.get('/graded-results/student/my-results');
                console.log('Graded results response:', response);
                return response.data;
            } catch (firstError) {
                console.error('First attempt failed, trying direct axios call:', firstError);

                // Try a direct axios call as fallback
                const directResponse = await axios.get(fullUrl, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token ? `Bearer ${token}` : ''
                    }
                });
                console.log('Direct axios response:', directResponse);
                return directResponse.data;
            }
        } catch (error) {
            console.error('Error fetching my graded results:', error);
            if (axios.isAxiosError(error)) {
                console.error('Response status:', error.response?.status);
                console.error('Response data:', error.response?.data);
                throw new Error(error.response?.data?.message || 'Failed to fetch your graded results');
            }
            throw error;
        }
    },

    // Get all graded results for a specific course (instructor only)
    async getByCourse(courseId: string) {
        try {
            const response = await api.get(`/graded-results/course/${courseId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching graded results for course ${courseId}:`, error);
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to fetch graded results for course');
            }
            throw error;
        }
    },

    // Update a graded result (instructor only)
    async update(id: string, data: any) {
        try {
            const response = await api.put(`/graded-results/${id}`, data);
            return response.data;
        } catch (error) {
            console.error(`Error updating graded result ${id}:`, error);
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to update graded result');
            }
            throw error;
        }
    }
};

export default api;