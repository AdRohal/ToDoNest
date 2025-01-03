import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const fileInputRef = useRef(null);
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Profile - ToDoNest';
    if (!userId) {
      navigate('/login');
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const { full_name, username, email, avatar } = response.data.user;
        setFullName(full_name);
        setUsername(username);
        setEmail(email);
        if (avatar) {
          setAvatarPreview(`data:image/jpeg;base64,${avatar}`);
        }
      } catch (err) {
        console.error('Failed to fetch user profile', err);
        setError('Failed to fetch user profile.');
      }
    };

    fetchUserProfile();
  }, [userId, navigate]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const profileData = {
      full_name: fullName,
      username: username,
      email: email,
    };

    try {
      await axios.put(`http://localhost:5000/api/user/${userId}`, profileData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (avatar) {
        const formData = new FormData();
        formData.append('avatar', avatar);
        await axios.post(`http://localhost:5000/api/user/${userId}/avatar`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      setMessage('Profile updated successfully!');
      setIsEditMode(false);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
    }
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const handleImageClick = () => {
    if (isEditMode) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="bg-[#10082b] rounded shadow-md p-8 w-[1000px] text-white border border-white">
      <h2 className="text-2xl font-bold mb-6 text-center">Profile Management</h2>
      {message && <div className="mb-4 text-green-500">{message}</div>}
      {error && <div className="mb-4 text-red-500">{error}</div>}
      <div className="flex flex-col items-center">
        <div className="mb-4">
          <img
            id="profile-pic"
            src={avatarPreview || 'default-avatar.png'}
            alt="Avatar"
            className="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover mx-auto cursor-pointer"
            onClick={handleImageClick}
          />
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
        <div className="mb-4 w-full">
          <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="fullName">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={!isEditMode}
          />
        </div>
        <div className="mb-4 w-full">
          <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="username">
            Username
          </label>
          <input
            type="text"
            id="username"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={!isEditMode}
          />
        </div>
        <div className="mb-4 w-full">
          <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!isEditMode}
          />
        </div>
        {isEditMode && (
          <div className="mb-4 w-full">
            <label className="hidden" htmlFor="avatar">
              Upload New Avatar
            </label>
            <input
              type="file"
              id="avatar"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <button
              type="button"
              id="avatarUploadBtn"
              className="hidden"
              onClick={() => document.getElementById('avatar').click()}
            >
              Choose Avatar
            </button>
          </div>
        )}
        <div className="flex items-center justify-between w-full">
          <button
            type="button"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={toggleEditMode}
          >
            {isEditMode ? 'Cancel' : 'Edit'}
          </button>
          {isEditMode && (
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={handleProfileSubmit}
            >
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;