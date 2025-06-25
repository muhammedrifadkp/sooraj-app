import axios from 'axios';
import { Course } from '../types/course';
import { API_URL } from '../config';

const courseService = {
    async getAllCourses(): Promise<Course[]> {
        try {
            const response = await axios.get(`${API_URL}/courses`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to fetch courses');
            }
            throw error;
        }
    },

    async getCourseById(id: string): Promise<Course> {
        try {
            const response = await axios.get(`${API_URL}/courses/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to fetch course');
            }
            throw error;
        }
    },

    async createCourse(formData: FormData): Promise<Course> {
        try {
            // Log the form data being sent
            console.log('Creating course with form data:');
            for (const [key, value] of formData.entries()) {
                console.log(key, ':', typeof value === 'string' ? value : 'File');
            }

            const response = await axios.post(`${API_URL}/courses`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error creating course:', error);
            
            if (axios.isAxiosError(error)) {
                // Log detailed error information
                console.error('Response status:', error.response?.status);
                console.error('Response data:', error.response?.data);
                
                const errorMessage = error.response?.data?.message 
                    || error.response?.data?.error 
                    || error.message 
                    || 'Failed to create course';
                    
                throw new Error(errorMessage);
            }
            
            throw new Error('Failed to create course. Please try again.');
        }
    },

    async updateCourse(id: string, formData: FormData): Promise<Course> {
        try {
            // Enhanced logging of form data
            console.log('Updating course with ID:', id);
            console.log('Form data entries:');
            const formDataObject: Record<string, any> = {};
            for (const [key, value] of formData.entries()) {
                formDataObject[key] = typeof value === 'string' ? value : 'File';
                console.log(`${key}:`, typeof value === 'string' ? value : `File (${(value as File).size} bytes)`);
            }
            console.log('Form data as object:', formDataObject);

            // Check if modules or materials are properly stringified
            const modules = formData.get('modules');
            if (modules) {
                console.log('Modules data:', typeof modules, modules);
                try {
                    JSON.parse(modules as string);
                    console.log('Modules JSON is valid');
                } catch (e) {
                    console.error('Invalid modules JSON:', e);
                }
            }

            const materials = formData.get('materials');
            if (materials) {
                console.log('Materials data:', typeof materials, materials);
                try {
                    JSON.parse(materials as string);
                    console.log('Materials JSON is valid');
                } catch (e) {
                    console.error('Invalid materials JSON:', e);
                }
            }

            const response = await axios.put(`${API_URL}/courses/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                timeout: 30000,
                maxContentLength: 20 * 1024 * 1024
            });

            console.log('Course update successful:', {
                status: response.status,
                statusText: response.statusText,
                data: response.data
            });

            return response.data;
        } catch (error) {
            console.error('Error updating course:', error);
            
            if (axios.isAxiosError(error)) {
                // Enhanced error logging
                console.error('Full error details:', {
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data,
                    message: error.message,
                    code: error.code,
                    config: {
                        url: error.config?.url,
                        method: error.config?.method,
                        headers: error.config?.headers,
                        timeout: error.config?.timeout,
                        maxContentLength: error.config?.maxContentLength
                    }
                });
                
                if (error.response?.status === 413) {
                    throw new Error('File size too large. Please reduce the size of your files.');
                }
                
                if (error.response?.status === 400) {
                    const message = error.response.data?.message || error.response.data?.error;
                    throw new Error(message || 'Invalid course data. Please check your input.');
                }
                
                if (error.response?.status === 401) {
                    throw new Error('Session expired. Please log in again.');
                }
                
                if (error.response?.status === 403) {
                    throw new Error('You do not have permission to update this course.');
                }
                
                if (error.response?.status === 404) {
                    throw new Error('Course not found.');
                }
                
                if (error.response?.status === 500) {
                    const serverError = error.response.data?.message || error.response.data?.error;
                    throw new Error(serverError || 'Server error. Please try again later.');
                }
                
                const errorMessage = error.response?.data?.message 
                    || error.response?.data?.error 
                    || error.message 
                    || 'Failed to update course';
                    
                throw new Error(errorMessage);
            }
            
            throw new Error('Failed to update course. Please try again.');
        }
    },

    async deleteCourse(id: string): Promise<void> {
        try {
            await axios.delete(`${API_URL}/courses/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to delete course');
            }
            throw error;
        }
    },

    async getCoursesByInstructor(instructorId: string): Promise<Course[]> {
        const response = await axios.get(`${API_URL}/courses/instructor/${instructorId}`);
        return response.data;
    },

    async getEnrolledCourses(): Promise<Course[]> {
        const response = await axios.get(`${API_URL}/courses/enrolled`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    }
};

export default courseService; 