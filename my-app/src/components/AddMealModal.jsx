import React, { useState, useRef, useEffect } from 'react';

function AddMealModal({ isOpen, onClose, mealType, onSave, existingMeal }) {
  const [mealName, setMealName] = useState(existingMeal?.mealName || '');
  const [additionalDish, setAdditionalDish] = useState(existingMeal?.additionalDish || '');
  const [sideDish, setSideDish] = useState(existingMeal?.sideDish || '');
  const [additionalInfo, setAdditionalInfo] = useState(existingMeal?.additionalInfo || '');
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

  useEffect(() => {
    if (isOpen && existingMeal) {
      setMealName(existingMeal.mealName || '');
      setAdditionalDish(existingMeal.additionalDish || '');
      setSideDish(existingMeal.sideDish || '');
      setAdditionalInfo(existingMeal.additionalInfo || '');
    } else if (!isOpen) {
      setMealName('');
      setAdditionalDish('');
      setSideDish('');
      setAdditionalInfo('');
    }
  }, [isOpen, existingMeal]);

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
        className="bg-[#B8860B] dark:bg-gray-800 p-6 rounded-lg w-full max-w-md mx-4"
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
              className="w-full p-2 rounded-lg border-0 focus:ring-2 focus:ring-white 
                dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          {/* Additional Dish */}
          <div>
            <button 
              onClick={() => setAdditionalDish(additionalDish ? '' : 'New Dish')}
              className="text-white flex items-center gap-2 mb-2 hover:text-gray-200 
                dark:hover:text-gray-300"
            >
              <span className="text-xl">+</span> Additional Dish
            </button>
            {additionalDish && (
              <input
                type="text"
                placeholder="Enter additional dish"
                value={additionalDish}
                onChange={(e) => setAdditionalDish(e.target.value)}
                className="w-full p-2 rounded-lg border-0 focus:ring-2 focus:ring-white 
                  dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
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
              className="w-full p-2 rounded-lg border-0 focus:ring-2 focus:ring-white resize-none h-24 
                dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          {/* Side Dish */}
          <div>
            <button 
              onClick={() => setSideDish(sideDish ? '' : 'New Side Dish')}
              className="text-white flex items-center gap-2 mb-2 hover:text-gray-200 
                dark:hover:text-gray-300"
            >
              <span className="text-xl">+</span> Side Dish
            </button>
            {sideDish && (
              <input
                type="text"
                placeholder="Enter side dish"
                value={sideDish}
                onChange={(e) => setSideDish(e.target.value)}
                className="w-full p-2 rounded-lg border-0 focus:ring-2 focus:ring-white 
                  dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              />
            )}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full bg-white dark:bg-gray-900 text-[#B8860B] font-semibold py-2 
            rounded-lg mt-6 hover:bg-gray-100 dark:hover:bg-gray-800 
            transition-colors duration-200"
        >
          Save
        </button>
      </div>
    </div>
  );
}

export default AddMealModal; 