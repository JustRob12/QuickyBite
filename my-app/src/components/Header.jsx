import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaSignOutAlt, FaUser, FaCog, FaBell, FaMoon, FaShare } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import AppearanceModal from './AppearanceModal';

function Header() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAppearanceModal, setShowAppearanceModal] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

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

          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            {user?.profilePicture ? (
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#B8860B]">
                <img 
                  src={user.profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <FaUserCircle className="text-[#B8860B] text-2xl" />
            )}
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-4 top-16 bg-white shadow-lg rounded-lg py-2 min-w-[200px] z-50 border border-gray-100">
              {/* Profile Header */}
              <div className="px-4 py-2 border-b border-gray-100 flex items-center gap-3">
                {user?.profilePicture ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-[#B8860B]">
                    <img 
                      src={user.profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <FaUserCircle className="text-[#B8860B] text-2xl" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
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