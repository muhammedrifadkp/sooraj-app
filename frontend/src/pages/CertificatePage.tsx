import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Button, Spinner } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiDownload, FiPrinter } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { certificateAPI } from '../services/api';
import SafeDisplay from '../components/SafeDisplay';

interface Certificate {
    _id: string;
    student: {
        _id: string;
        name: string;
        email: string;
    };
    course: {
        _id: string;
        title: string;
        description: string;
        department: string;
    };
    instructor: {
        _id: string;
        name: string;
    };
    certificateNumber: string;
    grade: string;
    completionDate: string;
    issueDate: string;
    status: string;
    signature: string;
    courseCompletion: boolean;
}

const CertificatePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [certificate, setCertificate] = useState<Certificate | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCertificateDetails = async () => {
            if (!id) return;
            
            try {
                setLoading(true);
                const certificates = await certificateAPI.getCourseCertificates(id);
                if (certificates && certificates.length > 0) {
                    setCertificate(certificates[0]); // Get the most recent certificate
                } else {
                    setError('Certificate not found');
                }
            } catch (error) {
                console.error('Error fetching certificate details:', error);
                setError('Failed to load certificate. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchCertificateDetails();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        // This would ideally generate a PDF and download it
        alert('Certificate download functionality will be implemented soon.');
    };

    if (loading) {
        return (
            <Container className="py-5">
                <div className="flex justify-center items-center h-64">
                    <Spinner animation="border" variant="primary" />
                    <span className="ml-2">Loading certificate...</span>
                </div>
            </Container>
        );
    }

    if (error || !certificate) {
        return (
            <Container className="py-5">
                <div className="bg-red-50 text-red-700 p-4 rounded-xl">
                    <h4 className="font-bold mb-2">Error</h4>
                    <p>{error || 'Certificate not found'}</p>
                </div>
                <Button 
                    variant="outline-primary" 
                    className="mt-4 rounded-xl px-4 py-2 border-blue-500 text-blue-600"
                    onClick={() => navigate('/certificates')}
                >
                    <FiArrowLeft className="mr-2" />
                    Back to Certificates
                </Button>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <div className="mb-4 flex justify-between items-center print:hidden">
                <Button 
                    variant="outline-primary" 
                    className="rounded-xl px-4 py-2 border-blue-500 text-blue-600"
                    onClick={() => navigate('/certificates')}
                >
                    <FiArrowLeft className="mr-2" />
                    Back to Certificates
                </Button>
                <div className="flex space-x-2">
                    <Button 
                        variant="outline-primary" 
                        className="rounded-xl px-4 py-2 border-blue-500 text-blue-600"
                        onClick={handlePrint}
                    >
                        <FiPrinter className="mr-2" />
                        Print
                    </Button>
                    <Button 
                        variant="primary" 
                        className="rounded-xl px-4 py-2 bg-blue-600"
                        onClick={handleDownload}
                    >
                        <FiDownload className="mr-2" />
                        Download
                    </Button>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 p-1"
            >
                {/* Certificate Content */}
                <div className="border-8 border-double border-blue-200 p-8 rounded-lg">
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold text-blue-800 mb-2">CERTIFICATE OF COMPLETION</h1>
                        <div className="border-b-2 border-blue-300 w-32 mx-auto mb-2"></div>
                        <p className="text-gray-600">This is to certify that</p>
                    </div>

                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-serif italic text-gray-900">
                            <SafeDisplay value={certificate.student.name} defaultValue="Student Name" />
                        </h2>
                        <div className="border-b border-gray-300 w-64 mx-auto mt-2"></div>
                    </div>

                    <div className="text-center mb-8">
                        <p className="text-gray-600 mb-4">has successfully completed the course</p>
                        <h3 className="text-2xl font-bold text-blue-700 mb-2">
                            <SafeDisplay value={certificate.course.title} defaultValue="Course Title" />
                        </h3>
                        <p className="text-gray-600 italic">
                            Department of <SafeDisplay value={certificate.course.department} defaultValue="Department" />
                        </p>
                        {certificate.grade && (
                            <div className="mt-4">
                                <p className="text-gray-600">with grade</p>
                                <div className="inline-block bg-blue-100 px-6 py-2 rounded-full mt-2">
                                    <span className="text-2xl font-bold text-blue-600">{certificate.grade}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-end mb-8">
                        <div className="text-center">
                            <div className="border-t border-gray-300 w-40 mb-1"></div>
                            <p className="text-sm text-gray-600">Date of Completion</p>
                            <p className="text-gray-800">
                                {new Date(certificate.completionDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                        
                        <div className="text-center">
                            <img 
                                src="/signature.png" 
                                alt="Signature" 
                                className="h-16 mb-1 mx-auto opacity-80"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.fontStyle = 'italic';
                                    target.style.fontFamily = 'cursive';
                                    target.style.fontSize = '24px';
                                    target.style.color = '#1e40af';
                                    target.style.height = '40px';
                                    target.innerText = certificate.signature || 'Signature';
                                }}
                            />
                            <div className="border-t border-gray-300 w-40 mb-1"></div>
                            <p className="text-sm text-gray-600">Instructor</p>
                            <p className="text-gray-800">
                                <SafeDisplay value={certificate.instructor.name} defaultValue="Course Instructor" />
                            </p>
                        </div>
                    </div>

                    <div className="text-center pt-6 border-t border-gray-200">
                        <div className="flex justify-center items-center mb-2">
                            <svg className="h-6 w-6 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-blue-800 text-lg font-semibold">LMS Learning Platform</span>
                        </div>
                        <p className="text-sm text-gray-500">
                            Certificate ID: <span className="font-mono">{certificate.certificateNumber}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Verify this certificate at{' '}
                            <span className="text-blue-600">https://lms.example.com/verify/{certificate.certificateNumber}</span>
                        </p>
                    </div>
                </div>
            </motion.div>
        </Container>
    );
};

export default CertificatePage; 