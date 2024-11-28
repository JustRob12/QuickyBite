import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaSignOutAlt, FaUser, FaCog, FaBell, FaMoon, FaShare, FaFacebook, FaTimes, FaLanguage, FaLock, FaCheck, FaExclamationCircle, FaTrash, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import AppearanceModal from './AppearanceModal';
import axios from 'axios';
import { format } from 'date-fns';

function Header() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAppearanceModal, setShowAppearanceModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [shareUsername, setShareUsername] = useState('');
  const [shareError, setShareError] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [expandedNotifications, setExpandedNotifications] = useState({});
  const [isCollapsed, setIsCollapsed] = useState(false);

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
            (userData.profilePicture.startsWith('http') ? 
              userData.profilePicture : 
              `${import.meta.env.VITE_API_URL}/${userData.profilePicture.replace(/^\//, '')}`
            ) : null
        });
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/notifications`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setNotifications(response.data);
        const unreadNotifications = response.data.filter(n => !n.read).length;
        setUnreadCount(unreadNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
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
    setShowLogoutConfirmation(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/notifications/read-all`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const handleShareWithUser = async () => {
    try {
      setShareError('');
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/notifications/share`,
        { username: shareUsername },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setShareUsername('');
      setShareError('Shared successfully!');
      setTimeout(() => setShareError(''), 3000);
    } catch (error) {
      setShareError(error.response?.data?.message || 'Error sharing app');
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/notifications/${notificationId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const updatedNotifications = notifications.filter(n => n._id !== notificationId);
      setNotifications(updatedNotifications);
      const unreadNotifications = updatedNotifications.filter(n => !n.read).length;
      setUnreadCount(unreadNotifications);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleDeleteAllNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/notifications/all`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error deleting all notifications:', error);
    }
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
    { 
      icon: <FaCog className="text-[#B8860B]" />, 
      label: 'Settings',
      onClick: () => {
        setShowDropdown(false);
        setShowSettingsModal(true);
      }
    },
    {
      icon: (
        <div className="relative">
          <FaBell className="text-[#B8860B]" />
          {unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </div>
          )}
        </div>
      ),
      label: 'Notifications',
      onClick: () => {
        setShowDropdown(false);
        setShowNotificationsModal(true);
      }
    },
    { 
      icon: <FaMoon className="text-[#B8860B]" />, 
      label: 'Appearance',
      onClick: () => {
        setShowDropdown(false);
        setShowAppearanceModal(true);
      }
    },
    { 
      icon: <FaShare className="text-[#B8860B]" />, 
      label: 'Share App',
      onClick: () => {
        setShowDropdown(false);
        setShowShareModal(true);
      }
    },
    { icon: <FaSignOutAlt className="text-[#B8860B]" />, label: 'Logout', onClick: handleLogout },
  ];

  const handleShare = (platform) => {
    const url = 'https://quicky-bite-jnjc.vercel.app/';
    
    if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    }
  };

  const toggleNotification = (notificationId) => {
    setExpandedNotifications(prev => ({
      ...prev,
      [notificationId]: !prev[notificationId]
    }));
  };

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
                  <div className="flex flex-col items-center gap-2">
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt="Profile"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <FaUserCircle className="w-12 h-12 text-gray-400 dark:text-gray-600" />
                    )}
                    <div className="text-center">
                      <p className="font-medium text-sm dark:text-white truncate max-w-[120px]">{user?.name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[120px]">{user?.email}</p>
                    </div>
                  </div>
                </div>
                
                {menuItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={item.onClick || (() => {})}
                    className="w-full px-4 py-2 text-left text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
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
      {showAppearanceModal && (
        <AppearanceModal
          isOpen={showAppearanceModal}
          onClose={() => setShowAppearanceModal(false)}
          onThemeChange={setTheme}
          currentTheme={theme}
        />
      )}
      
      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 relative">
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FaTimes />
            </button>
            
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Share QuickyBite</h2>
            
            <div className="space-y-4">
              {/* Share Link */}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Share this link:</p>
                <div className="flex">
                  <input
                    type="text"
                    value="https://quicky-bite-jnjc.vercel.app/"
                    readOnly
                    className="flex-1 p-2 border rounded-l dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText('https://quicky-bite-jnjc.vercel.app/')}
                    className="bg-[#B8860B] text-white px-4 rounded-r hover:bg-[#9A7209]"
                  >
                    Copy
                  </button>
                </div>
              </div>

            

              {/* Social Share */}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Share on social media:</p>
                <div className="flex justify-center">
                  <button
                    onClick={() => handleShare('facebook')}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                  >
                    <FaFacebook />
                    <span>Share on Facebook</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 relative">
            <button
              onClick={() => setShowSettingsModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FaTimes />
            </button>
            
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Settings</h2>
            
            <div className="space-y-4">
              {/* Language */}
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors">
                <div className="flex items-center space-x-3">
                  <FaLanguage className="text-[#B8860B] text-xl" />
                  <div>
                    <h3 className="font-medium dark:text-white">Language</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Change app language</p>
                  </div>
                </div>
              </div>

              {/* Privacy & Security */}
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors">
                <div className="flex items-center space-x-3">
                  <FaLock className="text-[#B8860B] text-xl" />
                  <div>
                    <h3 className="font-medium dark:text-white">Privacy & Security</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Manage your privacy settings</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Notifications Modal */}
      {showNotificationsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 w-[480px] relative transition-all duration-300 ${
            isCollapsed ? 'h-24' : 'max-h-[600px]'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold dark:text-white">Notifications</h2>
              <div className="flex gap-3 items-center">
                {/* Collapse/Expand button with better visibility */}
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg 
                    bg-gray-100 hover:bg-gray-200 
                    dark:bg-gray-700 dark:hover:bg-gray-600 
                    text-gray-700 dark:text-gray-300 
                    transition-colors duration-200"
                >
                  {isCollapsed ? (
                    <>
                      <FaChevronDown className="text-[#B8860B]" />
                      <span className="text-sm">Expand</span>
                    </>
                  ) : (
                    <>
                      <FaChevronUp className="text-[#B8860B]" />
                      <span className="text-sm">Minimize</span>
                    </>
                  )}
                </button>
                {/* Close button */}
                <button
                  onClick={() => setShowNotificationsModal(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
                    text-gray-500 hover:text-gray-700 
                    dark:text-gray-400 dark:hover:text-gray-200
                    transition-colors duration-200"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* Individual notification expand/collapse buttons */}
            <div className={`space-y-3 overflow-y-auto ${isCollapsed ? 'hidden' : 'max-h-[480px]'}`}>
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No notifications yet
                </div>
              ) : (
                notifications.map(notification => (
                  <div
                    key={notification._id}
                    className={`p-4 rounded-lg transition-all ${
                      notification.read
                        ? 'bg-gray-50 dark:bg-gray-800'
                        : 'bg-blue-50 dark:bg-blue-900'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-grow">
                        {/* Preview text with more visible expand/collapse button */}
                        <div 
                          onClick={() => toggleNotification(notification._id)}
                          className="cursor-pointer flex items-center gap-2 group"
                        >
                          <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-1 flex-grow">
                            {notification.message}
                          </p>
                          <button className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            {expandedNotifications[notification._id] ? (
                              <FaChevronUp className="text-[#B8860B] group-hover:scale-110 transition-transform" />
                            ) : (
                              <FaChevronDown className="text-[#B8860B] group-hover:scale-110 transition-transform" />
                            )}
                          </button>
                        </div>
                        
                        {/* Full content - expandable */}
                        {expandedNotifications[notification._id] && (
                          <div className="mt-2 pl-2 border-l-2 border-[#B8860B]">
                            <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                              {notification.message}
                            </p>
                          </div>
                        )}
                        
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteNotification(notification._id)}
                        className="ml-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300
                          p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                      >
                        <FaTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Collapsed state summary with better visibility */}
            {isCollapsed && (
              <div className="text-center text-gray-600 dark:text-gray-400 font-medium">
                {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                {unreadCount > 0 && (
                  <span className="text-[#B8860B]"> ({unreadCount} unread)</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Confirm Logout</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Are you sure you want to log out?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowLogoutConfirmation(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;