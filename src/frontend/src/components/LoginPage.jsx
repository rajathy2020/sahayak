import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../page_styles/login.css';
import Toast from './Toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // Check if user was logged out
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('status') === 'logged_out') {
      setToast({
        message: 'You have been logged out from Sahayak',
        type: 'success'
      });
    }

    // Check if user is already logged in
    const authToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('Authorization='));
    
    if (authToken) {
      navigate('/');
    }
  }, [navigate, location]);

  const handleLogin = () => {
    const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8090';
    window.location.href = `${baseURL}/auth0/login`;
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <img src="/logo.png" alt="Sahayak Logo" className="login-logo" />
        <h1>Welcome to Sahayak</h1>
        <p>Your trusted platform for home services</p>
        <button className="login-button" onClick={handleLogin}>
          <i className="fas fa-sign-in-alt"></i>
          Login to Continue
        </button>
      </div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default LoginPage; 