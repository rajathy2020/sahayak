import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate, useLocation } from 'react-router-dom';
import HeroSection from './home_page';
import ServiceProviderPage from './serviceProvider';
import TaskForm from './taskForm';
import CheckoutPage from './checkout';
import ProfilePage from './profile';
import Header from './header';
import { useState, useEffect } from 'react';
import { UserProvider } from './userContext'; // Adjust the import path
import { fetchUserInfo, updateUserInfo, fetchParentServices, logout, checkProviderPaymentInfo } from './api';
import UserPreferencesModal from './userPreferenceModal';
import HomeServices from './home_services';
import DocumentAnalyzer from './DocumentAnalyzer';
import Sahayak from './all_services';
import ServiceProviderOnboardingModal from './components/ServiceProviderOnboardingModal';
import Toast from './components/Toast';
import ProviderDashboard from './components/ProviderDashboard';
import LoginPage from './components/LoginPage';


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
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const authenticate = async () => {
      if (location.pathname === '/login') {
        setIsAuthenticated(false);
        return;
      }

      const valid = await checkAuthorizationCookie();
      if (!valid && location.pathname !== '/login') {
        navigate('/login', { replace: true });
      } else {
        setIsAuthenticated(true);
      }
    };

    authenticate();
  }, [location, navigate]);

  if (location.pathname === '/login') {
    return children;
  }

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // Let the useEffect handle the navigation
  }

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




function AppContent() {
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const navigate = useNavigate();
  const [parentServices, setParentServices] = useState([]);
  const [toast, setToast] = useState(null);

  const handleLogout = async () => {
    try {
      setPageLoading(true);
      await logout();
    } catch (error) {
      console.error('Error during logout:', error);
      window.location.replace('/login?status=logged_out');
    }
  };

  const getUser = async () => {
    try {
      const response = await fetchUserInfo();
      setUser(response);
      setPageLoading(false);
      
      if (!response.city) {
        setShowOnboardingModal(true);
        return;
      }
      
      if (response.user_type === 'SERVICE_PROVIDER' && !response.stripe_account_id) {
        await getParentServices();
        setShowProviderModal(true);
        return;
      }
      
      if (response.user_type === 'SERVICE_PROVIDER' && response.stripe_account_id) {
        const payment_info = await checkProviderPaymentInfo(response.stripe_account_id);
        if (payment_info) {
          navigate('/dashboard');
        } else {
          setShowProviderModal(true);
        }
      }
    } catch (error) {
      setError('Failed to get user');
    } finally {
      setLoading(false);
    }
  };

  const getParentServices = async () => {
    try {
      const services = await fetchParentServices();
      setParentServices(services);
    } catch (error) {
      console.error('Failed to fetch parent services:', error);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      await getUser();
    };

    initializeApp();
  }, []);


  const handleSavePreferences = async (preferences) => {
    try {
      const params = {
        id: user.id,
        city: preferences.city,
        mobile_number: preferences.mobileNumber,
        user_type: preferences.userType
      };
      const userInfo = await updateUserInfo(params);
      setUser(userInfo);
      
      setToast({
        message: 'Profile preferences updated successfully!',
        type: 'success'
      });

      // If user selected SERVICE_PROVIDER, get services and show modal
      if (preferences.userType === 'SERVICE_PROVIDER') {
        await getParentServices();
        setShowOnboardingModal(false);
        setShowProviderModal(true);
      } else {
        setShowOnboardingModal(false);
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
      setToast({
        message: 'Failed to update preferences. Please try again.',
        type: 'error'
      });
    }
  };

  const handleAboutClick = (e) => {
    e.preventDefault();
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const aboutSection = document.getElementById('about');
        if (aboutSection) {
          aboutSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    } else {
      const aboutSection = document.getElementById('about');
      if (aboutSection) {
        aboutSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  };

  const handleServicesClick = (e) => {
    e.preventDefault();
    if (window.location.pathname !== '/') {
      window.location.href = '/#services';
    } else {
      const servicesSection = document.getElementById('services');
      if (servicesSection) {
        servicesSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  };

  const handleProviderOnboarding = async (providerData) => {
    try {
      const params = {
        id: user.id,
        ...providerData
      };
      const updatedUser = await updateUserInfo(params);
      
      // Don't update user state yet to prevent modal from closing
      // setUser(updatedUser); // Remove this line
      
      // Let the modal handle the complete flow
      return updatedUser; // Return the updated user data
    } catch (error) {
      console.error('Failed to update provider info:', error);
      setToast({
        message: 'Failed to update provider profile. Please try again.',
        type: 'error'
      });
      throw error; // Rethrow to let modal handle the error
    }
  };

  return (
    <div className="app-content">
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <>
                  <Header 
                    title={headers.home.title} 
                    links={headers.home.buttons} 
                    onAboutClick={handleAboutClick}
                    onServicesClick={handleServicesClick}
                  />
                  <HeroSection />
                  {/* Show modals if needed */}
                  {showOnboardingModal && !showProviderModal && (
                    <UserPreferencesModal
                      show={showOnboardingModal}
                      onClose={() => setShowOnboardingModal(false)}
                      onSave={handleSavePreferences}
                    />
                  )}
                  {showProviderModal && !showOnboardingModal && (
                    <ServiceProviderOnboardingModal
                      show={showProviderModal}
                      onClose={() => {
                        console.log("Closing provider modal");
                        setShowProviderModal(false);
                      }}
                      onSave={handleProviderOnboarding}
                      services={parentServices}
                      user={user}
                    />
                  )}
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/service/:id"
            element={
              <ProtectedRoute>
                <>
                  <Header 
                    title={headers.home.title} 
                    links={headers.home.buttons} 
                    onAboutClick={handleAboutClick}
                    onServicesClick={handleServicesClick}
                  />
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
                  <Header 
                    title={headers.home.title} 
                    links={headers.home.buttons}
                    onAboutClick={handleAboutClick}
                    onServicesClick={handleServicesClick}
                  />
                  <ServiceProviderPage />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Header 
                  title={headers.home.title} 
                  links={headers.home.buttons}
                  onAboutClick={handleAboutClick}
                  onServicesClick={handleServicesClick}
                />
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/me"
            element={
              <ProtectedRoute>
                <>
                  <Header 
                    title={headers.home.title} 
                    links={headers.home.buttons}
                    onAboutClick={handleAboutClick}
                    onServicesClick={handleServicesClick}
                  />
                  <ProfilePage />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/services"
            element={
              <ProtectedRoute>
                <Header 
                  title={headers.home.title} 
                  links={headers.home.buttons} 
                  onAboutClick={handleAboutClick}
                  onServicesClick={handleServicesClick}
                />
                <HomeServices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/document-analysis"
            element={
              <ProtectedRoute>
                <Header 
                  title={headers.home.title} 
                  links={headers.home.buttons}
                  onAboutClick={handleAboutClick}
                  onServicesClick={handleServicesClick}
                />
                <DocumentAnalyzer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <ProviderDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={<LoginPage />}
          />
        </Routes>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </Router>
  );
}

export default App;