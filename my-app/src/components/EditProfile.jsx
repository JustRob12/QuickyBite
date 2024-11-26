import React, { useState, useRef } from 'react';
import { FaArrowLeft, FaPen, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

function EditProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user'));
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    pronouns: user?.pronouns || 'he/him',
    profileImage: user?.profilePicture || null
  });

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('profilePicture', file);
        formData.append('userId', user.id); // Using user.id instead of user._id

        console.log('Uploading profile picture for user:', user.id);
        const response = await axios.post(`${API_URL}/api/auth/upload-profile-picture`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data.profilePicture) {
          const fullProfilePicturePath = `${API_URL}${response.data.profilePicture}`;
          console.log('Profile picture uploaded successfully:', fullProfilePicturePath);
          
          setProfileData(prev => ({
            ...prev,
            profileImage: fullProfilePicturePath
          }));

          const updatedUser = { ...user, profilePicture: fullProfilePicturePath };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      } catch (error) {
        console.error('Error uploading profile picture:', error.response?.data || error.message);
        alert('Failed to upload profile picture. Please try again.');
      }
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Add delete account logic here
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="p-4 flex items-center border-b">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <FaArrowLeft className="text-gray-600" />
        </button>
        <h1 className="ml-4 text-xl font-semibold">Edit Profile</h1>
      </div>

      {/* Profile Picture */}
      <div className="p-6 flex flex-col items-center">
        <div className="relative">
          <div 
            className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden cursor-pointer"
            onClick={handleImageClick}
          >
            {profileData.profileImage ? (
              <img 
                src={profileData.profileImage} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FaPen className="text-gray-400" />
              </div>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />
        </div>
        <p className="mt-2 text-sm text-gray-600">Tap to change profile picture</p>
      </div>

      {/* Name Section */}
      <div className="mt-4 text-center w-full">
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-xl font-semibold">{profileData.name}</h2>
          <button className="p-1">
            <FaPen className="text-gray-400 text-sm" />
          </button>
        </div>
        <p className="text-gray-500 text-sm">{profileData.pronouns}</p>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-gray-500">Email</label>
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <span>{profileData.email}</span>
            <FaPen className="text-gray-400 text-sm" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-gray-500">Phone Number</label>
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <span>{profileData.phoneNumber || 'Add phone number'}</span>
            <FaPen className="text-gray-400 text-sm" />
          </div>
        </div>
      </div>

      {/* Delete Account Button */}
      <div className="pt-6">
        <button
          onClick={handleDeleteAccount}
          className="w-full flex items-center justify-center gap-2 text-red-500 py-3 border border-red-500 rounded-lg hover:bg-red-50"
        >
          <FaTrash />
          <span>Delete Account</span>
        </button>
      </div>
    </div>
  );
}

export default EditProfile;