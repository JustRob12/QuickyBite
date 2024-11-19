import React, { useState, useRef } from 'react';
import { FaArrowLeft, FaPen, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function EditProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user'));
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    pronouns: user?.pronouns || 'he/him',
    profileImage: user?.profileImage || null
  });

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({
          ...prev,
          profileImage: reader.result
        }));
      };
      reader.readAsDataURL(file);
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
        <h1 className="text-xl font-semibold ml-4">Profile</h1>
      </div>

      <div className="p-6 space-y-6">
        {/* Profile Image Section */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div 
              onClick={handleImageClick}
              className={`w-32 h-32 rounded-full border-2 border-blue-500 flex items-center justify-center cursor-pointer overflow-hidden
                ${!profileData.profileImage ? 'bg-gray-100' : ''}`}
            >
              {profileData.profileImage ? (
                <img 
                  src={profileData.profileImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaPen className="text-gray-400 text-xl" />
              )}
            </div>
            <button 
              onClick={handleImageClick}
              className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md border"
            >
              <FaPen className="text-gray-600 text-sm" />
            </button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />
          
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
    </div>
  );
}

export default EditProfile; 