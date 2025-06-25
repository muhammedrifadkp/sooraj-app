import { API_URL } from '../config';
import { authHeader } from '../utils/authHeader.ts';

class CertificateService {
    async generateCourseCompletionCertificate(courseId: string) {
        try {
            const response = await fetch(`${API_URL}/certificates/course-completion`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authHeader() as Record<string, string>)
                } as HeadersInit,
                body: JSON.stringify({ courseId })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to generate certificate');
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    async getMyCertificates() {
        try {
            const response = await fetch(`${API_URL}/certificates/my-certificates`, {
                headers: authHeader() as HeadersInit
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch certificates');
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    async getCourseCertificates(courseId: string) {
        try {
            const response = await fetch(`${API_URL}/certificates/course/${courseId}`, {
                headers: authHeader() as HeadersInit
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch course certificates');
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }
}

export default new CertificateService();
