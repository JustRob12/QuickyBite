import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import burger from '../assets/fries-blur.png';
import pizza from '../assets/pizza-blur.png';
import salad from '../assets/burger-blur.png';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    pronouns: 'he/him'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        pronouns: formData.pronouns
      });

      setSuccess('Registration successful! Redirecting to login...');

      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-white dark:bg-gray-900 overflow-hidden relative">
      {/* Floating Food Background Objects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* First Row */}
        <div className="absolute top-[20%] right-[15%] w-32 h-32 opacity-20 dark:opacity-10 animate-float-slow">
          <img src={burger} alt="" className="w-full h-full object-contain blur-sm" />
        </div>
        <div className="absolute top-[15%] left-[10%] w-28 h-28 opacity-15 dark:opacity-10 animate-float-medium">
          <img src={burger} alt="" className="w-full h-full object-contain blur-sm rotate-12" />
        </div>

        {/* Middle Row */}
        <div className="absolute top-[40%] left-[10%] w-40 h-40 opacity-20 dark:opacity-10 animate-float-medium">
          <img src={pizza} alt="" className="w-full h-full object-contain blur-sm" />
        </div>
        <div className="absolute top-[50%] right-[20%] w-36 h-36 opacity-15 dark:opacity-10 animate-float-slow">
          <img src={pizza} alt="" className="w-full h-full object-contain blur-sm -rotate-45" />
        </div>

        {/* Bottom Row */}
        <div className="absolute bottom-[25%] right-[20%] w-36 h-36 opacity-20 dark:opacity-10 animate-float-fast">
          <img src={salad} alt="" className="w-full h-full object-contain blur-sm" />
        </div>
        <div className="absolute bottom-[15%] left-[25%] w-32 h-32 opacity-15 dark:opacity-10 animate-float-medium">
          <img src={salad} alt="" className="w-full h-full object-contain blur-sm rotate-45" />
        </div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 flex flex-col items-center">
            <div className="w-12 h-12 mb-4 border-4 border-gray-200 border-t-[#B8860B] rounded-full animate-spin dark:border-gray-700 dark:border-t-[#B8860B]"></div>
            <p className="text-gray-700 dark:text-gray-300 animate-pulse">Creating your account...</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-md animate-fade-in relative z-10">
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="text-6xl font-bold">
            <span className="text-[#B8860B]">Quick</span>
            <span className="text-black dark:text-white">Bites</span>
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Because good things come to those who plan – morning, noon, and night.
          </p>
        </div>

        <div className="mb-6 animate-fade-in-up delay-150">
          <h2 className="text-2xl font-bold mb-2 dark:text-white">Register</h2>
          <p className="text-gray-600 dark:text-gray-400">Create your account to get started.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded animate-fade-in">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-100 rounded animate-fade-in">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in-up delay-300">
          <div>
            <label className="block text-sm mb-2 dark:text-gray-300">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md 
                dark:bg-gray-800 dark:border-gray-700 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-[#B8860B]"
            />
          </div>

          <div>
            <label className="block text-sm mb-2 dark:text-gray-300">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md 
                dark:bg-gray-800 dark:border-gray-700 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-[#B8860B]"
            />
          </div>

          <div>
            <label className="block text-sm mb-2 dark:text-gray-300">Pronouns</label>
            <select
              name="pronouns"
              value={formData.pronouns}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md 
                dark:bg-gray-800 dark:border-gray-700 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-[#B8860B]"
            >
              <option value="he/him">he/him</option>
              <option value="she/her">she/her</option>
              <option value="they/them">they/them</option>
              <option value="other">other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-2 dark:text-gray-300">Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Optional"
              className="w-full px-3 py-2 border border-gray-300 rounded-md 
                dark:bg-gray-800 dark:border-gray-700 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-[#B8860B]"
            />
          </div>

          <div>
            <label className="block text-sm mb-2 dark:text-gray-300">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md 
                dark:bg-gray-800 dark:border-gray-700 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-[#B8860B]"
            />
          </div>

          <div>
            <label className="block text-sm mb-2 dark:text-gray-300">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md 
                dark:bg-gray-800 dark:border-gray-700 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-[#B8860B]"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#B8860B] text-white py-2 rounded-md 
              hover:bg-[#9B7506] transition-colors duration-200
              disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-[#B8860B] hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
