import React, { useState, useEffect } from 'react';
import { FaUserPlus, FaUserMinus, FaCheck, FaTimes, FaUserCircle } from 'react-icons/fa';
import Header from './Header';
import BottomBar from './BottomBar';
import axios from 'axios';

function Friends() {
    const [users, setUsers] = useState([]);
    const [friends, setFriends] = useState([]);
    const [friendRequests, setFriendRequests] = useState({ received: [], sent: [] });
    const [activeTab, setActiveTab] = useState('suggestions');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [requestCount, setRequestCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
        fetchFriends();
        fetchFriendRequests();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/auth/users`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUsers(response.data);
        } catch (error) {
            setError('Error fetching users');
            console.error('Error:', error);
        }
    };

    const fetchFriends = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/friends/list`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setFriends(response.data);
        } catch (error) {
            setError('Error fetching friends');
            console.error('Error:', error);
        }
    };

    const fetchFriendRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/friends/requests`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setFriendRequests(response.data);
            setRequestCount(response.data.received.length);
        } catch (error) {
            setError('Error fetching friend requests');
            console.error('Error:', error);
        }
    };

    const sendFriendRequest = async (friendId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/friends/request`,
                { friendId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSuccess('Friend request sent successfully');
            fetchFriendRequests();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            setError('Error sending friend request');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleFriendRequest = async (requestId, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${import.meta.env.VITE_API_URL}/api/friends/request/${requestId}`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSuccess(`Friend request ${status}`);
            fetchFriendRequests();
            fetchFriends();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            setError('Error handling friend request');
            setTimeout(() => setError(''), 3000);
        }
    };

    const removeFriend = async (friendId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `${import.meta.env.VITE_API_URL}/api/friends/remove/${friendId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSuccess('Friend removed successfully');
            fetchFriends();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            setError('Error removing friend');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleAcceptRequest = async (requestId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${import.meta.env.VITE_API_URL}/api/friends/request/${requestId}`,
                { status: 'accepted' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            window.location.reload();
        } catch (error) {
            console.error('Error accepting friend request:', error);
            setError('Error accepting friend request');
        }
    };

    const filterItems = (items) => {
        return items.filter(item => {
            const searchString = searchTerm.toLowerCase();
            const name = (item.friend?.name || item.name || '').toLowerCase();
            const email = (item.friend?.email || item.email || '').toLowerCase();
            return name.includes(searchString) || email.includes(searchString);
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    {/* Search Bar */}
                    <div className="mb-6">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 
                                    dark:border-gray-600 dark:bg-gray-700 dark:text-white
                                    focus:ring-2 focus:ring-[#B8860B] focus:border-transparent"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex justify-between mb-6 border-b dark:border-gray-700">
                        <button
                            onClick={() => setActiveTab('suggestions')}
                            className={`pb-4 px-4 ${
                                activeTab === 'suggestions'
                                    ? 'border-b-2 border-[#B8860B] text-[#B8860B]'
                                    : 'text-gray-500 dark:text-gray-400'
                            }`}
                        >
                            Suggestions
                        </button>
                        <button
                            onClick={() => setActiveTab('requests')}
                            className={`pb-4 px-4 relative ${
                                activeTab === 'requests'
                                    ? 'border-b-2 border-[#B8860B] text-[#B8860B]'
                                    : 'text-gray-500 dark:text-gray-400'
                            }`}
                        >
                            Requests
                            {requestCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs 
                                    rounded-full h-5 w-5 flex items-center justify-center">
                                    {requestCount}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('friends')}
                            className={`pb-4 px-4 ${
                                activeTab === 'friends'
                                    ? 'border-b-2 border-[#B8860B] text-[#B8860B]'
                                    : 'text-gray-500 dark:text-gray-400'
                            }`}
                        >
                            Friends
                        </button>
                    </div>

                    {/* Alerts */}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                            {success}
                        </div>
                    )}

                    {/* Content */}
                    <div className="mt-6">
                        {activeTab === 'suggestions' && (
                            <div className="grid gap-4 md:grid-cols-2">
                                {filterItems(users).map(user => (
                                    <div key={user._id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                                        <div className="flex items-center">
                                            {user.profilePicture ? (
                                                <img
                                                    src={`${import.meta.env.VITE_API_URL}/${user.profilePicture}`}
                                                    alt={user.name}
                                                    className="w-12 h-12 rounded-full object-cover"
                                                />
                                            ) : (
                                                <FaUserCircle className="w-12 h-12 text-gray-400" />
                                            )}
                                            <div className="ml-4">
                                                <h3 className="font-medium dark:text-white">{user.name}</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => sendFriendRequest(user._id)}
                                            className="p-2 text-[#B8860B] hover:bg-[#B8860B] hover:text-white rounded-full transition-colors"
                                        >
                                            <FaUserPlus className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'requests' && (
                            <div>
                                <h2 className="text-lg font-semibold mb-4 dark:text-white">Received Requests</h2>
                                {filterItems(friendRequests.received).map(({ _id, user }) => (
                                    <div key={_id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow mb-4">
                                        <div className="flex items-center">
                                            {user.profilePicture ? (
                                                <img
                                                    src={`${import.meta.env.VITE_API_URL}/${user.profilePicture}`}
                                                    alt={user.name}
                                                    className="w-12 h-12 rounded-full object-cover"
                                                />
                                            ) : (
                                                <FaUserCircle className="w-12 h-12 text-gray-400" />
                                            )}
                                            <div className="ml-4">
                                                <h3 className="font-medium dark:text-white">{user.name}</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleAcceptRequest(_id)}
                                                className="p-2 text-green-500 hover:bg-green-500 hover:text-white rounded-full transition-colors"
                                            >
                                                <FaCheck className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleRejectRequest(_id)}
                                                className="p-2 text-red-500 hover:bg-red-500 hover:text-white rounded-full transition-colors"
                                            >
                                                <FaTimes className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'friends' && (
                            <div className="grid gap-4 md:grid-cols-2">
                                {filterItems(friends).map(({ friendshipId, friend }) => (
                                    <div key={friendshipId} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                                        <div className="flex items-center">
                                            {friend.profilePicture ? (
                                                <img
                                                    src={`${import.meta.env.VITE_API_URL}/${friend.profilePicture}`}
                                                    alt={friend.name}
                                                    className="w-12 h-12 rounded-full object-cover"
                                                />
                                            ) : (
                                                <FaUserCircle className="w-12 h-12 text-gray-400" />
                                            )}
                                            <div className="ml-4">
                                                <h3 className="font-medium dark:text-white">{friend.name}</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{friend.email}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeFriend(friend._id)}
                                            className="p-2 text-red-500 hover:bg-red-500 hover:text-white rounded-full transition-colors"
                                        >
                                            <FaUserMinus className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <BottomBar />
        </div>
    );
}

export default Friends;
