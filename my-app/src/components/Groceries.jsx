import React, { useState, useEffect, useRef } from 'react';
import BottomBar from './BottomBar';
import Header from './Header';
import { FaTrash } from 'react-icons/fa';
import AddItemModal from './AddItemModal';

function Groceries() {
  const [showModal, setShowModal] = useState(false);
  const [shoppingList, setShoppingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch shopping list
  useEffect(() => {
    const fetchShoppingList = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/shopping-list`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Failed to fetch shopping list');
        
        const data = await response.json();
        setShoppingList(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchShoppingList();
  }, []);

  // Add item to shopping list
  const handleAddItem = async (item) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/shopping-list/item`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(item)
      });

      if (!response.ok) throw new Error('Failed to add item');
      
      const updatedList = await response.json();
      setShoppingList(updatedList);
    } catch (error) {
      setError(error.message);
    }
  };

  // Toggle item completion
  const handleToggleComplete = async (itemId, isCompleted) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/shopping-list/item/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isCompleted })
      });

      if (!response.ok) throw new Error('Failed to update item');
      
      const updatedList = await response.json();
      setShoppingList(updatedList);
    } catch (error) {
      setError(error.message);
    }
  };

  // Add delete functionality
  const handleDeleteItem = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/shopping-list/item/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete item');
      
      const updatedList = await response.json();
      setShoppingList(updatedList);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold dark:text-white">Shopping List</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Create your Shopping List</p>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="text-center dark:text-white">Loading...</div>
        ) : (
          <div className="space-y-4">
            {shoppingList.map((item) => (
              <div 
                key={item._id} 
                className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm ${
                  item.isCompleted ? 'opacity-50' : ''
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-grow">
                    <p className={`font-medium dark:text-white ${
                      item.isCompleted ? 'line-through' : ''
                    }`}>
                      {item.itemName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleDeleteItem(item._id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      aria-label="Delete item"
                    >
                      <FaTrash />
                    </button>
                    <input 
                      type="checkbox" 
                      checked={item.isCompleted}
                      onChange={(e) => handleToggleComplete(item._id, e.target.checked)}
                      className="h-5 w-5 accent-[#B8860B]" 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Button */}
        <button
          onClick={() => setShowModal(true)}
          className="fixed bottom-24 right-4 w-12 h-12 bg-[#B8860B] text-white 
            rounded-full flex items-center justify-center text-2xl shadow-lg
            hover:bg-[#9B7506] transition-colors duration-200
            dark:hover:bg-[#8B6914] dark:shadow-gray-900"
        >
          +
        </button>
      </div>

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleAddItem}
      />
      
      <BottomBar />
    </div>
  );
}

export default Groceries; 