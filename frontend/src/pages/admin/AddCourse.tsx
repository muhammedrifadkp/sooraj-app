import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUpload, FiX, FiPlus, FiMinus, FiTrash2, FiArrowLeft, FiFile, FiYoutube, FiImage } from 'react-icons/fi';
import { Button, Container, Form } from 'react-bootstrap';
import courseService from '../../services/courseService';
import { useAuth } from '../../context/AuthContext';

interface Module {
    title: string;
    description: string;
    content: string;
}

interface MaterialFile {
    file: File | null;
    title: string;
    description: string;
}

const AddCourse: React.FC = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [modules, setModules] = useState<Module[]>([{ title: '', description: '', content: '' }]);
    const [materialFiles, setMaterialFiles] = useState<MaterialFile[]>([]);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const user = useAuth();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        duration: 30, // Default to 30 days
        department: 'CSE',
        instructor: user?._id || '',
        youtubeLink: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addModule = () => {
        setModules([...modules, { title: '', description: '', content: '' }]);
    };

    const removeModule = (index: number) => {
        setModules(modules.filter((_, i) => i !== index));
    };

    const handleModuleChange = (index: number, field: keyof Module, value: string) => {
        const newModules = [...modules];
        newModules[index] = { ...newModules[index], [field]: value };
        setModules(newModules);
    };

    const handleAddMaterial = () => {
        setMaterialFiles([...materialFiles, { file: null, title: '', description: '' }]);
    };

    const handleRemoveMaterial = (index: number) => {
        setMaterialFiles(materialFiles.filter((_, i) => i !== index));
    };

    const handleMaterialChange = (index: number, field: keyof MaterialFile, value: string | File) => {
        const newMaterials = [...materialFiles];
        newMaterials[index] = { ...newMaterials[index], [field]: value };
        setMaterialFiles(newMaterials);
    };

    const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                setError('File size should be less than 10MB');
                return;
            }
            handleMaterialChange(index, 'file', file);
        }
    };

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                setError('Thumbnail size should be less than 10MB');
                return;
            }
            if (!file.type.match('image.*')) {
                setError('Please upload an image file');
                return;
            }
            setThumbnailFile(file);
            
            // Create a preview URL for the thumbnail
            const reader = new FileReader();
            reader.onloadend = () => {
                setThumbnailPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            // Validate duration is a positive number
            if (formData.duration <= 0) {
                setError('Duration must be a positive number of days');
                return;
            }

            // Create FormData object for file upload
            const formDataToSend = new FormData();
            
            // Add basic course data
            formDataToSend.append('title', formData.title.trim());
            formDataToSend.append('description', formData.description.trim());
            formDataToSend.append('duration', formData.duration.toString());
            formDataToSend.append('department', formData.department);
            formDataToSend.append('instructor', formData.instructor);
            
            // Only append youtubeLink if it's not empty
            if (formData.youtubeLink.trim()) {
                formDataToSend.append('youtubeLink', formData.youtubeLink.trim());
            }
            
            // Add thumbnail if selected
            if (thumbnailFile) {
                formDataToSend.append('thumbnail', thumbnailFile);
            }
            
            // Add modules as course modules
            const modulesData = modules.map(module => ({
                title: module.title.trim(),
                description: module.description.trim(),
                content: module.content.trim(),
                type: 'module'
            }));
            
            formDataToSend.append('modules', JSON.stringify(modulesData));
            
            // Add material files
            materialFiles.forEach((material, index) => {
                if (material.file) {
                    formDataToSend.append('materialFiles', material.file);
                    formDataToSend.append('materialTitles', material.title.trim());
                    formDataToSend.append('materialDescriptions', material.description.trim());
                }
            });

            // Log the form data before sending
            console.log('Submitting course data:');
            for (const [key, value] of formDataToSend.entries()) {
                console.log(`${key}: ${value}`);
            }

            const response = await courseService.createCourse(formDataToSend);
            console.log('Course created successfully:', response);
            navigate('/admin/courses');
        } catch (error: any) {
            console.error('Error creating course:', error);
            const errorMessage = error.message || 'Failed to create course. Please try again.';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden"
                >
                    <div className="p-6 sm:p-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Course</h1>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
                                <div className="p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">Course Details</h2>
                                    <div className="grid grid-cols-1 gap-6">
                                        <div>
                                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                                Course Title
                                            </label>
                                            <input
                                                type="text"
                                                id="title"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                                Description
                                            </label>
                                            <textarea
                                                id="description"
                                                name="description"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                rows={4}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                                                Duration (in days)
                                            </label>
                                            <input
                                                type="number"
                                                id="duration"
                                                name="duration"
                                                value={formData.duration}
                                                onChange={handleInputChange}
                                                min="1"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                required
                                            />
                                            <p className="mt-1 text-sm text-gray-500">
                                                Enter the number of days the course will run
                                            </p>
                                        </div>

                                        <div>
                                            <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                                                Department
                                            </label>
                                            <select
                                                id="department"
                                                name="department"
                                                value={formData.department}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                required
                                            >
                                                <option value="CSE">Computer Science Engineering (CSE)</option>
                                                <option value="EEE">Electrical & Electronics Engineering (EEE)</option>
                                                <option value="MECH">Mechanical Engineering (MECH)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700">
                                                Course Thumbnail
                                            </label>
                                            <div className="mt-1">
                                                {thumbnailPreview ? (
                                                    <div className="mb-2">
                                                        <img 
                                                            src={thumbnailPreview} 
                                                            alt="Thumbnail preview" 
                                                            className="w-full h-40 object-cover rounded-lg border border-gray-200"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="mb-2 bg-gray-100 rounded-lg h-40 flex items-center justify-center">
                                                        <FiImage className="text-gray-400 text-4xl" />
                                                    </div>
                                                )}
                                                <div className="flex items-center">
                                                    <label className="relative cursor-pointer bg-white rounded-md border border-gray-300 p-2 w-full">
                                                        <div className="flex items-center">
                                                            {thumbnailFile ? (
                                                                <div className="flex items-center text-sm text-gray-600">
                                                                    <FiImage className="mr-2" />
                                                                    <span>{thumbnailFile.name}</span>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center text-sm text-gray-600">
                                                                    <FiUpload className="mr-2" />
                                                                    <span>Click to upload thumbnail</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <input
                                                            type="file"
                                                            id="thumbnail"
                                                            onChange={handleThumbnailChange}
                                                            accept="image/*"
                                                            className="hidden"
                                                        />
                                                    </label>
                                                </div>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Recommended size: 1280x720 pixels. Max file size: 10MB
                                            </p>
                                        </div>

                                        <div>
                                            <label htmlFor="youtubeLink" className="block text-sm font-medium text-gray-700">
                                                YouTube Link (Optional)
                                            </label>
                                            <input
                                                type="url"
                                                id="youtubeLink"
                                                name="youtubeLink"
                                                value={formData.youtubeLink}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                placeholder="https://www.youtube.com/watch?v=..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
                                <div className="p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">Course Materials</h2>
                                    <div className="space-y-4">
                                        {materialFiles.map((material, index) => (
                                            <div key={index} className="border rounded-lg p-4">
                                                <div className="grid grid-cols-1 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">
                                                            Material Title
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={material.title}
                                                            onChange={(e) => handleMaterialChange(index, 'title', e.target.value)}
                                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">
                                                            Description
                                                        </label>
                                                        <textarea
                                                            value={material.description}
                                                            onChange={(e) => handleMaterialChange(index, 'description', e.target.value)}
                                                            rows={2}
                                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">
                                                            File Attachment
                                                        </label>
                                                        <div className="mt-1 flex items-center">
                                                            <label className="relative cursor-pointer bg-white rounded-md border border-gray-300 p-2 w-full">
                                                                <div className="flex items-center">
                                                                    {material.file ? (
                                                                        <div className="flex items-center text-sm text-gray-600">
                                                                            <FiFile className="mr-2" />
                                                                            <span>{material.file.name}</span>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex items-center text-sm text-gray-600">
                                                                            <FiUpload className="mr-2" />
                                                                            <span>Click to upload file</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <input
                                                                    type="file"
                                                                    onChange={(e) => handleFileChange(index, e)}
                                                                    className="hidden"
                                                                />
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-4 flex justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveMaterial(index)}
                                                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                    >
                                                        <FiTrash2 className="mr-1" />
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={handleAddMaterial}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            <FiPlus className="mr-1" />
                                            Add Material
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
                                <div className="p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">Course Modules</h2>
                                    <div className="space-y-4">
                                        {modules.map((module, index) => (
                                            <div key={index} className="border rounded-lg p-4">
                                                <div className="grid grid-cols-1 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">
                                                            Module Title
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={module.title}
                                                            onChange={(e) => handleModuleChange(index, 'title', e.target.value)}
                                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">
                                                            Description
                                                        </label>
                                                        <textarea
                                                            value={module.description}
                                                            onChange={(e) => handleModuleChange(index, 'description', e.target.value)}
                                                            rows={2}
                                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">
                                                            Content
                                                        </label>
                                                        <textarea
                                                            value={module.content}
                                                            onChange={(e) => handleModuleChange(index, 'content', e.target.value)}
                                                            rows={4}
                                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="mt-4 flex justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeModule(index)}
                                                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                    >
                                                        <FiTrash2 className="mr-1" />
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={addModule}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            <FiPlus className="mr-1" />
                                            Add Module
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <FiX className="h-5 w-5 text-red-400" />
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-red-700">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    {isSubmitting ? 'Creating...' : 'Create Course'}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AddCourse; 