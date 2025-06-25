import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSave, FiBook, FiClock, FiUsers, FiAward, FiEdit2, FiInfo, FiCheck, FiX, FiPlus, FiTrash2, FiFile, FiUpload, FiYoutube } from 'react-icons/fi';
import courseService from '../../services/courseService';
import { Course } from '../../types/course';
import { toast } from 'react-toastify';

interface MaterialFile {
    file: File | null;
    title: string;
    description: string;
}

interface Module {
    title: string;
    description: string;
    content: string;
}

const EditCourse: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [materialFiles, setMaterialFiles] = useState<MaterialFile[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [department, setDepartment] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [materials, setMaterials] = useState<Array<{
    title: string;
    description: string;
    type: string;
    fileData?: {
      data: Buffer;
      contentType: string;
    };
  }>>([]);

  // Define maxLengths object
  const maxLengths = {
    title: 100,
    description: 2000,
    duration: 10,
    youtubeLink: 200,
    moduleTitle: 100,
    moduleDescription: 500,
    moduleContent: 5000,
    materialTitle: 100,
    materialDescription: 500
  };

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await courseService.getCourseById(id || '');
      setCourse(data);
      
      // Initialize state from course data
      setTitle(data.title);
      setDescription(data.description);
      setDuration(data.duration);
      setDepartment(data.department);
      setYoutubeLink(data.youtubeLink || '');
      
      // Initialize modules from course data
      if (data.modules) {
        setModules(data.modules.map(m => ({
          title: m.title,
          description: m.description,
          content: m.content
        })));
      }
      
      // Initialize materials (excluding modules)
      if (data.materials) {
        const nonModuleMaterials = data.materials.filter(m => m.type !== 'module');
        setMaterials(nonModuleMaterials);
        
        // Initialize material files for new uploads
        setMaterialFiles(nonModuleMaterials.map(material => ({
          file: null,
          title: material.title,
          description: material.description
        })));
      }
    } catch (err) {
      console.error('Error fetching course:', err);
      setError('Failed to load course');
      toast.error('Failed to load course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    switch (field) {
      case 'title':
        setTitle(value);
        break;
      case 'description':
        setDescription(value);
        break;
      case 'duration':
        setDuration(value);
        break;
      case 'department':
        setDepartment(value);
        break;
      case 'youtubeLink':
        setYoutubeLink(value);
        break;
      default:
        break;
    }
  };

  const addModule = () => {
    setModules([...modules, { title: '', description: '', content: '' }]);
  };

  const removeModule = (index: number) => {
    setModules(modules.filter((_, i) => i !== index));
  };

  const handleModuleChange = (index: number, field: keyof Module, value: string) => {
    const newModules = [...modules];
    
    // Check length limits based on field type
    const maxLength = field === 'title' ? maxLengths.moduleTitle :
                     field === 'description' ? maxLengths.moduleDescription :
                     field === 'content' ? maxLengths.moduleContent : undefined;
    
    if (maxLength && value.length > maxLength) {
      toast.warning(`Module ${field} cannot exceed ${maxLength} characters`);
      return;
    }
    
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
    
    if (typeof value === 'string') {
      // Check length limits for string fields
      const maxLength = field === 'title' ? maxLengths.materialTitle :
                       field === 'description' ? maxLengths.materialDescription : undefined;
      
      if (maxLength && value.length > maxLength) {
        toast.warning(`Material ${field} cannot exceed ${maxLength} characters`);
        return;
      }
    }
    
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
      setThumbnailFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;

    try {
      setSaving(true);
      setError(null);

      // Basic validation
      const trimmedTitle = title.trim();
      const trimmedDescription = description.trim();
      const trimmedDuration = duration.trim();
      const trimmedYoutubeLink = youtubeLink.trim();

      // Validate required fields first
      if (!trimmedTitle) {
        throw new Error('Course title is required');
      }
      if (!department) {
        throw new Error('Department is required');
      }
      if (!trimmedDuration) {
        throw new Error('Duration is required');
      }

      // Validate department value
      const validDepartments = ['CSE', 'EEE', 'MECH'];
      if (!validDepartments.includes(department)) {
        throw new Error('Invalid department. Must be one of: CSE, EEE, MECH');
      }

      // Parse and validate duration
      const durationNumber = parseInt(trimmedDuration);
      if (isNaN(durationNumber) || durationNumber <= 0) {
        throw new Error('Duration must be a positive number');
      }

      // Field length validation
      if (trimmedTitle.length > maxLengths.title) {
        throw new Error(`Course title must be ${maxLengths.title} characters or less`);
      }
      if (trimmedDescription.length > maxLengths.description) {
        throw new Error(`Course description must be ${maxLengths.description} characters or less`);
      }
      if (trimmedDuration.length > maxLengths.duration) {
        throw new Error(`Duration must be ${maxLengths.duration} characters or less`);
      }
      if (trimmedYoutubeLink && trimmedYoutubeLink.length > maxLengths.youtubeLink) {
        throw new Error(`YouTube link must be ${maxLengths.youtubeLink} characters or less`);
      }

      // Validate and prepare modules
      const validModules = modules.map((module, index) => {
        const trimmedModuleTitle = module.title.trim();
        const trimmedModuleDescription = module.description.trim();
        const trimmedModuleContent = module.content.trim();

        if (!trimmedModuleTitle || !trimmedModuleDescription || !trimmedModuleContent) {
          throw new Error(`Module ${index + 1} must have a title, description, and content`);
        }
        if (trimmedModuleTitle.length > maxLengths.moduleTitle) {
          throw new Error(`Module ${index + 1} title must be ${maxLengths.moduleTitle} characters or less`);
        }
        if (trimmedModuleDescription.length > maxLengths.moduleDescription) {
          throw new Error(`Module ${index + 1} description must be ${maxLengths.moduleDescription} characters or less`);
        }
        if (trimmedModuleContent.length > maxLengths.moduleContent) {
          throw new Error(`Module ${index + 1} content must be ${maxLengths.moduleContent} characters or less`);
        }

        return {
          title: trimmedModuleTitle,
          description: trimmedModuleDescription,
          content: trimmedModuleContent,
          type: 'module'
        };
      });

      // Create FormData for file uploads
      const formData = new FormData();
      
      // Add basic course data
      formData.append('title', trimmedTitle);
      formData.append('description', trimmedDescription);
      formData.append('duration', trimmedDuration); // Keep duration as string
      formData.append('department', department);
      formData.append('instructor', course.instructor._id); // Add instructor ID
      
      // Only append youtubeLink if it exists and is valid
      if (trimmedYoutubeLink) {
        try {
          new URL(trimmedYoutubeLink);
          formData.append('youtubeLink', trimmedYoutubeLink);
        } catch (e) {
          throw new Error('Invalid YouTube link format');
        }
      }

      // Add modules if they exist
      if (validModules.length > 0) {
        try {
          const modulesJson = JSON.stringify(validModules);
          formData.append('modules', modulesJson);
          console.log('Modules JSON:', modulesJson);
        } catch (e) {
          console.error('Error stringifying modules:', e);
          throw new Error('Error processing modules data');
        }
      }

      // Add existing materials if they exist
      if (materials.length > 0) {
        try {
          const validMaterials = materials
            .filter(material => material.title.trim())
            .map(material => ({
              title: material.title.trim(),
              description: material.description.trim(),
              type: material.type || 'file'
              // Remove fileData since it's already stored in the backend
            }));

          if (validMaterials.length > 0) {
            const materialsJson = JSON.stringify(validMaterials);
            formData.append('materials', materialsJson);
            console.log('Materials JSON:', materialsJson);
          }
        } catch (e) {
          console.error('Error stringifying materials:', e);
          throw new Error('Error processing materials data');
        }
      }

      // Add new material files
      const validMaterialFiles = materialFiles.filter(material => 
        material.file && material.title.trim()
      );

      validMaterialFiles.forEach((material, index) => {
        if (material.file && material.title.trim()) {
          // Validate file size (10MB limit)
          if (material.file.size > 10 * 1024 * 1024) {
            throw new Error(`Material file "${material.title}" exceeds 10MB size limit`);
          }
          formData.append(`materialFiles`, material.file);
          formData.append(`materialTitles`, material.title.trim());
          formData.append(`materialDescriptions`, material.description.trim());
        }
      });

      // Add thumbnail if changed
      if (thumbnailFile) {
        // Validate thumbnail size (10MB limit)
        if (thumbnailFile.size > 10 * 1024 * 1024) {
          throw new Error('Thumbnail file exceeds 10MB size limit');
        }
        formData.append('thumbnail', thumbnailFile);
      }

      // Log form data before submission
      console.log('Submitting course update with data:');
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File (${value.size} bytes, ${value.type})`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      const updatedCourse = await courseService.updateCourse(course._id, formData);
      console.log('Course updated successfully:', updatedCourse);
      
      setSuccessMessage('Course updated successfully!');
      toast.success('Course updated successfully!');
      
      // Navigate after a short delay
      setTimeout(() => {
        navigate('/admin/courses');
      }, 1500);
    } catch (err) {
      console.error('Error updating course:', {
        error: err,
        courseId: course._id,
        title,
        department,
        duration,
        modulesCount: modules.length,
        materialsCount: materials.length,
        newMaterialsCount: materialFiles.filter(m => m.file).length
      });
      
      let errorMessage = 'Failed to update course';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        errorMessage = String(err.message);
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
          <Spinner animation="border" variant="primary" />
        </div>
        <p className="mt-3 text-gray-600 font-medium">Loading course details...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-4 border border-gray-100"
        >
          <Alert variant="danger" className="border-0 bg-red-50 text-red-700 rounded-xl">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-full mr-4">
                <FiX className="text-red-500 text-xl" />
              </div>
              <div>
                <h4 className="text-lg font-semibold">Error</h4>
                <p className="mb-0">{error}</p>
              </div>
            </div>
          </Alert>
          <div className="mt-6 flex justify-center">
            <Button 
              variant="outline-primary" 
              className="rounded-xl px-5 py-2.5 border-blue-500 text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium"
              onClick={() => navigate('/admin/courses')}
            >
              <FiArrowLeft className="me-2" />
              Back to Courses
            </Button>
          </div>
        </motion.div>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container className="py-5">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 border border-gray-100">
          <Alert variant="warning" className="border-0 bg-yellow-50 text-yellow-700 rounded-xl">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full mr-4">
                <FiInfo className="text-yellow-500 text-xl" />
              </div>
              <div>
                <h4 className="text-lg font-semibold">Course Not Found</h4>
                <p className="mb-0">The course you're looking for doesn't exist or has been removed.</p>
              </div>
            </div>
          </Alert>
          <div className="mt-6 flex justify-center">
            <Button 
              variant="outline-primary" 
              className="rounded-xl px-5 py-2.5 border-blue-500 text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium"
              onClick={() => navigate('/admin/courses')}
            >
              <FiArrowLeft className="me-2" />
              Back to Courses
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4 px-3 px-md-4">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-4 border border-gray-100"
        >
          <Alert variant="danger" className="border-0 bg-red-50 text-red-700 rounded-xl">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-full mr-4">
                <FiX className="text-red-500 text-xl" />
              </div>
              <div>
                <h4 className="text-lg font-semibold">Error</h4>
                <p className="mb-0">{error}</p>
              </div>
            </div>
          </Alert>
        </motion.div>
      )}

      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-4 border border-gray-100"
        >
          <Alert variant="success" className="border-0 bg-green-50 text-green-700 rounded-xl">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <FiCheck className="text-green-500 text-xl" />
              </div>
              <div>
                <h4 className="text-lg font-semibold">Success</h4>
                <p className="mb-0">{successMessage}</p>
              </div>
            </div>
          </Alert>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-lg p-6 mb-4 border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Edit Course</h1>
          <Button
            variant="outline-primary"
            className="rounded-xl px-5 py-2.5 border-blue-500 text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium"
            onClick={() => navigate('/admin/courses')}
          >
            <FiArrowLeft className="me-2" />
            Back to Courses
          </Button>
        </div>

        <Form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Group className="mb-4">
              <Form.Label className="text-gray-700 font-medium">Course Title</Form.Label>
              <Form.Control
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={maxLengths.title}
                className="rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
              <Form.Text className="text-gray-500">
                Maximum {maxLengths.title} characters ({title.length}/{maxLengths.title})
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="text-gray-700 font-medium">Department</Form.Label>
              <Form.Select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
                className="rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select Department</option>
                <option value="CSE">Computer Science</option>
                <option value="EEE">Electrical Engineering</option>
                <option value="MECH">Mechanical Engineering</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="text-gray-700 font-medium">Duration</Form.Label>
              <Form.Control
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
                maxLength={maxLengths.duration}
                className="rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., 12 weeks"
              />
              <Form.Text className="text-gray-500">
                Maximum {maxLengths.duration} characters ({duration.length}/{maxLengths.duration})
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="text-gray-700 font-medium">Course Thumbnail</Form.Label>
              <Form.Control
                type="file"
                onChange={handleThumbnailChange}
                accept="image/jpeg,image/png"
                className="rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
              <Form.Text className="text-gray-500">
                Recommended size: 1280x720 pixels. Max file size: 10MB
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="text-gray-700 font-medium">YouTube Link</Form.Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiYoutube className="h-5 w-5 text-red-500" />
                </div>
                <Form.Control
                  type="text"
                  value={youtubeLink}
                  onChange={(e) => setYoutubeLink(e.target.value)}
                  maxLength={maxLengths.youtubeLink}
                  className="pl-10 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
              <Form.Text className="text-gray-500">
                Optional: Add a YouTube video link for this course (Maximum {maxLengths.youtubeLink} characters)
              </Form.Text>
            </Form.Group>
          </div>

          <Form.Group className="mb-6">
            <Form.Label className="text-gray-700 font-medium">Course Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              maxLength={maxLengths.description}
              className="rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
            <Form.Text className="text-gray-500">
              Maximum {maxLengths.description} characters ({description.length}/{maxLengths.description})
            </Form.Text>
          </Form.Group>

          {/* Course Modules Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Course Modules</h2>
              <Button
                variant="outline-primary"
                onClick={addModule}
                className="rounded-xl px-4 py-2 border-blue-500 text-blue-600 hover:bg-blue-50 transition-all duration-200"
              >
                <FiPlus className="me-2" />
                Add Module
              </Button>
            </div>

            {modules.map((module, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-700">Module {index + 1}</h3>
                  <Button
                    variant="outline-danger"
                    onClick={() => removeModule(index)}
                    className="rounded-xl px-3 py-1 border-red-500 text-red-600 hover:bg-red-50 transition-all duration-200"
                  >
                    <FiTrash2 />
                  </Button>
                </div>

                <Form.Group className="mb-4">
                  <Form.Label className="text-gray-700 font-medium">Module Title</Form.Label>
                  <Form.Control
                    type="text"
                    value={module.title}
                    onChange={(e) => handleModuleChange(index, 'title', e.target.value)}
                    required
                    className="rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="text-gray-700 font-medium">Module Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={module.description}
                    onChange={(e) => handleModuleChange(index, 'description', e.target.value)}
                    required
                    className="rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="text-gray-700 font-medium">Module Content</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={6}
                    value={module.content}
                    onChange={(e) => handleModuleChange(index, 'content', e.target.value)}
                    required
                    className="rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </Form.Group>
              </div>
            ))}
          </div>

          {/* Course Materials Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Course Materials</h2>
              <Button
                variant="outline-primary"
                onClick={handleAddMaterial}
                className="rounded-xl px-4 py-2 border-blue-500 text-blue-600 hover:bg-blue-50 transition-all duration-200"
              >
                <FiPlus className="me-2" />
                Add Material
              </Button>
            </div>

            {materialFiles.map((material, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-700">Material {index + 1}</h3>
                  <Button
                    variant="outline-danger"
                    onClick={() => handleRemoveMaterial(index)}
                    className="rounded-xl px-3 py-1 border-red-500 text-red-600 hover:bg-red-50 transition-all duration-200"
                  >
                    <FiTrash2 />
                  </Button>
                </div>

                <Form.Group className="mb-4">
                  <Form.Label className="text-gray-700 font-medium">Material Title</Form.Label>
                  <Form.Control
                    type="text"
                    value={material.title}
                    onChange={(e) => handleMaterialChange(index, 'title', e.target.value)}
                    required
                    className="rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="text-gray-700 font-medium">Material Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={material.description}
                    onChange={(e) => handleMaterialChange(index, 'description', e.target.value)}
                    required
                    className="rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="text-gray-700 font-medium">Material File</Form.Label>
                  <Form.Control
                    type="file"
                    onChange={(e) => handleFileChange(index, e)}
                    className="rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <Form.Text className="text-gray-500">
                    Max file size: 10MB. Supported formats: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX
                  </Form.Text>
                </Form.Group>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              disabled={saving}
              className="rounded-xl px-6 py-2.5 bg-blue-600 hover:bg-blue-700 transition-all duration-200 font-medium"
            >
              {saving ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Saving...
                </>
              ) : (
                <>
                  <FiSave className="me-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </Form>
      </motion.div>
    </Container>
  );
};

export default EditCourse; 