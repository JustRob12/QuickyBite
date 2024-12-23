import React, { useState, useEffect } from 'react';
import BottomBar from './BottomBar';
import Header from './Header';
import { FaCalendarAlt, FaCoffee, FaUtensils, FaWineGlass, FaCookie, FaChevronLeft, FaChevronRight, FaTrash, FaTimes } from 'react-icons/fa';
import Calendar from './Calendar';
import { addWeeks, subWeeks, format, startOfWeek, endOfWeek, addDays } from 'date-fns';
import AddMealModal from './AddMealModal';
import { useNavigate } from 'react-router-dom';
import burger from '../assets/burger-blur.png';
import pizza from '../assets/pizza-blur.png';
import salad from '../assets/fries-blur.png';

function FoodCalendar() {
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [displayMonth, setDisplayMonth] = useState('');
  const [showMealModal, setShowMealModal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('');
  const navigate = useNavigate();
  const [meals, setMeals] = useState([]);
  const [error, setError] = useState(null);
  const [editingMeal, setEditingMeal] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [mealToDelete, setMealToDelete] = useState(null);

  // Generate week dates starting from currentWeekStart
  const getWeekDates = (startDate) => {
    const start = startOfWeek(startDate, { weekStartsOn: 0 }); // 0 = Sunday
    const dates = [];
    
    for (let i = 0; i < 7; i++) {
      dates.push(addDays(start, i));
    }
    return dates;
  };

  // Update display month based on current week
  useEffect(() => {
    const start = startOfWeek(currentWeekStart);
    const end = endOfWeek(currentWeekStart);
    const startMonth = format(start, 'MMMM');
    const endMonth = format(end, 'MMMM');
    const year = format(currentWeekStart, 'yyyy');

    if (startMonth === endMonth) {
      setDisplayMonth(`${startMonth} ${year}`);
    } else {
      setDisplayMonth(`${startMonth} - ${endMonth} ${year}`);
    }
  }, [currentWeekStart]);

  const weekDates = getWeekDates(currentWeekStart);

  const handlePrevWeek = () => {
    const newDate = subWeeks(currentWeekStart, 1);
    setCurrentWeekStart(newDate);
    // Update selected date if it's outside the new week range
    if (selectedDate < startOfWeek(newDate) || selectedDate > endOfWeek(newDate)) {
      setSelectedDate(newDate);
    }
  };

  const handleNextWeek = () => {
    const newDate = addWeeks(currentWeekStart, 1);
    setCurrentWeekStart(newDate);
    // Update selected date if it's outside the new week range
    if (selectedDate < startOfWeek(newDate) || selectedDate > endOfWeek(newDate)) {
      setSelectedDate(newDate);
    }
  };

  // Fetch meals for selected date
  const fetchMeals = async (date) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/food/${format(date, 'yyyy-MM-dd')}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch meals');
      }

      const data = await response.json();
      setMeals(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching meals:', error);
      setError(error.message);
      setMeals([]);
    }
  };

  // Fetch meals when date changes
  useEffect(() => {
    fetchMeals(selectedDate);
  }, [selectedDate]);

  // Add notification helper
  const showNotification = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  // Modify handleSaveMeal
  const handleSaveMeal = async (mealData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const method = editingMeal ? 'PUT' : 'POST';
      const url = editingMeal 
        ? `${import.meta.env.VITE_API_URL}/api/food/${editingMeal._id}`
        : `${import.meta.env.VITE_API_URL}/api/food`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...mealData,
          date: format(selectedDate, 'yyyy-MM-dd')
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        throw new Error(`Failed to ${editingMeal ? 'update' : 'save'} meal`);
      }

      await fetchMeals(selectedDate);
      setShowMealModal(false);
      setEditingMeal(null);
      showNotification(`Meal ${editingMeal ? 'updated' : 'added'} successfully!`, 'success');
    } catch (error) {
      console.error('Error saving meal:', error);
      showNotification(error.message, 'error');
    }
  };

  // Modify delete handler
  const confirmDelete = (mealId) => {
    setMealToDelete(mealId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteMeal = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/food/${mealToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        throw new Error('Failed to delete meal');
      }

      await fetchMeals(selectedDate);
      showNotification('Meal deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting meal:', error);
      showNotification(error.message, 'error');
    } finally {
      setShowDeleteConfirm(false);
      setMealToDelete(null);
    }
  };

  // Modify renderMealSection to use confirmDelete
  const renderMealSection = (icon, type) => {
    const mealOfType = Array.isArray(meals) ? meals.find(meal => meal.type === type) : null;

    const handleMealClick = (meal) => {
      setEditingMeal(meal);
      setSelectedMealType(type);
      setShowMealModal(true);
    };

    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            {icon}
            <span className="font-medium text-gray-900 dark:text-white">{type}</span>
          </div>
          {mealOfType ? (
            <button 
              onClick={() => confirmDelete(mealOfType._id)}
              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2"
              title="Delete meal"
            >
              <FaTrash size={16} />
            </button>
          ) : (
            <button 
              onClick={() => {
                setEditingMeal(null);
                setSelectedMealType(type);
                setShowMealModal(true);
              }} 
              className="text-[#B8860B] text-xl hover:text-[#9A7209] dark:text-[#B8860B] dark:hover:text-[#9A7209]"
            >
              +
            </button>
          )}
        </div>
        {mealOfType ? (
          <div 
            className="text-sm cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 p-2 rounded-lg transition-colors"
            onClick={() => handleMealClick(mealOfType)}
          >
            <p className="font-medium text-gray-900 dark:text-white">{mealOfType.mealName}</p>
            {mealOfType.additionalDish && (
              <p className="text-gray-600 dark:text-gray-400">+ {mealOfType.additionalDish}</p>
            )}
            {mealOfType.sideDish && (
              <p className="text-gray-600 dark:text-gray-400">+ {mealOfType.sideDish}</p>
            )}
            {mealOfType.additionalInfo && (
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{mealOfType.additionalInfo}</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-400">Add {type.toLowerCase()}</p>
        )}
      </div>
    );
  };

  // Add function to render dots for week view
  const renderWeekDayDots = (date) => {
    const dayMeals = meals.filter(meal => 
      format(new Date(meal.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );

    // Sort meals by type to ensure consistent dot order
    const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
    const existingMealTypes = mealTypes.filter(type => 
      dayMeals.some(meal => meal.type === type)
    );

    return (
      <div className="flex justify-center gap-0.5 mt-1">
        {existingMealTypes.map((_, index) => (
          <div
            key={index}
            className="w-1 h-1 rounded-full bg-[#B8860B]"
          />
        ))}
      </div>
    );
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
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <BottomBar />
      </div>

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
              Delete Meal
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this meal?
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
                onClick={handleDeleteMeal}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 
                  transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content with adjusted padding */}
      <div className="pt-5 pb-16 px-4 relative z-10">
        {/* Calendar Toggle */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold dark:text-white">
            {displayMonth}
          </h2>
          <button 
            onClick={() => setShowFullCalendar(!showFullCalendar)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <FaCalendarAlt className="text-[#B8860B]" />
          </button>
        </div>

        {/* Week View with Navigation */}
        <div className="relative mb-6">
          <button 
            onClick={handlePrevWeek}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <FaChevronLeft className="text-[#B8860B]" />
          </button>

          <div className="flex justify-between px-8">
            {weekDates.map((date, index) => (
              <div
                key={index}
                className="flex flex-col items-center"
              >
                <button
                  onClick={() => setSelectedDate(date)}
                  className={`flex flex-col items-center w-10 py-2 rounded-xl transition-all
                    ${format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                      ? 'bg-[#B8860B] text-white' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white'}`}
                >
                  <span className="text-xs">
                    {format(date, 'EEE')}
                  </span>
                  <span className="text-sm font-medium mt-1">
                    {format(date, 'd')}
                  </span>
                </button>
                {renderWeekDayDots(date)}
              </div>
            ))}
          </div>

          <button 
            onClick={handleNextWeek}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <FaChevronRight className="text-[#B8860B]" />
          </button>
        </div>

        {/* Meal Sections */}
        <div className="space-y-3">
          {renderMealSection(<FaCoffee className="text-[#B8860B]" />, "Breakfast")}
          {renderMealSection(<FaUtensils className="text-[#B8860B]" />, "Lunch")}
          {renderMealSection(<FaWineGlass className="text-[#B8860B]" />, "Dinner")}
          {renderMealSection(<FaCookie className="text-[#B8860B]" />, "Snack")}
        </div>

        {/* Add Meal Modal */}
        {showMealModal && (
          <AddMealModal
            isOpen={showMealModal}
            onClose={() => {
              setShowMealModal(false);
              setEditingMeal(null);
            }}
            mealType={selectedMealType}
            onSave={handleSaveMeal}
            existingMeal={editingMeal}
          />
        )}

        {/* Full Calendar Modal */}
        {showFullCalendar && (
          <Calendar
            selectedDate={selectedDate}
            onSelectDate={(date) => {
              setSelectedDate(date);
              setShowFullCalendar(false);
            }}
            onClose={() => setShowFullCalendar(false)}
            meals={meals}
          />
        )}
      </div>
    </div>
  );
}

export default FoodCalendar;