import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const assignmentService = {
    async getAllAssignments() {
        try {
            const response = await axios.get(`${API_URL}/assignments`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to fetch assignments');
            }
            throw error;
        }
    },

    async getAssignmentById(id) {
        try {
            const response = await axios.get(`${API_URL}/assignments/${id}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to fetch assignment');
            }
            throw error;
        }
    },

    async createAssignment(formData) {
        try {
            console.log('Creating assignment with form data:', Object.fromEntries(formData.entries()));

            const response = await axios.post(`${API_URL}/assignments`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error creating assignment:', error.response?.data);
                throw new Error(error.response?.data?.message || 'Failed to create assignment');
            }
            throw error;
        }
    },

    async updateAssignment(id, formData) {
        try {
            console.log('Updating assignment with form data:', Object.fromEntries(formData.entries()));

            const response = await axios.put(`${API_URL}/assignments/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error updating assignment:', error.response?.data);
                throw new Error(error.response?.data?.message || 'Failed to update assignment');
            }
            throw error;
        }
    },

    async deleteAssignment(id) {
        try {
            const response = await axios.delete(`${API_URL}/assignments/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error deleting assignment:', error.response?.data);
                throw new Error(error.response?.data?.message || 'Failed to delete assignment');
            }
            throw error;
        }
    },

    async getAssignmentsByCourse(courseId) {
        try {
            const response = await axios.get(`${API_URL}/assignments/course/${courseId}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to fetch course assignments');
            }
            throw error;
        }
    },

    async getAssignmentsByInstructor(instructorId) {
        try {
            const response = await axios.get(`${API_URL}/assignments/instructor/${instructorId}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Failed to fetch instructor assignments');
            }
            throw error;
        }
    },

    async submitAssignment(assignmentId, answers) {
        try {
            const response = await axios.post(`${API_URL}/assignments/${assignmentId}/submit`, { answers }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                // Check for both variations of the "already submitted" error message
                if (error.response?.status === 400 &&
                    (error.response?.data?.message?.includes('already submitted') ||
                        error.response?.data?.message?.includes('You have already submitted this assignment') ||
                        error.response?.data?.message?.includes('already submitted this assignment'))) {
                    console.log('Detected already submitted error:', error.response?.data?.message);
                    console.log('Error response data:', error.response?.data);

                    // If the server returned the submission data, use it
                    if (error.response?.data?.submission) {
                        console.log('Server returned submission data:', error.response.data.submission);
                        throw new Error('You have already submitted this assignment');
                    }

                    throw new Error('You have already submitted this assignment');
                }
                const errorMessage = error.response?.data?.message || 'Failed to submit assignment';
                throw new Error(errorMessage);
            }
            throw error;
        }
    },

    async getAssignmentSubmission(assignmentId) {
        try {
            const response = await axios.get(`${API_URL}/assignments/${assignmentId}/submission`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                // If no submission exists, handle that case
                if (error.response?.status === 404) {
                    return { submission: null };
                }

                console.error('Error fetching assignment submission:', error.response?.data);
                throw new Error(error.response?.data?.message || 'Failed to fetch submission');
            }
            throw error;
        }
    }
};

export default assignmentService;