import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiBook, FiFileText, FiVideo, FiPlus } from 'react-icons/fi';

const AddPage: React.FC = () => {
    const navigate = useNavigate();

    const cards = [
        {
            title: 'Add New Course',
            description: 'Create a new course with materials, assignments, and other resources.',
            icon: <FiBook className="w-8 h-8" />,
            color: 'from-blue-500 to-blue-600',
            hoverColor: 'from-blue-600 to-blue-700',
            path: '/admin/add-course'
        },
        {
            title: 'Create Assignment',
            description: 'Create a new assignment with instructions, due date, and submission requirements.',
            icon: <FiFileText className="w-8 h-8" />,
            color: 'from-green-500 to-green-600',
            hoverColor: 'from-green-600 to-green-700',
            path: '/admin/add-assignment'
        },
        {
            title: 'Schedule Live Class',
            description: 'Schedule a new live class session with meeting details and timing.',
            icon: <FiVideo className="w-8 h-8" />,
            color: 'from-purple-500 to-purple-600',
            hoverColor: 'from-purple-600 to-purple-700',
            path: '/admin/add-live-class'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <motion.h1 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-bold text-gray-900 mb-4"
                    >
                        Add New Content
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-gray-600"
                    >
                        Choose what you want to create
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {cards.map((card, index) => (
                        <motion.div
                            key={card.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="relative group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r opacity-75 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                            <div className={`relative bg-gradient-to-r ${card.color} rounded-xl shadow-xl overflow-hidden`}>
                                <div className="absolute inset-0 bg-black opacity-10" />
                                <div className="relative p-8">
                                    <div className="flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-6">
                                        {card.icon}
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-4">{card.title}</h3>
                                    <p className="text-white text-opacity-90 mb-8">{card.description}</p>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => navigate(card.path)}
                                        className={`w-full bg-white text-gray-900 py-3 px-6 rounded-lg font-medium 
                                            hover:bg-opacity-90 transition-all duration-300 flex items-center justify-center gap-2`}
                                    >
                                        <FiPlus className="w-5 h-5" />
                                        Create Now
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-12 text-center"
                >
                    <p className="text-gray-600">
                        Need help? Check out our{' '}
                        <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                            documentation
                        </a>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default AddPage; 