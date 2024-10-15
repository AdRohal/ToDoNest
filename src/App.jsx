import React, { useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './styles/App.css';
import Login from './components/Login';
import Header from './components/Header';
import CreateAccount from './components/CreateAccount';
import BackgroundWrapper from './components/BackgroundWrapper';
import Welcome from './components/Welcome';
import Profile from './components/Profile'; // Import Profile component

function App() {
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

  const setView = (view) => {
    navigate(`/${view}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <BackgroundWrapper>
      <Header user={user} setView={setView} handleLogout={handleLogout} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/welcome" element={<Welcome user={user} />} />
        <Route path="/profile" element={<Profile />} /> {/* Add Profile route */}
        <Route path="/" element={<Login />} />
      </Routes>
    </BackgroundWrapper>
  );
}

export default App;