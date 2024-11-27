import React, { useState, useEffect } from 'react';
import BottomBar from './BottomBar';
import Header from './Header';
import { format } from 'date-fns';
import { FaShare, FaCopy, FaEnvelope } from 'react-icons/fa';
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-lg max-h-[80vh] flex flex-col">
            <div className="p-6 border-b dark:border-gray-700">
              <h3 className="text-xl font-semibold text-[#B8860B]">{modalTitle}</h3>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <pre className="whitespace-pre-wrap font-mono text-sm dark:text-white">
                {modalContent}
              </pre>
            </div>
            
            <div className="p-6 border-t dark:border-gray-700 space-y-4">
              {/* Email sharing section */}
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter user's email"
                  className="flex-1 px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 
                    bg-white dark:bg-gray-800 text-gray-800 dark:text-white 
                    focus:border-[#B8860B] dark:focus:border-[#B8860B] outline-none"
                />
                <button
                  onClick={handleShareWithUser}
                  disabled={isLoading || !email.trim()}
                  className={`px-4 py-2 rounded-xl flex items-center gap-2
                    ${isLoading || !email.trim() 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : 'bg-[#B8860B] hover:bg-[#9e7209]'} 
                    text-white transition-colors`}
                >
                  <FaShare />
                  Share
                </button>
              </div>
              
              {shareError && (
                <p className="text-red-500 text-sm">{shareError}</p>
              )}
              {shareSuccess && (
                <p className="text-green-500 text-sm">{shareSuccess}</p>
              )}

              {/* Other sharing options */}
              <div className="flex gap-3">
                <button
                  onClick={handleCopyToClipboard}
                  className="flex-1 px-4 py-2 text-[#B8860B] border-2 border-[#B8860B] rounded-xl 
                    hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2"
                >
                  <FaCopy />
                  Copy Text
                </button>
                <button
                  onClick={handleSendGmail}
                  className="flex-1 px-4 py-2 text-white bg-[#B8860B] rounded-xl 
                    hover:bg-[#9e7209] flex items-center justify-center gap-2"
                >
                  <FaEnvelope />
                  Send via Gmail
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
                >
                  Close
                </button>
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