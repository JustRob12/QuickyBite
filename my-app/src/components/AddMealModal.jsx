import React, { useState, useRef, useEffect } from 'react';

function AddMealModal({ isOpen, onClose, mealType, onSave }) {
  const [mealName, setMealName] = useState('');
  const [additionalDish, setAdditionalDish] = useState('');
  const [sideDish, setSideDish] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
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
    onSave({
      mealName,
      additionalDish,
      sideDish,
      additionalInfo,
      type: mealType
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div 
        ref={modalRef}
        className="bg-[#B8860B] p-6 rounded-lg w-full max-w-md mx-4"
      >
        <h2 className="text-xl font-semibold text-white mb-4">{mealType}</h2>
        
        <div className="space-y-4">
          {/* Main Meal Input */}
          <div>
            <input
              type="text"
              placeholder="Enter the meal here"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              className="w-full p-2 rounded-lg border-0 focus:ring-2 focus:ring-white"
            />
          </div>

          {/* Additional Dish */}
          <div>
            <button 
              onClick={() => setAdditionalDish(additionalDish ? '' : 'New Dish')}
              className="text-white flex items-center gap-2 mb-2"
            >
              <span className="text-xl">+</span> Additional Dish
            </button>
            {additionalDish && (
              <input
                type="text"
                placeholder="Enter additional dish"
                value={additionalDish}
                onChange={(e) => setAdditionalDish(e.target.value)}
                className="w-full p-2 rounded-lg border-0 focus:ring-2 focus:ring-white"
              />
            )}
          </div>

          {/* Additional Information */}
          <div>
            <p className="text-white mb-2">Additional Information</p>
            <textarea
              placeholder="Enter some additional information"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              className="w-full p-2 rounded-lg border-0 focus:ring-2 focus:ring-white resize-none h-24"
            />
          </div>

          {/* Side Dish */}
          <div>
            <button 
              onClick={() => setSideDish(sideDish ? '' : 'New Side Dish')}
              className="text-white flex items-center gap-2 mb-2"
            >
              <span className="text-xl">+</span> Side Dish
            </button>
            {sideDish && (
              <input
                type="text"
                placeholder="Enter side dish"
                value={sideDish}
                onChange={(e) => setSideDish(e.target.value)}
                className="w-full p-2 rounded-lg border-0 focus:ring-2 focus:ring-white"
              />
            )}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full bg-white text-[#B8860B] font-semibold py-2 rounded-lg mt-6"
        >
          Save
        </button>
      </div>
    </div>
  );
}

export default AddMealModal; 