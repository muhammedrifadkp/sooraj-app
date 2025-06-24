import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI, userAPI } from '../../services/api';
import { FiUpload, FiCamera } from 'react-icons/fi';
import { API_URL } from '../../config';

interface AvatarData {
  data: string;
  contentType: string;
}

interface UserProfile {
  name: string;
  email: string;
  bio: string;
  location: string;
  role: string;
  avatar: string | AvatarData;
}

const isAvatarData = (avatar: string | AvatarData): avatar is AvatarData => {
  return typeof avatar === 'object' && 'data' in avatar && 'contentType' in avatar;
};

const AdminProfile = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [profile, setProfile] = useState<UserProfile>({
    name: user?.name || '',
    email: user?.email || '',
    bio: '',
    location: '',
    role: (user?.role || 'admin').toLowerCase(),
    avatar: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    ...profile,
    role: profile.role.toLowerCase()
  });
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userAPI.getProfile();
        console.log('Profile response:', {
          ...response,
          avatar: response.avatar ? {
            hasData: !!response.avatar.data,
            contentType: response.avatar.contentType,
            dataLength: response.avatar.data?.length
          } : null
        });
        
        let avatarUrl = '';
        if (response.avatar?.data) {
          try {
            // Clean and validate the base64 data
            const base64Data = response.avatar.data.trim().replace(/[\r\n\s]/g, '');
            if (!base64Data) {
              console.error('Empty avatar data received');
              throw new Error('Empty avatar data');
            }

            // Validate base64 format
            if (!/^[A-Za-z0-9+/=]+$/.test(base64Data)) {
              console.error('Invalid base64 data format');
              throw new Error('Invalid base64 format');
            }

            const contentType = response.avatar.contentType || 'image/jpeg';
            avatarUrl = `data:${contentType};base64,${base64Data}`;
            
            // Test the image URL
            const img = new Image();
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = () => {
                console.error('Failed to load avatar image');
                reject(new Error('Failed to load image'));
              };
              img.src = avatarUrl;
            });
            
            console.log('Avatar URL validated successfully');
          } catch (imgError) {
            console.error('Invalid avatar data:', imgError);
            avatarUrl = '';
          }
        }
        
        const profileData = {
          name: response.name,
          email: response.email,
          bio: response.bio || '',
          location: response.location || '',
          role: response.role || 'admin',
          avatar: avatarUrl
        };
        
        console.log('Setting profile data:', {
          ...profileData,
          avatar: avatarUrl ? 'Valid avatar URL' : 'No avatar'
        });
        
        setProfile(profileData);
        setEditedProfile(profileData);
        setImageError(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile');
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      setError('');
      setSuccess('');
      setIsLoading(true);
      
      // Prepare profile data
      const profileData = {
        name: editedProfile.name,
        email: editedProfile.email,
        bio: editedProfile.bio || '',
        location: editedProfile.location || '',
        role: editedProfile.role.toLowerCase()
      };
      
      console.log('Saving profile data:', profileData);
      
      // Update profile with authorization header
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      const responseData = await response.json();
      console.log('Profile update response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || responseData.error || 'Failed to update profile');
      }

      if (!responseData.success) {
        throw new Error(responseData.message || 'Failed to update profile');
      }

      const updatedUser = responseData.user;
      
      // Update auth context
      updateUser(updatedUser);
      
      // Update local state
      setProfile(prev => ({
        ...prev,
        ...updatedUser,
        role: updatedUser.role.toLowerCase()
      }));
      setEditedProfile(prev => ({
        ...prev,
        ...updatedUser,
        role: updatedUser.role.toLowerCase()
      }));
      
      setIsEditing(false);
      setSuccess('Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }

    try {
      await authAPI.changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordSuccess('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setIsEditingPassword(false);
    } catch (error: any) {
      setPasswordError(error.response?.data?.message || 'Failed to change password');
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    setIsUploading(true);
    setUploadError('');
    setImageError(false);
    setUploadSuccess('');

    try {
      // Upload to server first
      await userAPI.uploadPhoto(file);
      setUploadSuccess('Photo uploaded successfully');
      
      // Fetch updated profile to get the server's version
      const response = await userAPI.getProfile();
      if (response.avatar?.data) {
        try {
          const base64Data = response.avatar.data.trim().replace(/[\r\n\s]/g, '');
          if (!base64Data) {
            throw new Error('Empty avatar data received from server');
          }
          
          const contentType = response.avatar.contentType || 'image/jpeg';
          const serverAvatarUrl = `data:${contentType};base64,${base64Data}`;
          
          setProfile(prev => ({
            ...prev,
            avatar: serverAvatarUrl
          }));
          setEditedProfile(prev => ({
            ...prev,
            avatar: serverAvatarUrl
          }));
          setImageError(false);
        } catch (imgError) {
          console.error('Error processing server avatar:', imgError);
          throw new Error('Failed to process server avatar');
        }
      }
    } catch (error) {
      console.error('Error handling photo:', error);
      setUploadError('Failed to upload photo');
      setImageError(true);
      setProfile(prev => ({ ...prev, avatar: '' }));
      setEditedProfile(prev => ({ ...prev, avatar: '' }));
    } finally {
      setIsUploading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleImageLoad = () => {
    setImageError(false);
  };

  const handleImageError = () => {
    console.log('Image failed to load:', profile.avatar);
    setImageError(true);
  };

  const renderAvatar = () => {
    if (imageError || !profile.avatar) {
      return (
        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
          <FiCamera className="w-8 h-8 text-gray-400" />
        </div>
      );
    }

    const avatarUrl = isAvatarData(profile.avatar)
      ? `data:${profile.avatar.contentType || 'image/jpeg'};base64,${profile.avatar.data}`
      : profile.avatar;

    return (
      <div className="w-24 h-24 rounded-full overflow-hidden">
        <img
          src={avatarUrl}
          alt={`${profile.name}'s avatar`}
          className="w-full h-full object-cover"
          onError={() => {
            console.error('Error loading image. Avatar data:', profile.avatar);
            setImageError(true);
            setProfile(prev => ({ ...prev, avatar: '' }));
          }}
          onLoad={() => {
            setImageError(false);
            console.log('Image loaded successfully');
          }}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
            <div className="px-6 py-8 sm:px-8">
              <div className="flex items-center space-x-6">
                <div className="relative group">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-white shadow-lg transform transition-transform duration-300 group-hover:scale-105">
                    {isUploading ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : (
                      <div className="relative w-full h-full">
                        {renderAvatar()}
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <button
                      onClick={handlePhotoClick}
                      className="absolute bottom-0 right-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-2 rounded-full hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                      disabled={isUploading}
                    >
                      <FiCamera className="h-4 w-4" />
                    </button>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900">{profile.name}</h2>
                      <p className="text-lg text-gray-600">{profile.role}</p>
                    </div>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg"
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>
                  {uploadSuccess && (
                    <p className="mt-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full inline-block">
                      {uploadSuccess}
                    </p>
                  )}
                  {uploadError && (
                    <p className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full inline-block">
                      {uploadError}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Information */}
            <div className="px-6 py-8 sm:px-8">
              {isEditing ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        value={editedProfile.name}
                        onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={editedProfile.email}
                        onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea
                      value={editedProfile.bio}
                      onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={editedProfile.location}
                      onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>

                  {/* Change Password Section */}
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-xl font-semibold text-gray-900 mb-6">Change Password</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                        <input
                          type="password"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        />
                      </div>
                    </div>
                    {passwordError && (
                      <p className="mt-4 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                        {passwordError}
                      </p>
                    )}
                    {passwordSuccess && (
                      <p className="mt-4 text-sm text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                        {passwordSuccess}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end space-x-4 pt-6">
                    <button
                      onClick={handleCancel}
                      className="px-6 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 transition-all duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="px-6 py-3 border border-transparent rounded-lg text-base font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </span>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Name</h4>
                      <p className="mt-2 text-lg text-gray-900">{profile.name}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Email</h4>
                      <p className="mt-2 text-lg text-gray-900">{profile.email}</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Bio</h4>
                      <p className="mt-2 text-lg text-gray-900">{profile.bio}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Location</h4>
                      <p className="mt-2 text-lg text-gray-900">{profile.location}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile; 