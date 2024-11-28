import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUserCircle, FaCamera, FaArrowLeft, FaTimes } from 'react-icons/fa';
import Header from './Header';

function EditProfile() {
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    pronouns: 'he/him',
    profileImage: null
  });
  const [isEditing, setIsEditing] = useState({
    name: false,
    email: false,
    phoneNumber: false,
    pronouns: false
  });
  const [error, setError] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('');
  const navigate = useNavigate();

  // Load user data immediately
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/auth/user`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        const userData = response.data;
        console.log('Loaded user data:', userData); // Debug log

        setProfileData({
          name: userData.name || '',
          email: userData.email || '',
          phoneNumber: userData.phoneNumber || '',
          pronouns: userData.pronouns || 'he/him',
          profileImage: userData.profilePicture ? 
            (userData.profilePicture.startsWith('http') ? 
              userData.profilePicture : 
              `${import.meta.env.VITE_API_URL}/${userData.profilePicture.replace(/^\//, '')}`
            ) : null
        });
      } catch (error) {
        console.error('Error loading user data:', error);
        setError('Error loading user data');
      }
    };

    loadUserData();
  }, []);

  // Add notification helper
  const showNotification = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/upload-profile-picture`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const imageUrl = response.data.profilePicture.startsWith('http') ?
        response.data.profilePicture :
        `${import.meta.env.VITE_API_URL}/${response.data.profilePicture.replace(/^\//, '')}`;
      
      setProfileData(prev => ({
        ...prev,
        profileImage: imageUrl
      }));

      const currentUser = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({
        ...currentUser,
        profilePicture: imageUrl
      }));

      showNotification('Profile picture updated successfully!', 'success');
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      showNotification(error.response?.data?.message || 'Error uploading profile picture', 'error');
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');

    try {
      const token = localStorage.getItem('token');
      const currentUser = JSON.parse(localStorage.getItem('user'));
      
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/auth/update-profile`,
        {
          name: profileData.name,
          email: profileData.email,
          phoneNumber: profileData.phoneNumber,
          pronouns: profileData.pronouns
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const updatedUser = {
        ...currentUser,
        ...response.data.user,
        profilePicture: currentUser.profilePicture
      };

      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setProfileData(prev => ({
        ...prev,
        ...response.data.user,
        profileImage: currentUser.profilePicture
      }));

      setIsEditing({
        name: false,
        email: false,
        phoneNumber: false,
        pronouns: false
      });
      
      showNotification('Profile updated successfully!', 'success');
    } catch (error) {
      showNotification(error.response?.data?.message || 'Error updating profile', 'error');
    }
  };

  const handleInputChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handlePronounsChange = async (e) => {
    const newPronouns = e.target.value;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/auth/update-profile`,
        {
          ...profileData,
          pronouns: newPronouns
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setProfileData(prev => ({
        ...prev,
        pronouns: newPronouns
      }));

      const currentUser = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({
        ...currentUser,
        pronouns: newPronouns
      }));

      showNotification('Pronouns updated successfully!', 'success');
    } catch (error) {
      showNotification(error.response?.data?.message || 'Error updating pronouns', 'error');
    }
  };

  const renderEditableField = (fieldName, label, type = 'text') => {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
        <div className="flex items-center gap-2">
          {isEditing[fieldName] ? (
            <input
              type={type}
              name={fieldName}
              value={profileData[fieldName]}
              onChange={handleInputChange}
              className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                focus:ring-2 focus:ring-[#B8860B] focus:border-transparent
                dark:bg-gray-700 dark:text-white"
            />
          ) : (
            <div className="flex-1 p-2 dark:text-white">
              {profileData[fieldName] ? profileData[fieldName] : `No ${label.toLowerCase()} set`}
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              if (isEditing[fieldName]) {
                handleSubmit();
              } else {
                setIsEditing(prev => ({
                  ...prev,
                  [fieldName]: true
                }));
              }
            }}
            className="px-4 py-2 text-sm text-[#B8860B] border border-[#B8860B] rounded-lg
              hover:bg-[#B8860B] hover:text-white transition-colors"
          >
            {isEditing[fieldName] ? 'Save' : 'Edit'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      {/* Alert Notification */}
      {showAlert && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 
          ${alertType === 'success' ? 'bg-green-500' : 'bg-red-500'} 
          text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 
          animate-fade-in-down`}>
          <span>{alertMessage}</span>
          <button 
            onClick={() => setShowAlert(false)}
            className="ml-2 text-white hover:text-gray-200"
          >
            <FaTimes />
          </button>
        </div>
      )}

      <div className="max-w-2xl mx-auto p-4">
        <button
          onClick={() => navigate('/calendar')}
          className="mb-4 flex items-center gap-2 text-[#B8860B] hover:text-[#9B7506] transition-colors
            dark:text-[#B8860B] dark:hover:text-[#9B7506]"
        >
          <FaArrowLeft />
          <span>Back to Calendar</span>
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6 dark:text-white">Edit Profile</h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded">
              {error}
            </div>
          )}

          {/* Profile Picture Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              {profileData.profileImage ? (
                <img
                  src={profileData.profileImage}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <FaUserCircle className="w-20 h-20 text-gray-400 dark:text-gray-600" />
                </div>
              )}
              <label className="absolute bottom-0 right-0 bg-[#B8860B] text-white p-2 rounded-full cursor-pointer hover:bg-[#9B7506] transition-colors">
                <FaCamera className="w-4 h-4" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Tap to change profile picture
            </p>
          </div>

          {/* Form Fields */}
          <form className="space-y-4">
            {renderEditableField('name', 'Name')}
            {renderEditableField('email', 'Email', 'email')}
            {renderEditableField('phoneNumber', 'Phone Number', 'tel')}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pronouns
              </label>
              <select
                name="pronouns"
                value={profileData.pronouns}
                onChange={handlePronounsChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                  focus:ring-2 focus:ring-[#B8860B] focus:border-transparent
                  dark:bg-gray-700 dark:text-white"
              >
                <option value="he/him">he/him</option>
                <option value="she/her">she/her</option>
                <option value="they/them">they/them</option>
                <option value="other">other</option>
              </select>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditProfile;