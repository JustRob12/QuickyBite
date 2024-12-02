import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaSignOutAlt, FaUser, FaCog, FaBell, FaMoon, FaShare, FaFacebook, FaTimes, FaLanguage, FaLock, FaCheck, FaExclamationCircle, FaTrash, FaChevronDown, FaChevronUp, FaSun, FaLaptop, FaUserFriends } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import AppearanceModal from './AppearanceModal';
import axios from 'axios';
import { format } from 'date-fns';

function Header() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAppearanceModal, setShowAppearanceModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [theme, setTheme] = useState(() => 
    localStorage.getItem('theme') || 'system'
  );
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [shareUsername, setShareUsername] = useState('');
  const [shareError, setShareError] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [expandedNotifications, setExpandedNotifications] = useState(new Set());
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [requestCount, setRequestCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

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
    handleThemeChange(theme);
  }, []);

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

  useEffect(() => {
    const fetchFriendRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/friends/requests`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const newRequestCount = response.data.received.length;
        setRequestCount(newRequestCount);
        updateTotalCount(newRequestCount, notificationCount);
      } catch (error) {
        console.error('Error fetching friend requests:', error);
      }
    };

    fetchFriendRequests();
  }, [notificationCount]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/notifications`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const unreadCount = response.data.filter(n => !n.read).length;
        setNotificationCount(unreadCount);
        updateTotalCount(requestCount, unreadCount);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, [requestCount]);

  const updateTotalCount = (requests, notifications) => {
    setTotalCount(requests + notifications);
  };

  const handleLogout = () => {
    setShowLogoutConfirmation(true);
  };

  const confirmLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }, 2000);
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/notifications/mark-all-read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/notifications/${notificationId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
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

      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.filter(notification => notification._id !== notificationId)
      );
      // Update unread count if deleted notification was unread
      const deletedNotification = notifications.find(n => n._id === notificationId);
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
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
      icon: <FaUserFriends className="text-[#B8860B]" />,
      label: 'Friends',
      onClick: () => {
        setShowDropdown(false);
        navigate('/friends');
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

  const toggleNotificationExpand = (notificationId) => {
    setExpandedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (darkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
    localStorage.setItem('theme', darkMode ? 'system' : 'dark');
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'dark' || 
      (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
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
              className="relative flex items-center gap-2 p-2 hover:bg-gray-100 
                dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <div className="relative">
                {user?.profilePicture ? (
                  <div className="relative">
                    <img
                      src={user.profilePicture}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    {totalCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs 
                        rounded-full h-5 w-5 flex items-center justify-center">
                        {totalCount}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <FaUserCircle className="w-8 h-8 text-gray-500" />
                    {totalCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs 
                        rounded-full h-5 w-5 flex items-center justify-center">
                        {totalCount}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <span className="text-gray-700 dark:text-gray-200">
          
              </span>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg 
                bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-1">
                  <Link
                    to="/edit-profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 
                      dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => setShowDropdown(false)}
                  >
                    <FaUser className="w-4 h-4" />
                    Edit Profile
                  </Link>

                  <Link
                    to="/friends"
                    className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 
                      dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => setShowDropdown(false)}
                  >
                    <div className="flex items-center gap-2">
                      <FaUserFriends className="w-4 h-4" />
                      Friends
                    </div>
                    {requestCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full 
                        h-5 w-5 flex items-center justify-center">
                        {requestCount}
                      </span>
                    )}
                  </Link>

                  <button
                    onClick={() => {
                      setShowSettingsModal(true);
                      setShowDropdown(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 
                      dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <FaCog className="w-4 h-4" />
                    Settings
                  </button>

                  <button
                    onClick={() => {
                      setShowNotificationsModal(true);
                      setShowDropdown(false);
                    }}
                    className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 
                      dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <div className="flex items-center gap-2">
                      <FaBell className="w-4 h-4" />
                      Notifications
                    </div>
                    {notificationCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full 
                        h-5 w-5 flex items-center justify-center">
                        {notificationCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setShowAppearanceModal(true)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 
                      dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    {theme === 'dark' ? (
                      <FaMoon className="w-4 h-4" />
                    ) : theme === 'light' ? (
                      <FaSun className="w-4 h-4" />
                    ) : (
                      <FaLaptop className="w-4 h-4" />
                    )}
                    Appearance
                  </button>

                  <button
                    onClick={() => {
                      setShowShareModal(true);
                      setShowDropdown(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 
                      dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <FaShare className="w-4 h-4" />
                    Share App
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 
                      dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 border-t
                      border-gray-100 dark:border-gray-600"
                  >
                    <FaSignOutAlt className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Click outside handler */}
        {showDropdown && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
        )}
      </div>

      {/* Appearance Modal */}
      {showAppearanceModal && (
        <AppearanceModal
          isOpen={showAppearanceModal}
          onClose={() => setShowAppearanceModal(false)}
          onThemeChange={handleThemeChange}
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
              {/* Privacy & Security */}
              <div 
                onClick={() => {
                  setShowPrivacyModal(true);
                  setShowSettingsModal(false);
                }}
                className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <FaLock className="text-[#B8860B] text-xl" />
                  <div>
                    <h3 className="font-medium dark:text-white">Privacy & Policy</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">View our privacy policy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[600px] max-h-[80vh] overflow-y-auto relative">
            <button
              onClick={() => setShowPrivacyModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FaTimes />
            </button>
            
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Privacy Policy</h2>
            
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <h3 className="font-semibold text-lg text-gray-800 dark:text-white">1. Information We Collect</h3>
              <p>
                We collect information you provide directly to us when using QuickyBite, including:
                - Personal information (name, email, profile picture)
                - Usage data and preferences
                - Device information
              </p>

              <h3 className="font-semibold text-lg text-gray-800 dark:text-white">2. How We Use Your Information</h3>
              <p>
                We use the collected information to:
                - Provide and improve our services
                - Personalize your experience
                - Communicate with you
                - Ensure security and prevent fraud
              </p>

              <h3 className="font-semibold text-lg text-gray-800 dark:text-white">3. Data Security</h3>
              <p>
                We implement appropriate security measures to protect your personal information.
                However, no method of transmission over the internet is 100% secure.
              </p>

              <h3 className="font-semibold text-lg text-gray-800 dark:text-white">4. Your Rights</h3>
              <p>
                You have the right to:
                - Access your personal data
                - Correct inaccurate data
                - Request deletion of your data
                - Opt-out of marketing communications
              </p>

              <h3 className="font-semibold text-lg text-gray-800 dark:text-white">5. Contact Us</h3>
              <p>
                If you have any questions about this Privacy Policy, please contact us at:
                support@quickybite.com
              </p>

              <div className="pt-4 text-sm text-gray-500 dark:text-gray-400">
                Last updated: {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Notifications Modal */}
      {showNotificationsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 w-[480px] relative 
            transition-all duration-300 ${isCollapsed ? 'h-24' : 'max-h-[600px]'}`}>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold dark:text-white">Notifications</h2>
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 
                    dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 
                    dark:hover:bg-gray-700 transition-colors"
                >
                  {isCollapsed ? <FaChevronDown /> : <FaChevronUp />}
                </button>
              </div>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-sm text-[#B8860B] hover:text-[#9B7506] transition-colors"
                  >
                    Mark all as read
                  </button>
                )}
                <button
                  onClick={() => setShowNotificationsModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 
                    dark:hover:text-gray-200"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {!isCollapsed && (
              <div className="space-y-4 overflow-y-auto max-h-[480px]">
                {notifications.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                    No notifications
                  </p>
                ) : (
                  notifications.map(notification => (
                    <div
                      key={notification._id}
                      className={`p-4 rounded-lg transition-all ${
                        notification.read
                          ? 'bg-gray-50 dark:bg-gray-700'
                          : 'bg-blue-50 dark:bg-blue-900/30'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-grow">
                          <div className="flex items-start justify-between">
                            <p className={`text-sm ${
                              notification.read
                                ? 'text-gray-600 dark:text-gray-300'
                                : 'text-gray-900 dark:text-white font-medium'
                            }`}>
                              {expandedNotifications.has(notification._id) 
                                ? notification.message 
                                : notification.message.slice(0, 100) + (notification.message.length > 100 ? '...' : '')}
                            </p>
                            <div className="flex items-center gap-2 ml-2">
                              {!notification.read && (
                                <button
                                  onClick={() => handleMarkAsRead(notification._id)}
                                  className="p-1.5 text-[#B8860B] hover:bg-gray-100 
                                    dark:hover:bg-gray-600 rounded-full transition-colors"
                                  title="Mark as read"
                                >
                                  <FaCheck className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => toggleNotificationExpand(notification._id)}
                                className="p-1.5 text-gray-500 hover:bg-gray-100 
                                  dark:hover:bg-gray-600 rounded-full transition-colors"
                                title={expandedNotifications.has(notification._id) ? "Collapse" : "Expand"}
                              >
                                {expandedNotifications.has(notification._id) ? <FaChevronUp /> : <FaChevronDown />}
                              </button>
                              <button
                                onClick={() => handleDeleteNotification(notification._id)}
                                className="p-1.5 text-red-500 hover:bg-gray-100 
                                  dark:hover:bg-gray-600 rounded-full transition-colors"
                                title="Delete"
                              >
                                <FaTrash className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {format(new Date(notification.createdAt), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
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
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                ) : null}
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