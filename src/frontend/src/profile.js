// ProfilePage.js
import React, { useState, useEffect } from 'react';
import './page_styles/profile.css';
import { fetchUserBookings, initiateChatWithProvider, transferProviderPayment, fetchUserInfo, updateUserInfo, generateClientCardSetUpUrl, removePaymentMethod, receiveClientPayment, rateProvider } from './api';
import ChatBox from './components/ChatBox';
import { City } from './models.ts';
import Toast from './components/Toast';
import RatingModal from './components/RatingModal';

const ProfilePage = () => {
  const [userInfo, setUserInfo] = useState({
    id: 'default-id',
    name: 'Anonymous',
    gender: '',
    email: 'no-email@domain.com',
    city: '',
    address: '',
    user_type: '',
    stripe_customer_id: '',
    stripe_paymemt_methods: [],
    stripe_account_id: '',
    services_offered: [],
    available_time_slots: [],
    services_offered_details: [],
    description: '',
    number_of_bookings: 0,
    whatsappNumber: '',
  });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatProvider, setChatProvider] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [imagePreview, setImagePreview] = useState(userInfo.image_url || 'https://via.placeholder.com/120');
  const [saveLoading, setSaveLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [pageLoading, setPageLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [editField, setEditField] = useState(null);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isRemovingCard, setIsRemovingCard] = useState(false);
  const [cardToRemove, setCardToRemove] = useState(null);
  const [toast, setToast] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingBookings, setProcessingBookings] = useState({});
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [bookingToRate, setBookingToRate] = useState(null);

  useEffect(() => {
    const initializePage = async () => {
      setPageLoading(true);
      try {
        await getUserInfo();
        // Check for hash in URL and set active tab accordingly
        const hash = window.location.hash.replace('#', '');
        if (hash) {
          setActiveTab(hash);
        }
      } catch (error) {
        console.error('Error initializing page:', error);
      } finally {
        setTimeout(() => setPageLoading(false), 500);
      }
    };

    initializePage();
  }, []);

  // Update the useEffect for hash changes and add bookings fetch
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setActiveTab(hash);
        // Fetch bookings if navigating to bookings tab
        if (hash === 'bookings') {
          getUserBookings();
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Add another useEffect to handle tab changes
  useEffect(() => {
    if (activeTab === 'bookings') {
      getUserBookings();
    }
  }, [activeTab]);

  // Function to fetch user information
  const getUserInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchUserInfo();
      console.log("response", response)
      setUserInfo(response);
    } catch (error) {
      setError('Failed to load user information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch user bookings
  const getUserBookings = async () => {
    setBookingsLoading(true);
    setError(null);
    try {
      const response = await fetchUserBookings();
      
      if (response && Array.isArray(response)) {
        const formattedBookings = response.map((booking) => {
          const provider = booking.metadata?.[booking.provider_id];
          const services = booking.subservice_ids?.map((subserviceId) => {
            return booking.metadata?.[subserviceId]?.name || 'Unknown Service';
          }) || [];
          
          return {
            ...booking,
            provider_name: provider ? provider.name : 'Unknown Provider',
            services: services
          };
        });
        
        setBookings(formattedBookings);
      } else {
        setBookings([]);
        console.error('Invalid bookings response:', response);
      }
    } catch (error) {
      console.error('Error in getUserBookings:', error);
      setError('Failed to load bookings. Please try again.');
      setBookings([]); // Set empty array on error
    } finally {
      setBookingsLoading(false);
    }
  };

  // Function to initiate chat with the provider
  const handleChat = (provider_id, bookingId, booking) => {
    const params = {
      booking_id: bookingId.toString(),
      provider_id: provider_id,
      client_id: userInfo.id,
      provider_name: booking.provider_name,
      client_name: userInfo.name,
      currentUserId: userInfo.id,
      currentUserType: 'CLIENT'
    };
    console.log(params, "params for the chat");
    setChatProvider(params);
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, removing: true }));
      setTimeout(() => setToast(null), 300);
    }, 5000);
  };

  const handleProviderPayment = async (booking) => {
    setPaymentLoading(booking.id);
    try {
      const response = await transferProviderPayment({
        booking_id: booking.id,
        amount: booking.total_price * 100,
      });
      
      // Show rating modal if payment was successful
      if (response.should_rate) {
        setBookingToRate(booking);
        setShowRatingModal(true);
      }

      // Refresh bookings
      await getUserBookings();
      showToast('Payment to provider processed successfully', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to process payment', 'error');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleAddPayment = () => {
    // Implement payment method addition logic here
    console.log('Add Payment Method clicked');
  };

  // Handlers for saving profile information
  const handleSaveProfile = async () => {
    setSaveLoading(true);
    setError(null);
    try {
      const updateData = {
        id: userInfo.id,
        name: userInfo.name,
        whatsapp_number: userInfo.whatsappNumber,
        address: userInfo.address,
        city: userInfo.city,
      };

      console.log('Updating user with data:', updateData); // Debug log

      const updatedUser = await updateUserInfo(updateData);
      
      setUserInfo(prev => ({
        ...prev,
        ...updatedUser,
        whatsappNumber: updatedUser.whatsapp_number // Handle snake_case to camelCase conversion
      }));

      setSaveSuccess(true);
      setIsDirty(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update user information. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({
      ...prev,
      [name]: value
    }));
    setIsDirty(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        // Here you would typically upload the image to your server
        // and update userInfo.image_url with the returned URL
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSaveProfile();
  };

  const handleAddPaymentMethod = async () => {
    setIsAddingCard(true);
    try {
      const setupUrl = await generateClientCardSetUpUrl();
      if (setupUrl) {
        window.location.href = setupUrl;
      } else {
        throw new Error('Failed to get setup URL');
      }
    } catch (error) {
      setError('Failed to setup payment method. Please try again.');
    } finally {
      setIsAddingCard(false);
    }
  };

  const handleRemoveCard = async (paymentMethodId) => {
    setCardToRemove(null);
    setIsRemovingCard(true);
    try {
      await removePaymentMethod(paymentMethodId);
      await getUserInfo();
      setToast({
        message: 'Card removed successfully',
        type: 'success'
      });
    } catch (error) {
      setToast({
        message: 'Failed to remove card. Please try again.',
        type: 'error'
      });
    } finally {
      setIsRemovingCard(false);
      // Auto dismiss toast after 3 seconds
      setTimeout(() => setToast(null), 3000);
    }
  };

  const renderPaymentSection = () => {
    return (
      <div className="profile-section">
        <div className="section-header">
          <h3>Payment Methods</h3>
          <button 
            className="add-payment-btn"
            onClick={handleAddPaymentMethod}
            disabled={isAddingCard}
          >
            {isAddingCard ? (
              <>
                <span className="spinner"></span>
                Setting up...
              </>
            ) : (
              <>
                <i className="fas fa-plus"></i>
                Add Payment Method
              </>
            )}
          </button>
        </div>
        {userInfo.stripe_paymemt_methods?.length > 0 ? (
          <div className="payment-methods-list">
            {userInfo.stripe_paymemt_methods.map((method, index) => (
              <div key={index} className="payment-method-card">
                <div className="remove-btn-container">
                  <button 
                    className="remove-card-btn"
                    onClick={() => setCardToRemove(method)}
                    disabled={isRemovingCard}
                    title="Remove card"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                
                <div className="card-info">
                  <div className="card-header">
                    <div className="card-brand">
                      <i className={`fab fa-cc-${method.brand.toLowerCase()}`}></i>
                      <div className="card-brand-info">
                        <span className="brand-name">{method.brand}</span>
                        <span className="card-type">
                          {method.funding ? `${method.funding.charAt(0).toUpperCase() + method.funding.slice(1)} Card` : ''}
                        </span>
                      </div>
                    </div>
                    {index === 0 && <span className="default-badge">Default</span>}
                  </div>

                  <div className="card-details">
                    <div className="card-primary-info">
                      <div className="card-number">•••• •••• •••• {method.last4}</div>
                      <div className="card-meta">
                        <span className="card-expiry">
                          <i className="far fa-calendar-alt"></i>
                          Expires {method.exp_month}/{method.exp_year}
                        </span>
                        {method.country && (
                          <span className="card-country">
                            <i className="fas fa-globe"></i>
                            {method.country}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="card-additional-info">
                      {method.wallet && (
                        <span className="card-wallet">
                          <i className="fas fa-wallet"></i>
                          {method.wallet}
                        </span>
                      )}
                      {method.networks?.available?.length > 0 && (
                        <span className="card-networks">
                          <i className="fas fa-network-wired"></i>
                          {method.networks.available.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <i className="fas fa-credit-card"></i>
            <p>No payment methods added yet</p>
            <p className="subtitle">Add a payment method to book services</p>
          </div>
        )}
      </div>
    );
  };

  const ConfirmRemoveCard = ({ card, onConfirm, onCancel }) => {
    return (
      <div className="modal-overlay">
        <div className="confirm-modal">
          <h3>Remove Card</h3>
          <p>Are you sure you want to remove this card?</p>
          <div className="card-preview">
            <i className={`fab fa-cc-${card.brand.toLowerCase()}`}></i>
            <span>•••• {card.last4}</span>
          </div>
          <div className="modal-actions">
            <button className="cancel-btn" onClick={onCancel}>
              Cancel
            </button>
            <button className="confirm-btn" onClick={onConfirm}>
              Remove Card
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Update tab click handler to include hash
  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    window.location.hash = tabName;
  };

  const handleConfirmBooking = async (booking) => {
    // Set loading state for specific booking
    setProcessingBookings(prev => ({
      ...prev,
      [booking._id]: true
    }));

    try {
      const params = {
        booking_id: booking._id,
        amount: booking.total_price * 100,
        payment_method_id: userInfo.stripe_paymemt_methods[0].payment_method_id,
        description: "Service Booking"
      };

      const response = await receiveClientPayment(params);
      if (response && response.payment_intent_id) {
        setToast({
          message: 'Booking confirmed successfully! Payment processed.',
          type: 'success'
        });
        // Update only this booking in the list
        setBookings(prevBookings => 
          prevBookings.map(b => 
            b._id === booking._id 
              ? { ...b, status: 'CONFIRMED' }
              : b
          )
        );
      } else {
        setToast({
          message: 'Failed to confirm booking. Please try again.',
          type: 'error'
        });
      }
    } catch (error) {
      setToast({
        message: 'Failed to process payment. Please try again.',
        type: 'error'
      });
    } finally {
      // Clear loading state for this specific booking
      setProcessingBookings(prev => ({
        ...prev,
        [booking._id]: false
      }));
    }
  };

  const handleRatingSubmit = async (ratingData) => {
    try {
      await rateProvider(ratingData);
      showToast('Thank you for your rating!', 'success');
      await getUserBookings(); // Refresh bookings to update UI
    } catch (error) {
      showToast(error.message || 'Failed to submit rating', 'error');
    }
  };

  const renderBookingCard = (booking) => (
    <div className="booking-card">
      {/* ... existing booking details ... */}
      
      {booking.status === 'PAYMENT_MADE' && (
        <div className="booking-rating">
          {booking.rating ? (
            <div className="rating-display">
              <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <i
                    key={star}
                    className={`fas fa-star ${star <= booking.rating ? 'active' : ''}`}
                  />
                ))}
              </div>
              {booking.rating_comment && (
                <p className="rating-comment">{booking.rating_comment}</p>
              )}
            </div>
          ) : (
            <button
              className="rate-btn"
              onClick={() => {
                setBookingToRate(booking);
                setShowRatingModal(true);
              }}
            >
              Rate this service
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="profile-page">
      {pageLoading ? (
        <div className="page-loader">
          <div className="loader-content">
            <div className="loader-spinner">
              <img 
                src="/logo.png"
                alt="SAHAYAK"
              />
            </div>
            <p>Setting up your profile</p>
            <div className="loader-progress"></div>
            <div className="loader-steps">
              Loading your information...
            </div>
          </div>
        </div>
      ) : (
        <div className="profile-container">
          <div className="profile-card">
            <div className="profile-cover">
              <div className="profile-header-content">
                <div className="profile-avatar-wrapper">
                  <div className="profile-avatar">
                    <img 
                      src={imagePreview} 
                      alt={userInfo.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/120';
                      }}
                    />
                    <label className="avatar-upload">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                      />
                      <i className="fas fa-camera"></i>
                    </label>
                  </div>
                  <div className="profile-title">
                    <div className="welcome-message">
                      {new Date().getHours() < 12 
                        ? "Good morning"
                        : new Date().getHours() < 17 
                        ? "Good afternoon"
                        : "Good evening"
                      }, welcome back!
                    </div>
                    <h2>{userInfo.name}</h2>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Navigation - keep this */}
            <div className="profile-nav">
              <button 
                className={`nav-tab ${activeTab === 'personal' ? 'active' : ''}`}
                onClick={() => handleTabClick('personal')}
              >
                <i className="fas fa-user"></i>
                Personal Info
              </button>
              <button 
                className={`nav-tab ${activeTab === 'contact' ? 'active' : ''}`}
                onClick={() => handleTabClick('contact')}
              >
                <i className="fas fa-address-book"></i>
                Contact Details
              </button>
              <button 
                className={`nav-tab ${activeTab === 'bookings' ? 'active' : ''}`}
                onClick={() => handleTabClick('bookings')}
              >
                <i className="fas fa-calendar-alt"></i>
                My Bookings
              </button>
              <button 
                className={`nav-tab ${activeTab === 'payment' ? 'active' : ''}`}
                onClick={() => handleTabClick('payment')}
              >
                <i className="fas fa-credit-card"></i>
                Payment Info
              </button>
            </div>

            {/* Profile Content - keep this */}
            <div className="profile-content">
              {loading ? (
                <div className="profile-skeleton">
                  {/* ... loading skeleton ... */}
                </div>
              ) : error ? (
                <div className="error-message">{error}</div>
              ) : (
                <>
                  {/* Personal Info Tab */}
                  {activeTab === 'personal' && (
                    <div className="profile-edit-section">
                      <div className="profile-edit-card">
                        <div className="info-section">
                          <div className="info-group">
                            <div className="info-label">
                              <i className="fas fa-user"></i>
                              <span>Name</span>
                            </div>
                            <div className="info-content editable" onClick={() => setEditField('name')}>
                              {editField === 'name' ? (
                                <input
                                  type="text"
                                  name="name"
                                  value={userInfo.name}
                                  onChange={handleInputChange}
                                  onBlur={() => setEditField(null)}
                                  autoFocus
                                />
                              ) : (
                                <>
                                  <span className="info-value">{userInfo.name}</span>
                                  <i className="fas fa-pencil-alt edit-icon"></i>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="info-group">
                            <div className="info-label">
                              <i className="fas fa-envelope"></i>
                              <span>Email</span>
                            </div>
                            <div className="info-content">
                              <span className="info-value">{userInfo.email}</span>
                              <span className="info-badge">
                                <i className="fas fa-check-circle"></i>
                                Verified
                              </span>
                            </div>
                          </div>

                          <div className="info-group">
                            <div className="info-label">
                              <i className="fas fa-shield-alt"></i>
                              <span>Account Status</span>
                            </div>
                            <div className="info-content">
                              <span className="info-value">Active</span>
                              <span className="info-badge success">Protected</span>
                            </div>
                          </div>
                        </div>

                        {isDirty && (
                          <div className={`floating-save ${isDirty ? 'visible' : ''}`}>
                            <button 
                              className="save-changes-btn" 
                              onClick={handleSaveProfile}
                              disabled={saveLoading}
                            >
                              {saveLoading ? (
                                <span className="loading-spinner"></span>
                              ) : (
                                <>
                                  <i className="fas fa-check"></i>
                                  Save Changes
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Contact Details Tab */}
                  {activeTab === 'contact' && (
                    <div className="profile-edit-section">
                      <div className="profile-edit-card">
                        <div className="info-section">
                          <div className="info-group">
                            <div className="info-label">
                              <i className="fab fa-whatsapp"></i>
                              <span>WhatsApp</span>
                            </div>
                            <div className="info-content editable" onClick={() => setEditField('whatsappNumber')}>
                              {editField === 'whatsappNumber' ? (
                                <input
                                  type="tel"
                                  name="whatsappNumber"
                                  value={userInfo.whatsappNumber}
                                  onChange={handleInputChange}
                                  onBlur={() => setEditField(null)}
                                  autoFocus
                                  placeholder="+49 XXX XXXXXXX"
                                />
                              ) : (
                                <>
                                  <span className="info-value">
                                    {userInfo.whatsappNumber || 'Add WhatsApp number'}
                                  </span>
                                  <i className="fas fa-pencil-alt edit-icon"></i>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="info-group">
                            <div className="info-label">
                              <i className="fas fa-city"></i>
                              <span>City</span>
                            </div>
                            <div className="info-content editable" onClick={() => setEditField('city')}>
                              {editField === 'city' ? (
                                <select
                                  name="city"
                                  value={userInfo.city}
                                  onChange={handleInputChange}
                                  onBlur={() => setEditField(null)}
                                  autoFocus
                                >
                                  <option value="">Select your city</option>
                                  {Object.values(City).map((city) => (
                                    <option key={city} value={city}>
                                      {city.charAt(0) + city.slice(1).toLowerCase()}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <>
                                  <span className="info-value">
                                    {userInfo.city ? 
                                      userInfo.city.charAt(0) + userInfo.city.slice(1).toLowerCase() 
                                      : 'Select your city'
                                    }
                                  </span>
                                  <i className="fas fa-pencil-alt edit-icon"></i>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="info-group">
                            <div className="info-label">
                              <i className="fas fa-map-marker-alt"></i>
                              <span>Address</span>
                            </div>
                            <div className="info-content editable" onClick={() => setEditField('address')}>
                              {editField === 'address' ? (
                                <input
                                  type="text"
                                  name="address"
                                  value={userInfo.address}
                                  onChange={handleInputChange}
                                  onBlur={() => setEditField(null)}
                                  autoFocus
                                  placeholder="Enter your street address"
                                />
                              ) : (
                                <>
                                  <span className="info-value">
                                    {userInfo.address || 'Add your address'}
                                  </span>
                                  <i className="fas fa-pencil-alt edit-icon"></i>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {isDirty && (
                          <div className={`floating-save ${isDirty ? 'visible' : ''}`}>
                            <button 
                              className="save-changes-btn" 
                              onClick={handleSaveProfile}
                              disabled={saveLoading}
                            >
                              {saveLoading ? (
                                <span className="loading-spinner"></span>
                              ) : (
                                <>
                                  <i className="fas fa-check"></i>
                                  Save Changes
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Bookings Tab */}
                  {activeTab === 'bookings' && (
                    <div className="bookings-section">
                      {bookingsLoading ? (
                        <div className="booking-cards loading">
                          {[1, 2, 3].map((n) => (
                            <div key={n} className="booking-card skeleton">
                              <div className="booking-header skeleton-header">
                                <div className="skeleton-badge"></div>
                                <div className="skeleton-price"></div>
                              </div>
                              <div className="booking-body">
                                <div className="skeleton-provider">
                                  <div className="skeleton-avatar"></div>
                                  <div className="skeleton-text medium"></div>
                                </div>
                                <div className="skeleton-services">
                                  <div className="skeleton-text short"></div>
                                  <div className="skeleton-text long"></div>
                                  <div className="skeleton-text medium"></div>
                                </div>
                                <div className="skeleton-time">
                                  <div className="skeleton-text short"></div>
                                  <div className="skeleton-text short"></div>
                                </div>
                              </div>
                              <div className="skeleton-actions">
                                <div className="skeleton-button"></div>
                                <div className="skeleton-button"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : error ? (
                        <div className="error-state">
                          <i className="fas fa-exclamation-circle"></i>
                          <h3>Error Loading Bookings</h3>
                          <p>{error}</p>
                          <button onClick={getUserBookings} className="retry-button">
                            <i className="fas fa-redo"></i>
                            Try Again
                          </button>
                        </div>
                      ) : bookings.length > 0 ? (
                        <div className="booking-cards">
                          {bookings.map((booking) => (
                            <div key={booking._id} className={`booking-card ${booking.status.toLowerCase()}`}>
                              <div className="booking-header">
                                <span className={`booking-status status-${(booking.status || 'pending').toLowerCase()}`}>
                                  {booking.status || 'Pending'}
                                </span>
                                <span className="booking-price">€{booking.total_price}</span>
                              </div>
                              
                              <div className="booking-body">
                                <div className="booking-provider">
                                  <i className="fas fa-user-circle"></i>
                                  <span>{booking.provider_name}</span>
                                </div>
                                
                                <div className="booking-services">
                                  <h4>Services:</h4>
                                  <ul>
                                    {booking.services.map((service, index) => (
                                      <li key={index}>{service}</li>
                                    ))}
                                  </ul>
                                </div>
                                
                                <div className="booking-time">
                                  <div className="time-item">
                                    <i className="far fa-calendar"></i>
                                    <span>{new Date(booking.booked_date).toLocaleDateString()}</span>
                                  </div>
                                  <div className="time-item">
                                    <i className="far fa-clock"></i>
                                    <span>{booking.time_slot}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="booking-actions">
                                <button 
                                  className="action-button chat"
                                  onClick={() => handleChat(booking.provider_id, booking.id, booking)}
                                >
                                  <i className="fas fa-comments"></i>
                                  Chat with Provider
                                </button>

                                {booking.status === 'RESERVED' && (
                                  <button 
                                    className="action-button confirm"
                                    onClick={() => handleConfirmBooking(booking)}
                                    disabled={processingBookings[booking._id]}
                                  >
                                    {processingBookings[booking._id] ? (
                                      <>
                                        <span className="spinner"></span>
                                        Processing...
                                      </>
                                    ) : (
                                      <>
                                        <i className="fas fa-check-circle"></i>
                                        Confirm Appointment
                                      </>
                                    )}
                                  </button>
                                )}

                                {booking.status === 'CONFIRMED' && (
                                  <button 
                                    className="action-button pay"
                                    onClick={() => handleProviderPayment(booking)}
                                    disabled={paymentLoading === booking.id}
                                  >
                                    {paymentLoading === booking.id ? (
                                      <div className="button-content">
                                        <span className="button-loader"></span>
                                        <span>Processing...</span>
                                      </div>
                                    ) : (
                                      <div className="button-content">
                                        <i className="fas fa-money-bill-wave"></i>
                                        <span>Pay to Provider</span>
                                      </div>
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="empty-state">
                          <i className="fas fa-calendar-times"></i>
                          <h3>No Bookings Found</h3>
                          <p>You haven't made any bookings yet.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Payment Tab */}
                  {activeTab === 'payment' && renderPaymentSection()}
                </>
              )}
            </div>
          </div>

          {saveSuccess && (
            <div className="success-toast">
              <i className="fas fa-check-circle"></i>
              <span>Profile updated successfully!</span>
            </div>
          )}

          {chatProvider && (
            <ChatBox 
              booking_id={chatProvider.booking_id}
              provider_id={chatProvider.provider_id}
              client_id={chatProvider.client_id}
              provider_name={chatProvider.provider_name}
              client_name={chatProvider.client_name}
              currentUserId={chatProvider.currentUserId}
              currentUserType={chatProvider.currentUserType}
              onClose={() => setChatProvider(null)}
            />
          )}

          {cardToRemove && (
            <ConfirmRemoveCard
              card={cardToRemove}
              onConfirm={() => handleRemoveCard(cardToRemove.payment_method_id)}
              onCancel={() => setCardToRemove(null)}
            />
          )}

          {toast && (
            <div className={`toast ${toast.type} ${toast.removing ? 'removing' : ''}`}>
              <div className="toast-content">
                <i className={`fas ${toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                <span>{toast.message}</span>
              </div>
              <div className="toast-progress"></div>
            </div>
          )}

          {/* Add Rating Modal */}
          {showRatingModal && bookingToRate && (
            <RatingModal
              booking={bookingToRate}
              onClose={() => {
                setShowRatingModal(false);
                setBookingToRate(null);
              }}
              onSubmit={handleRatingSubmit}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
