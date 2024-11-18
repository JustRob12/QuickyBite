import React, { useState } from 'react';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function Header() {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="bg-white p-4 shadow-sm relative">
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <div className="text-sm text-gray-600">Hello</div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">
              <span className="text-[#B8860B]">{user?.name}</span>
            </h1>
            <span className="text-2xl animate-pulse">👋</span>
          </div>
          <div className="text-sm text-gray-600">What to Eat on this Day</div>
        </div>

        <button 
          onClick={() => setShowDropdown(!showDropdown)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <FaUserCircle className="text-[#B8860B] text-2xl" />
        </button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute right-4 top-16 bg-white shadow-lg rounded-lg py-2 min-w-[150px] z-50 border border-gray-100">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              <FaSignOutAlt className="text-[#B8860B]" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>

      {/* Overlay to close dropdown when clicking outside */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40 bg-black/5"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}

export default Header; 