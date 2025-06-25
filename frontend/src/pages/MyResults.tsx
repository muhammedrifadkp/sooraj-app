import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FiFileText, FiCalendar, FiBarChart2, FiAward, FiArrowRight } from 'react-icons/fi';
import { gradedResultAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './MyResults.css';

interface GradedResult {
    _id: string;
    assignment: {
        _id: string;
        title: string;
        totalMarks: number;
    };
    course: {
        _id: string;
        title: string;
    };
    submittedAt: string;
    gradedAt: string;
    earnedMarks: number;
    totalMarks: number;
    percentage: number;
    scaledScore: number;
    status: string;
    certificateIssued: boolean;
    certificateId?: string;
}

export default function MyResults() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<GradedResult[]>([]);

    useEffect(() => {
        loadResults();
    }, []);

    const loadResults = async () => {
        try {
            setLoading(true);
            
            // First test the connection to the graded-results router
            try {
                console.log('Testing graded-results router connection...');
                const testResult = await gradedResultAPI.testConnection();
                console.log('Test result:', testResult);
            } catch (testError) {
                console.error('Test connection failed:', testError);
                // Continue anyway to try the other endpoints
            }
            
            // Try the debug endpoint
            try {
                console.log('Attempting to load debug results...');
                const debugData = await gradedResultAPI.getDebugResults();
                console.log('Loaded debug results:', debugData);
                
                // If we can get debug results but not real ones, use them
                if (debugData && debugData.length > 0) {
                    setResults(debugData);
                }
            } catch (debugError) {
                console.error('Debug results failed:', debugError);
                // Continue anyway to try the main endpoint
            }
            
            // Now try to get the actual results
            try {
                console.log('Attempting to load graded results...');
                const data = await gradedResultAPI.getMyResults();
                console.log('Loaded graded results:', data);
                if (data && data.length > 0) {
                    setResults(data);
                }
            } catch (mainError) {
                console.error('Main results failed:', mainError);
                // Already tried alternatives, just continue
            }
            
        } catch (error) {
            console.error('Error loading graded results:', error);
            setError('Failed to load your graded results');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusBadge = (status: string, percentage: number) => {
        let color = 'bg-gray-100 text-gray-800';
        if (status === 'evaluated') {
            color = percentage >= 60 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
        } else if (status === 'graded') {
            color = 'bg-blue-100 text-blue-800';
        }
        
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    if (loading) {
        return (
            <Container className="py-5">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-5">
                <div className="bg-red-50 rounded-xl p-5 border border-red-100">
                    <h3 className="text-xl font-semibold text-red-800 mb-2">Error</h3>
                    <p className="text-red-700">{error}</p>
                </div>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">My Results</h2>
                <p className="text-gray-600">View all your assignment and course completion results</p>
            </div>

            {results.length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 text-center">
                    <div className="text-gray-400 text-5xl mb-3">
                        <FiFileText className="mx-auto" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Results Yet</h3>
                    <p className="text-gray-500 mb-4">You haven't completed any assignments yet.</p>
                    <Button 
                        variant="primary" 
                        className="rounded-lg py-2 px-4 bg-blue-600 text-white hover:bg-blue-700 transition"
                        onClick={() => navigate('/assignments')}
                    >
                        View Assignments
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.map(result => (
                        <Card key={result._id} className="bg-white rounded-xl shadow-sm border-0 overflow-hidden">
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2" title={result.assignment?.title || 'Untitled Assignment'}>
                                        {result.assignment?.title || 'Untitled Assignment'}
                                    </h3>
                                    {getStatusBadge(result.status, result.percentage)}
                                </div>
                                <p className="text-gray-600 mb-3 line-clamp-1" title={result.course?.title || 'Untitled Course'}>
                                    {result.course?.title || 'Untitled Course'}
                                </p>
                                
                                <div className="flex items-center text-sm text-gray-500 mb-1">
                                    <FiCalendar className="mr-2" />
                                    <span>Submitted: {formatDate(result.submittedAt)}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-500 mb-3">
                                    <FiCalendar className="mr-2" />
                                    <span>Graded: {formatDate(result.gradedAt)}</span>
                                </div>
                                
                                <div className="mb-3">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Score</span>
                                        <span className="font-medium">{result.percentage}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className={`h-2 rounded-full ${result.percentage >= 60 ? 'bg-green-600' : 'bg-yellow-500'}`} 
                                            style={{ width: `${result.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                    <div className="text-gray-700">
                                        <span className="font-bold">{result.earnedMarks}</span>
                                        <span className="text-gray-400">/</span>
                                        <span>{result.totalMarks}</span>
                                    </div>
                                    
                                    {result.certificateIssued && (
                                        <span className="flex items-center text-green-600 text-sm font-medium">
                                            <FiAward className="mr-1" />
                                            Certificate Issued
                                        </span>
                                    )}
                                </div>
                            </div>
                            
                            <div className="border-t border-gray-100 p-3">
                                <Button 
                                    variant="link" 
                                    className="w-full text-blue-600 hover:text-blue-800 flex items-center justify-center font-medium"
                                    onClick={() => navigate(`/assignments/${result.assignment._id}`)}
                                >
                                    View Details
                                    <FiArrowRight className="ml-2" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </Container>
    );
} 