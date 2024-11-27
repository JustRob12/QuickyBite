import React, { useState, useRef, useEffect } from 'react';

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
      <div ref={modalRef} className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Create your Shopping List</h2>
        <div className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-[#B8860B] 
                dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-[#B8860B]
                dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>
          <button
            onClick={handleSave}
            className="w-full bg-[#B8860B] text-white py-2 rounded-lg 
              hover:bg-[#9B7506] transition-colors duration-200
              dark:hover:bg-[#8B6914]"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddItemModal; 