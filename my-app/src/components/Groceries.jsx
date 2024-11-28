import React, { useState, useEffect } from 'react';
import BottomBar from './BottomBar';
import Header from './Header';
import { FaTrash, FaTimes } from 'react-icons/fa';
import AddItemModal from './AddItemModal';

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      {/* Alert Notification */}
      {showAlert && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 
          ${alertType === 'success' ? 'bg-green-500' : 'bg-red-500'} 
          text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 
          animate-fade-in-down`}>
          <span>{alertMessage}</span>
          <button 
            onClick={() => setShowAlert(false)}
            className="ml-2 text-white hover:text-gray-200"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">
              Delete Item
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this item?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 
                  dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteItem}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 
                  transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => confirmDelete(item._id)}
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