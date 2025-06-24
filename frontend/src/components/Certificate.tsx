import React from 'react';
import { motion } from 'framer-motion';
import { FiAward } from 'react-icons/fi';

interface CertificateProps {
    courseName: string;
    department: string;
    marks?: number;
    studentName: string;
    completionDate: string;
    certificateNumber: string;
    isCourseCompletion?: boolean;
}

const Certificate: React.FC<CertificateProps> = ({
    courseName,
    department,
    marks,
    studentName,
    completionDate,
    certificateNumber,
    isCourseCompletion = false
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto border-8 border-double border-blue-500"
        >
            <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                    <div className="bg-blue-100 p-4 rounded-full">
                        <FiAward className="text-4xl text-blue-600" />
                    </div>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Certificate of Completion</h1>
                <p className="text-gray-600">This is to certify that</p>
            </div>

            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-blue-600 mb-4">{studentName}</h2>
                <p className="text-xl text-gray-700 mb-2">
                    {isCourseCompletion 
                        ? "has successfully completed the course in"
                        : "has successfully completed the assignment in"}
                </p>
                <h3 className="text-2xl font-semibold text-gray-900">{courseName}</h3>
                <p className="text-lg text-gray-600">Department of {department}</p>
            </div>

            {marks && (
                <div className="text-center mb-8">
                    <p className="text-xl text-gray-700">with a score of</p>
                    <div className="inline-block bg-blue-100 px-6 py-2 rounded-full mt-2">
                        <span className="text-2xl font-bold text-blue-600">{marks}%</span>
                    </div>
                </div>
            )}

            <div className="text-center text-gray-600">
                <p>Certificate Number: {certificateNumber}</p>
                <p>Awarded on {new Date(completionDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })}</p>
            </div>
        </motion.div>
    );
};

export default Certificate; 