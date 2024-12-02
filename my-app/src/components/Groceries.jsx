import React, { useState, useEffect } from 'react';
import BottomBar from './BottomBar';
import Header from './Header';
import { FaTrash, FaTimes, FaShoppingBasket, FaCheck, FaPlus } from 'react-icons/fa';
import AddItemModal from './AddItemModal';
import burger from '../assets/burger-blur.png';
import pizza from '../assets/pizza-blur.png';
import salad from '../assets/fries-blur.png';

function Groceries() {
  const [showModal, setShowModal] = useState(false);
  const [shoppingList, setShoppingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

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

  const showNotification = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

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
      showNotification('Item added successfully!', 'success');
    } catch (error) {
      showNotification(error.message, 'error');
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

  // Confirm delete modal
  const confirmDelete = (itemId) => {
    setItemToDelete(itemId);
    setShowDeleteConfirm(true);
  };

  // Add delete functionality
  const handleDeleteItem = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/shopping-list/item/${itemToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete item');
      
      const updatedList = await response.json();
      setShoppingList(updatedList);
      showNotification('Item deleted successfully!', 'success');
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 overflow-hidden relative">
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
      
      {/* Alert Notification */}
      {showAlert && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 
          ${alertType === 'success' ? 'bg-green-500' : 'bg-red-500'} 
          text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 
          animate-fade-in-down backdrop-blur-sm bg-opacity-90`}>
          <span className="font-medium">{alertMessage}</span>
          <button 
            onClick={() => setShowAlert(false)}
            className="ml-2 text-white hover:text-gray-200 transition-colors"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm transform transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                <FaTrash className="text-red-500 dark:text-red-400 w-5 h-5" />
              </div>
              <h3 className="text-xl font-semibold dark:text-white">
                Delete Item
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this item from your shopping list?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 
                  dark:hover:bg-gray-700 rounded-xl transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteItem}
                className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 
                  transition-all duration-200 transform hover:scale-105"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <FaShoppingBasket className="text-[#B8860B]" />
              Shopping List
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage your grocery shopping efficiently
            </p>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 
            text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
            <FaTimes className="w-4 h-4" />
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B8860B]"></div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {shoppingList.map((item) => (
              <div 
                key={item._id} 
                className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-grow">
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={item.isCompleted}
                        onChange={(e) => handleToggleComplete(item._id, e.target.checked)}
                        className="h-5 w-5 rounded-md accent-[#B8860B] cursor-pointer" 
                      />
                      <div>
                        <p className={`font-medium text-gray-800 dark:text-white transition-all
                          ${item.isCompleted ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                          {item.itemName}
                        </p>
                        {item.quantity && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            Quantity: {item.quantity}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => confirmDelete(item._id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 
                      dark:hover:bg-red-900/30 rounded-lg transition-all duration-200"
                    aria-label="Delete item"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Button */}
        <button
          onClick={() => setShowModal(true)}
          className="fixed bottom-24 right-4 w-14 h-14 bg-[#B8860B] text-white 
            rounded-full flex items-center justify-center shadow-lg
            hover:bg-[#9B7506] transition-all duration-300 transform hover:scale-110
            dark:hover:bg-[#8B6914] dark:shadow-gray-900 group z-20"
        >
          <FaPlus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
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