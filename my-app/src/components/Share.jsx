import React, { useState, useEffect } from 'react';
import BottomBar from './BottomBar';
import Header from './Header';
import { format } from 'date-fns';
import { FaShare, FaCopy, FaEnvelope, FaTimes } from 'react-icons/fa';
import axios from 'axios';

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="p-4 flex flex-col gap-4">
        <div className="bg-gray-800/10 dark:bg-gray-800 p-6 rounded-2xl shadow-sm">
          <button
            onClick={handleShareFoodList}
            disabled={isLoading}
            className="w-full py-3 text-center text-lg font-medium text-[#B8860B] 
              bg-transparent rounded-xl border-2 border-[#B8860B] 
              hover:bg-[#B8860B] hover:text-white transition-colors
              dark:text-[#B8860B] dark:hover:text-white"
          >
            Share your Food Calendar
          </button>
        </div>

        <div className="bg-gray-800/10 dark:bg-gray-800 p-6 rounded-2xl shadow-sm">
          <button
            onClick={handleShareShoppingList}
            disabled={isLoading}
            className="w-full py-3 text-center text-lg font-medium text-[#B8860B] 
              bg-transparent rounded-xl border-2 border-[#B8860B] 
              hover:bg-[#B8860B] hover:text-white transition-colors
              dark:text-[#B8860B] dark:hover:text-white"
          >
            Share your Shopping List
          </button>
        </div>
      </div>

      {/* Share Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-auto">
            <div className="p-4 sm:p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  {modalTitle}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>

              {/* Content Preview */}
              <div className="mb-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 max-h-60 overflow-y-auto whitespace-pre-wrap text-sm">
                  {modalContent}
                </div>
              </div>

              {/* Share Options */}
              <div className="space-y-4">
                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Share with (email)
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email address"
                      className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm 
                               focus:ring-2 focus:ring-[#B8860B] focus:border-transparent
                               dark:bg-gray-700 dark:text-white"
                    />
                    <button
                      onClick={handleShareWithUser}
                      disabled={!email}
                      className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-[#B8860B] 
                               rounded-lg hover:bg-[#9A7209] focus:outline-none focus:ring-2 
                               focus:ring-offset-2 focus:ring-[#B8860B] disabled:opacity-50
                               disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      Send
                    </button>
                  </div>
                  {shareError && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {shareError}
                    </p>
                  )}
                  {shareSuccess && (
                    <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                      {shareSuccess}
                    </p>
                  )}
                </div>

                {/* Quick Share Options */}
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <button
                    onClick={handleCopyToClipboard}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 
                             bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 
                             focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 
                             dark:hover:bg-gray-600 transition-colors duration-200"
                  >
                    <FaCopy className="mr-2 h-4 w-4" />
                    Copy to clipboard
                  </button>
                  
                  <button
                    onClick={handleSendGmail}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 
                             bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 
                             focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 
                             dark:hover:bg-gray-600 transition-colors duration-200"
                  >
                    <FaEnvelope className="mr-2 h-4 w-4" />
                    Send via Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomBar />
    </div>
  );
}

export default Share;