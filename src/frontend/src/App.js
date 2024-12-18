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
import HomeServices from './home_services';
import DocumentAnalyzer from './DocumentAnalyzer';
import Sahayak from './all_services';


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
      console.log("REACT_APP_API_URL", process.env.REACT_APP_API_URL);
      if (!valid) {
        const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8090';
        window.location.href = `${baseURL}/auth0/login`;
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
      if (!response.city && !response.whatsapp_number) {
        setShowModal(true);
      }
      return response;
    } catch (error) {
      setError('Failed to get user');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    getUser();
  }, []);


  const handleSavePreferences = async (preferences) => {
    console.log('User Preferences:', preferences);
    const params = {
      "id": user.id,
      "city": preferences.city,
      "mobile_number": preferences.mobileNumber,
      "user_type": preferences.userType
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
            <Route
              path="/services"
              element={
                <ProtectedRoute>
                  <HomeServices />
                </ProtectedRoute>
              }
            />
            <Route
              path="/document-analysis"
              element={
                <ProtectedRoute>
                  <DocumentAnalyzer />
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