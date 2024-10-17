import React, { useEffect, useState } from 'react';
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom';
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
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  useEffect(() => {
    const fetchUser = async () => {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      if (userId && token) {
        try {
          const response = await axios.get(`http://localhost:5000/api/user/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUser(response.data.user);
          if (location.pathname === '/') {
            navigate('/welcome');
          }
        } catch (err) {
          console.error('Failed to fetch user', err);
          handleLogout(); // Clear user state and redirect to login if fetching user fails
        }
      } else {
        handleLogout(); // Clear user state and redirect to login if no userId or token
      }
    };

    fetchUser();
  }, [navigate, location.pathname]);

  return (
    <BackgroundWrapper>
      <Header user={user} handleLogout={handleLogout} />
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/welcome" element={<Welcome user={user} />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/" element={<Login setUser={setUser} />} />
      </Routes>
    </BackgroundWrapper>
  );
}

export default App;