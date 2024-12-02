import React, { useState, useEffect } from 'react';
import BottomBar from './BottomBar';
import Header from './Header';
import { format } from 'date-fns';
import { FaShare, FaCopy, FaEnvelope, FaTimes, FaCheck } from 'react-icons/fa';
import axios from 'axios';
import burger from '../assets/burger-blur.png';
import pizza from '../assets/pizza-blur.png';
import salad from '../assets/fries-blur.png';

function Share() {
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [email, setEmail] = useState('');
  const [shareError, setShareError] = useState('');
  const [shareSuccess, setShareSuccess] = useState('');
  const [shareType, setShareType] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/user`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserName(response.data.name);
      } catch (error) {
        console.error('Error fetching user name:', error);
      }
    };
    fetchUserName();
  }, []);

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(modalContent);
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleSendGmail = () => {
    const subject = encodeURIComponent(`QuickyBite - ${modalTitle}`);
    const body = encodeURIComponent(modalContent);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleShareFoodList = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/food/range?start=${format(startDate, 'yyyy-MM-dd')}&end=${format(endDate, 'yyyy-MM-dd')}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const mealsByDate = response.data.reduce((acc, meal) => {
        const date = format(new Date(meal.date), 'MMMM d, yyyy');
        if (!acc[date]) acc[date] = [];
        acc[date].push(`- ${meal.type}: ${meal.mealName}${meal.additionalDish ? `, ${meal.additionalDish}` : ''}${meal.sideDish ? `, ${meal.sideDish}` : ''}`);
        return acc;
      }, {});

      let formattedContent = `Food Calendar shared by ${userName}\n`;
      formattedContent += `${format(new Date(), 'MMMM d, yyyy h:mm a')}\n\n`;

      const datesContent = Object.entries(mealsByDate)
        .map(([date, meals]) => `${date}:\n${meals.join('\n')}`)
        .join('\n\n');

      formattedContent += datesContent || 'No meals found for this month';

      setModalTitle('Food Calendar');
      setModalContent(formattedContent);
      setShareType('food');
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching food calendar:', error);
    }
  };

  const handleShareShoppingList = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/shopping-list`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const { completed, pending } = response.data.reduce(
        (acc, item) => {
          if (item.isCompleted) {
            acc.completed.push(item);
          } else {
            acc.pending.push(item);
          }
          return acc;
        },
        { completed: [], pending: [] }
      );

      let formattedContent = `Shopping List shared by ${userName}\n`;
      formattedContent += `${format(new Date(), 'MMMM d, yyyy h:mm a')}\n\n`;
      
      if (pending.length > 0) {
        formattedContent += 'Pending Items:\n';
        formattedContent += pending
          .map(item => `- ${item.itemName}${item.quantity ? ` (${item.quantity})` : ''}`)
          .join('\n');
      }

      if (completed.length > 0) {
        formattedContent += '\n\nCompleted Items:\n';
        formattedContent += completed
          .map(item => `✓ ${item.itemName}${item.quantity ? ` (${item.quantity})` : ''}`)
          .join('\n');
      }

      if (pending.length === 0 && completed.length === 0) {
        formattedContent += 'No items in shopping list';
      }

      setModalTitle('Shopping List');
      setModalContent(formattedContent);
      setShareType('shopping');
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching shopping list:', error);
    }
  };

  const handleShareWithUser = async () => {
    try {
      setShareError('');
      setShareSuccess('');
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      let message = '';
      if (shareType === 'food') {
        message = `Food Calendar:\n${modalContent}`;
      } else if (shareType === 'shopping') {
        message = `Shopping List:\n${modalContent}`;
      }

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/notifications/share`,
        { email, message },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setEmail('');
      setShareSuccess('List shared successfully!');
      setTimeout(() => setShareSuccess(''), 3000);
    } catch (error) {
      setShareError(error.response?.data?.message || 'Error sharing list');
      setTimeout(() => setShareError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-900 overflow-hidden relative">
      {/* Floating Food Background Objects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* First Row */}
        <div className="absolute top-[20%] right-[15%] w-32 h-32 opacity-10 dark:opacity-5 animate-float-slow">
          <img src={burger} alt="" className="w-full h-full object-contain blur-sm" />
        </div>
        <div className="absolute top-[15%] left-[10%] w-28 h-28 opacity-10 dark:opacity-5 animate-float-medium">
          <img src={burger} alt="" className="w-full h-full object-contain blur-sm rotate-12" />
        </div>

        {/* Middle Row */}
        <div className="absolute top-[40%] left-[10%] w-40 h-40 opacity-10 dark:opacity-5 animate-float-medium">
          <img src={pizza} alt="" className="w-full h-full object-contain blur-sm" />
        </div>
        <div className="absolute top-[50%] right-[20%] w-36 h-36 opacity-10 dark:opacity-5 animate-float-slow">
          <img src={pizza} alt="" className="w-full h-full object-contain blur-sm -rotate-45" />
        </div>

        {/* Bottom Row */}
        <div className="absolute bottom-[25%] right-[20%] w-36 h-36 opacity-10 dark:opacity-5 animate-float-fast">
          <img src={salad} alt="" className="w-full h-full object-contain blur-sm" />
        </div>
        <div className="absolute bottom-[15%] left-[25%] w-32 h-32 opacity-10 dark:opacity-5 animate-float-medium">
          <img src={salad} alt="" className="w-full h-full object-contain blur-sm rotate-45" />
        </div>
      </div>

      <Header />
      <div className="max-w-4xl mx-auto p-4 space-y-6 relative z-10">
        {/* Share Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Food Calendar Share Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-r from-[#B8860B]/10 to-[#B8860B]/5 group-hover:opacity-75 transition-opacity" />
            <div className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Food Calendar</h3>
                <FaShare className="text-[#B8860B] text-xl" />
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">Share your meal planning schedule with friends and family</p>
              <button
                onClick={handleShareFoodList}
                disabled={isLoading}
                className="w-full bg-transparent border-2 border-[#B8860B] text-[#B8860B] hover:bg-[#B8860B] 
                  hover:text-white dark:text-[#B8860B] dark:hover:text-white py-3 px-6 rounded-xl
                  transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50
                  disabled:cursor-not-allowed font-medium text-lg flex items-center justify-center gap-2"
              >
                <FaShare className="text-lg" />
                Share Calendar
              </button>
            </div>
          </div>

          {/* Shopping List Share Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-r from-[#B8860B]/10 to-[#B8860B]/5 group-hover:opacity-75 transition-opacity" />
            <div className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Shopping List</h3>
                <FaShare className="text-[#B8860B] text-xl" />
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">Share your shopping list with others</p>
              <button
                onClick={handleShareShoppingList}
                disabled={isLoading}
                className="w-full bg-transparent border-2 border-[#B8860B] text-[#B8860B] hover:bg-[#B8860B] 
                  hover:text-white dark:text-[#B8860B] dark:hover:text-white py-3 px-6 rounded-xl
                  transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50
                  disabled:cursor-not-allowed font-medium text-lg flex items-center justify-center gap-2"
              >
                <FaShare className="text-lg" />
                Share List
              </button>
            </div>
          </div>
        </div>

        {/* Share Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl transform transition-all">
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {modalTitle}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none p-2 hover:bg-gray-100 
                      dark:hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <FaTimes className="h-5 w-5" />
                  </button>
                </div>

                {/* Content Preview */}
                <div className="mb-6">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 max-h-60 overflow-y-auto 
                    whitespace-pre-wrap text-sm text-gray-900 dark:text-white custom-scrollbar">
                    {modalContent}
                  </div>
                </div>

                {/* Share Options */}
                <div className="space-y-4">
                  {/* Email Input */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Share with (email)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter email address"
                        className="flex-1 rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-2.5
                          focus:ring-2 focus:ring-[#B8860B] focus:border-transparent
                          dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      />
                      <button
                        onClick={handleShareWithUser}
                        disabled={!email || isLoading}
                        className="w-full sm:w-auto px-6 py-2.5 text-white bg-[#B8860B] rounded-xl 
                          hover:bg-[#9A7209] focus:outline-none focus:ring-2 focus:ring-offset-2 
                          focus:ring-[#B8860B] disabled:opacity-50 disabled:cursor-not-allowed
                          transition-all duration-300 font-medium"
                      >
                        {isLoading ? 'Sending...' : 'Send'}
                      </button>
                    </div>
                    {shareError && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <FaTimes className="h-4 w-4" />
                        {shareError}
                      </p>
                    )}
                    {shareSuccess && (
                      <p className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                        <FaCheck className="h-4 w-4" />
                        {shareSuccess}
                      </p>
                    )}
                  </div>

                  {/* Quick Share Options */}
                  <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                    <button
                      onClick={handleCopyToClipboard}
                      className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 
                        bg-gray-100 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 
                        focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 
                        dark:hover:bg-gray-600 transition-all duration-300 gap-2"
                    >
                      <FaCopy className="h-4 w-4" />
                      Copy to clipboard
                    </button>
                    
                    <button
                      onClick={handleSendGmail}
                      className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 
                        bg-gray-100 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 
                        focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 
                        dark:hover:bg-gray-600 transition-all duration-300 gap-2"
                    >
                      <FaEnvelope className="h-4 w-4" />
                      Send via Email
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <BottomBar />
    </div>
  );
}

export default Share;