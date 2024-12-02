import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaShoppingBasket, FaPlus } from 'react-icons/fa';

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef} 
        className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md mx-4 transform transition-all shadow-xl"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#B8860B]/10 rounded-xl">
                <FaShoppingBasket className="text-[#B8860B] w-6 h-6" />
              </div>
              <h2 className="text-xl font-semibold dark:text-white">Add Item</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-500 dark:text-gray-500 
                dark:hover:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 
                transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Add a new item to your shopping list
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="itemName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Item Name
              </label>
              <input
                id="itemName"
                type="text"
                placeholder="Enter item name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                  focus:outline-none focus:ring-2 focus:ring-[#B8860B] focus:border-transparent
                  dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                  transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quantity
              </label>
              <input
                id="quantity"
                type="text"
                placeholder="Enter quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                  focus:outline-none focus:ring-2 focus:ring-[#B8860B] focus:border-transparent
                  dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                  transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-700">
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 
                hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!itemName.trim() || !quantity.trim()}
              className="px-6 py-2.5 bg-[#B8860B] text-white rounded-xl hover:bg-[#9A7209] 
                transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                transform hover:scale-105 flex items-center gap-2"
            >
              <FaPlus className="w-4 h-4" />
              Add Item
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddItemModal; 