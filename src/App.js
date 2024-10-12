import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import Login from './Login';
import CreateAccount from './CreateAccount';
import BackgroundWrapper from './BackgroundWrapper';

function Welcome() {
  const [user, setUser] = useState(null);
  const userId = localStorage.getItem('userId');

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
    return <div>Loading...</div>;
  }

  const handleLogout = () => {
    localStorage.removeItem('userId');
    window.location.reload();
  };

  return (
    <BackgroundWrapper>
      <header style={{ backgroundColor: 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
        <img src="/Logo_Header.png" alt="Logo" style={{ height: '40px' }} />
        <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', backgroundColor: '#f00', color: '#fff', border: 'none', borderRadius: '5px' }}>Log Out</button>
      </header>
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
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