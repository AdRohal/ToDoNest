import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import Login from './Login';
import CreateAccount from './CreateAccount';
import BackgroundWrapper from './BackgroundWrapper';

function Welcome() {
  const [user, setUser] = useState(null);
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/user/${userId}`);
        setUser(response.data.user);
      } catch (err) {
        console.error('Failed to fetch user', err);
      }
    };

    if (userId) {
      fetchUser();
    } else {
      console.error('No userId found in localStorage');
    }
  }, [userId]);

  if (!user) {
    return (
      <BackgroundWrapper>
        <div className="flex flex-col items-center justify-center h-screen text-white text-center">
          <h2 className="text-2xl font-bold mb-6">Please login first to access this page!!</h2>
          <button onClick={() => navigate('/login')} className="px-4 py-2 bg-blue-500 text-white rounded">Go to Login</button>
        </div>
      </BackgroundWrapper>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem('userId');
    navigate('/login');
  };

  return (
    <BackgroundWrapper>
      <header className="bg-transparent flex justify-between items-center p-4">
        <img src="/Logo_Header.png" alt="Logo" className="h-10" />
        <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded">Log Out</button>
      </header>
      <div className="bg-[#10082b] p-8 rounded shadow-md w-full max-w-md mx-auto text-white">
        <h2 className="text-2xl font-bold mb-6 text-center">Welcome to ToDoNest, {user.full_name}</h2>
      </div>
    </BackgroundWrapper>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;