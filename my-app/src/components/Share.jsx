import React, { useState } from 'react';
import BottomBar from './BottomBar';
import Header from './Header';
import { format } from 'date-fns';

function Share() {
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(modalContent);
      alert('Copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy to clipboard');
    }
  };

  const handleSendGmail = () => {
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&body=${encodeURIComponent(modalContent)}&su=${encodeURIComponent(modalTitle)}`;
    window.open(gmailUrl, '_blank');
  };

  const handleShareFoodList = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/food/range?start=${format(startDate, 'yyyy-MM-dd')}&end=${format(endDate, 'yyyy-MM-dd')}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch meals');
      const meals = await response.json();
      
      const mealsByDate = meals.reduce((acc, meal) => {
        const date = format(new Date(meal.date), 'MMM dd, yyyy');
        if (!acc[date]) acc[date] = [];
        acc[date].push(`${meal.type}: ${meal.mealName}${meal.additionalDish ? `, ${meal.additionalDish}` : ''}${meal.sideDish ? `, ${meal.sideDish}` : ''}`);
        return acc;
      }, {});

      const emailBody = Object.entries(mealsByDate)
        .map(([date, meals]) => `${date}\n${meals.join('\n')}`)
        .join('\n\n');

      setModalContent(emailBody);
      setModalTitle('My Food Calendar');
      setShowModal(true);

    } catch (error) {
      console.error('Error sharing food list:', error);
      alert('Failed to share food list');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareShoppingList = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/shopping-list`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch shopping list');
      const items = await response.json();
      
      const { completed, pending } = items.reduce(
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

      let emailBody = 'Shopping List\n\n';
      
      if (pending.length > 0) {
        emailBody += 'Pending Items:\n';
        emailBody += pending
          .map(item => `• ${item.itemName}${item.quantity ? ` (${item.quantity})` : ''}`)
          .join('\n');
      }

      if (completed.length > 0) {
        emailBody += '\n\nCompleted Items:\n';
        emailBody += completed
          .map(item => `✓ ${item.itemName}${item.quantity ? ` (${item.quantity})` : ''}`)
          .join('\n');
      }

      if (items.length === 0) {
        emailBody += 'No items in shopping list';
      }

      setModalContent(emailBody);
      setModalTitle('My Shopping List');
      setShowModal(true);

    } catch (error) {
      console.error('Error sharing shopping list:', error);
      alert('Failed to share shopping list');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8DC]">
      <Header />
      <div className="p-4 flex flex-col gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <button
            onClick={handleShareFoodList}
            disabled={isLoading}
            className="w-full py-3 text-center text-lg font-medium text-[#B8860B] bg-white rounded-xl border-2 border-[#B8860B] hover:bg-[#B8860B] hover:text-white transition-colors"
          >
            Share your Food List
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <button
            onClick={handleShareShoppingList}
            disabled={isLoading}
            className="w-full py-3 text-center text-lg font-medium text-[#B8860B] bg-white rounded-xl border-2 border-[#B8860B] hover:bg-[#B8860B] hover:text-white transition-colors"
          >
            Share your Shopping List
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-lg max-h-[80vh] flex flex-col">
            <div className="p-6 border-b">
              <h3 className="text-xl font-semibold text-[#B8860B]">{modalTitle}</h3>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <pre className="whitespace-pre-wrap font-mono text-sm">
                {modalContent}
              </pre>
            </div>
            
            <div className="p-6 border-t flex gap-3">
              <button
                onClick={handleCopyToClipboard}
                className="flex-1 px-4 py-2 text-[#B8860B] border-2 border-[#B8860B] rounded-xl hover:bg-gray-50"
              >
                Copy Text
              </button>
              <button
                onClick={handleSendGmail}
                className="flex-1 px-4 py-2 text-white bg-[#B8860B] rounded-xl hover:bg-[#9e7209]"
              >
                Send via Gmail
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomBar />
    </div>
  );
}

export default Share; 