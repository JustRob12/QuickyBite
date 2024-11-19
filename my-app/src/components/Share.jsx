import React, { useState } from 'react';
import BottomBar from './BottomBar';
import Header from './Header';
import { format } from 'date-fns';

function Share() {
  const [isLoading, setIsLoading] = useState(false);

  const handleShareFoodList = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      // Get current month's start and end dates
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
      
      // Format meals data for email
      const mealsByDate = meals.reduce((acc, meal) => {
        const date = format(new Date(meal.date), 'MMM dd, yyyy');
        if (!acc[date]) acc[date] = [];
        acc[date].push(`${meal.type}: ${meal.mealName}${meal.additionalDish ? `, ${meal.additionalDish}` : ''}${meal.sideDish ? `, ${meal.sideDish}` : ''}`);
        return acc;
      }, {});

      const emailBody = Object.entries(mealsByDate)
        .map(([date, meals]) => `${date}\n${meals.join('\n')}`)
        .join('\n\n');

      // Open Gmail compose window
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&body=${encodeURIComponent(emailBody)}&su=${encodeURIComponent('My Food Calendar')}`;
      window.open(gmailUrl, '_blank');

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
      
      // Group items by completion status
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

      // Format shopping list for email
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

      // Open Gmail compose window
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&body=${encodeURIComponent(emailBody)}&su=${encodeURIComponent('My Shopping List')}`;
      window.open(gmailUrl, '_blank');

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
      <BottomBar />
    </div>
  );
}

export default Share; 