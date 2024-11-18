import React, { useState, useEffect, useRef } from 'react';
import BottomBar from './BottomBar';
import Header from './Header';
import { FaTrash } from 'react-icons/fa';

function AddItemModal({ isOpen, onClose, onSave }) {
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const modalRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSave = () => {
    if (itemName.trim() && quantity.trim()) {
      onSave({ itemName, quantity });
      setItemName('');
      setQuantity('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white p-6 rounded-lg w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4">Create your Shopping List</h2>
        <div className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8860B]"
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8860B]"
            />
          </div>
          <button
            onClick={handleSave}
            className="w-full bg-[#B8860B] text-white py-2 rounded-lg hover:bg-[#9B7506]"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

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
    <div className="pb-20">
      <Header />
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">Shopping List</h1>
          <p className="text-sm text-gray-500">Create your Shopping List</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <div className="space-y-4">
            {shoppingList.map((item) => (
              <div 
                key={item._id} 
                className={`bg-white p-4 rounded-lg shadow ${
                  item.isCompleted ? 'opacity-50' : ''
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-grow">
                    <p className={`font-medium ${
                      item.isCompleted ? 'line-through' : ''
                    }`}>
                      {item.itemName}
                    </p>
                    <p className="text-sm text-gray-600">{item.quantity}</p>
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
          className="fixed bottom-24 right-4 w-12 h-12 bg-[#B8860B] text-white rounded-full flex items-center justify-center text-2xl shadow-lg"
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