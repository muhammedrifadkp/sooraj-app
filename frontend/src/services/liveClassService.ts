import axios from 'axios';
import { LiveClass } from '../types/liveClass';
import { API_URL } from '../config';

// Helper function to get the auth header
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.warn('Auth token is missing');
        throw new Error('Not authorized, no token');
    }
    return {
        Authorization: `Bearer ${token}`
    };
};

const liveClassService = {
    getAllLiveClasses: async (userRole?: string): Promise<LiveClass[]> => {
        try {
            const endpoint = userRole === 'admin' 
                ? `${API_URL}/admin/live-classes`
                : `${API_URL}/student/live-classes`;
                
            console.log('Fetching live classes from endpoint:', endpoint);
            const response = await axios.get(endpoint, {
                headers: getAuthHeader()
            });
            
            // Ensure we always return an array
            const liveClasses = Array.isArray(response.data) ? response.data : [];
            console.log(`Received ${liveClasses.length} live classes`);
            
            return liveClasses;
        } catch (error) {
            console.error('Error fetching live classes:', error);
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to fetch live classes');
            }
            throw error;
        }
    },

    getLiveClassById: async (id: string): Promise<LiveClass> => {
        try {
            const response = await axios.get(`${API_URL}/admin/live-classes/${id}`, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching live class:', error);
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to fetch live class');
            }
            throw error;
        }
    },

    createLiveClass: async (data: FormData | any): Promise<LiveClass> => {
        try {
            // Log the data being sent
            console.log('Creating live class with data:', data);
            
            // Check if data is FormData
            const isFormData = data instanceof FormData;
            
            // Validate required fields
            const requiredFields = ['title', 'description', 'course', 'startTime', 'duration', 'maxParticipants', 'meetingLink'];
            const missingFields = requiredFields.filter(field => {
                if (isFormData) {
                    return !data.has(field);
                }
                return !data[field];
            });

            if (missingFields.length > 0) {
                throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
            }

            const response = await axios.post(`${API_URL}/admin/live-classes`, data, {
                headers: {
                    'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
                    ...getAuthHeader()
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error creating live class:', error);
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to create live class');
            }
            throw error;
        }
    },

    updateLiveClass: async (id: string, data: FormData | any): Promise<LiveClass> => {
        try {
            // Log the data being sent
            console.log('Updating live class with data:', data);
            
            // Check if data is FormData
            const isFormData = data instanceof FormData;
            
            // Validate required fields
            const requiredFields = ['title', 'description', 'course', 'startTime', 'duration', 'maxParticipants', 'meetingLink'];
            const missingFields = requiredFields.filter(field => {
                if (isFormData) {
                    return !data.has(field);
                }
                return !data[field];
            });

            if (missingFields.length > 0) {
                throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
            }

            const response = await axios.put(`${API_URL}/admin/live-classes/${id}`, data, {
                headers: {
                    'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
                    ...getAuthHeader()
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error updating live class:', error);
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to update live class');
            }
            throw error;
        }
    },

    deleteLiveClass: async (id: string): Promise<void> => {
        try {
            await axios.delete(`${API_URL}/admin/live-classes/${id}`, {
                headers: getAuthHeader()
            });
        } catch (error) {
            console.error('Error deleting live class:', error);
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to delete live class');
            }
            throw error;
        }
    },

    getLiveClassesByCourse: async (courseId: string): Promise<LiveClass[]> => {
        try {
            const response = await axios.get(`${API_URL}/admin/live-classes/course/${courseId}`, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching live classes by course:', error);
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to fetch course live classes');
            }
            throw error;
        }
    },

    getUpcomingLiveClasses: async (): Promise<LiveClass[]> => {
        try {
            const response = await axios.get(`${API_URL}/admin/live-classes/upcoming`, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching upcoming live classes:', error);
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to fetch upcoming live classes');
            }
            throw error;
        }
    },

    removeMaterial: async (id: string, materialIndex: number): Promise<LiveClass> => {
        try {
            const response = await axios.delete(`${API_URL}/admin/live-classes/${id}/materials/${materialIndex}`, {
                headers: getAuthHeader()
            });
            return response.data.liveClass;
        } catch (error) {
            console.error('Error removing material:', error);
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to remove material');
            }
            throw error;
        }
    },
};

export { liveClassService };