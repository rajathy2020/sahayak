import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import HeroSection from './home_page';
import ServiceProviderPage from './serviceProvider';
import TaskForm from './taskForm';
import CheckoutPage from './checkout';
import ProfilePage from './profile';
import Header from './header';
import { useState, useEffect } from 'react';
import { UserProvider } from './userContext'; // Adjust the import path
import { fetchUserInfo, updateUserInfo } from './api';
import UserPreferencesModal from './userPreferenceModal';


// utils/auth.js
const checkAuthorizationCookie = async () => {
  const authToken = document.cookie
    .split('; ')
    .find((row) => row.startsWith('Authorization='))
    ?.split('=')[1];


  if (!authToken) {
    return false;
  }
  return true;

};


function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const authenticate = async () => {
      const valid = await checkAuthorizationCookie();
      if (!valid) {
        window.location.href = 'http://0.0.0.0:8090/auth0/login'; // Redirect to login if unauthorized
      } else {
        setIsAuthenticated(true);
      }
    };

    authenticate();
  }, []);

  // Show a loading screen until we know if authenticated
  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  // If authenticated, render the children (the protected content)
  return children;
}

const headers = {
  home: {
    title: "SAHAYAK",
    buttons: [
      { label: 'About', path: '/#about' },
      { label: 'Services', path: '/#services' },
      { label: 'Contact', path: '/#contact' },
      { label: 'Me', path: '/me' }
    ]
  },
  service_providers: {
    title: "",
    buttons: []
  },
  other: {
    title: "Pay to Sahayak",
    buttons: [
      { label: 'Home', path: '/' },
      { label: 'Contact Us', path: '/contact' },
      { label: 'Support', path: '/support' }
    ]
  }
};




function App() {
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(null);

  const getUser = async () => {
    try {
      const response = await fetchUserInfo();
      setUser(response);
      return response;
    } catch (error) {
      setError('Failed to get user');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const response1 = getUser();
    console.log(response1, "vgetrgr")

    if (!response1.city) {
      setShowModal(true);
    }
  }, []);

  const handleSavePreferences = async (preferences) => {
    console.log('User Preferences:', preferences);
    const params = {
      "id": user.id,
      "city": preferences.city,
      "whatsapp_number": preferences.mobileNumber
    }
    const userInfo = await updateUserInfo(params);
    setUser(userInfo);
  };

  return (
    <Router>
      <UserProvider>
        <div className="App">
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <>
                  <Header title={headers.home.title} links={headers.home.buttons} />
                    <HeroSection />
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/service/:id"
              element={
                <ProtectedRoute>
                  <>
                    <Header title={headers.home.title} links={headers.home.buttons} />
                    <TaskForm />
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/service_providers"
              element={
                <ProtectedRoute>
                  <>
                    <Header title={headers.home.title} links={headers.home.buttons} />
                    <ServiceProviderPage />
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/me"
              element={
                <ProtectedRoute>
                  <>
                    <Header title={headers.home.title} links={headers.home.buttons} />
                    <ProfilePage />
                  </>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
        <UserPreferencesModal
          show={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSavePreferences}
        />
      </UserProvider>
    </Router>
  );
}

export default App;