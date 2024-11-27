import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaSignOutAlt, FaUser, FaCog, FaBell, FaMoon, FaShare } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import AppearanceModal from './AppearanceModal';
import axios from 'axios';

function Header() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAppearanceModal, setShowAppearanceModal] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

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
        setUser({
          ...userData,
          profilePicture: userData.profilePicture ? 
            `${import.meta.env.VITE_API_URL}/${userData.profilePicture}` : null
        });
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

  useEffect(() => {
    // Apply theme on mount and theme change
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { 
      icon: <FaUser className="text-[#B8860B]" />, 
      label: 'Edit Profile',
      onClick: () => {
        setShowDropdown(false);
        navigate('/edit-profile');
      }
    },
    { icon: <FaCog className="text-[#B8860B]" />, label: 'Settings' },
    { icon: <FaBell className="text-[#B8860B]" />, label: 'Notification Settings' },
    { 
      icon: <FaMoon className="text-[#B8860B]" />, 
      label: 'Appearance',
      onClick: () => {
        setShowDropdown(false);
        setShowAppearanceModal(true);
      }
    },
    { icon: <FaShare className="text-[#B8860B]" />, label: 'Share App' },
    { icon: <FaSignOutAlt className="text-[#B8860B]" />, label: 'Logout', onClick: handleLogout },
  ];

  return (
    <>
      <div className="bg-white dark:bg-gray-900 p-4 shadow-sm relative">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <div className="text-sm text-gray-600 dark:text-gray-400">Hello</div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">
                <span className="text-[#B8860B]">{user?.name}</span>
              </h1>
              <span className="text-2xl animate-pulse">👋</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">What to Eat on this Day</div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 focus:outline-none"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <FaUserCircle className="w-full h-full text-gray-400 dark:text-gray-600" />
                  </div>
                )}
              </div>
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-12 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <FaUserCircle className="w-10 h-10 text-gray-400 dark:text-gray-600" />
                    )}
                    <div>
                      <p className="font-medium dark:text-white">{user?.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</p>
                    </div>
                  </div>
                </div>
                
                {menuItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={item.onClick || (() => {})}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Overlay to close dropdown when clicking outside */}
        {showDropdown && (
          <div 
            className="fixed inset-0 z-40 bg-black/5"
            onClick={() => setShowDropdown(false)}
          />
        )}
      </div>

      {/* Appearance Modal */}
      <AppearanceModal
        isOpen={showAppearanceModal}
        onClose={() => setShowAppearanceModal(false)}
        onThemeChange={setTheme}
        currentTheme={theme}
      />
    </>
  );
}

export default Header;