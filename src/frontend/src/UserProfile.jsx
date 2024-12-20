import React, { useEffect, useState } from 'react';
import { fetchUserInfo, fetchUserBookings, transferProviderPayment } from './api';
import './page_styles/user_profile.css';

const UserProfile = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await fetchUserInfo();
        const userBookings = await fetchUserBookings();
        setUserInfo(userData);
        setBookings(userBookings);
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, removing: true }));
      setTimeout(() => setToast(null), 300);
    }, 5000);
  };

  const handlePayout = async (booking) => {
    setPaymentLoading(booking.id);
    try {
      await transferProviderPayment({
        booking_id: booking.id,
        amount: booking.total_price * 100,
      });
      
      // Refresh bookings after successful payout
      await fetchUserBookings();
      showToast('Payment to provider processed successfully', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to process payment', 'error');
    } finally {
      setPaymentLoading(false);
    }
  };

  const renderProfile = () => (
    <div className="profile-section">
      <div className="profile-header">
        <div className="profile-avatar">
          {userInfo?.name?.charAt(0).toUpperCase() || '?'}
        </div>
        <h2>{userInfo?.name || 'User'}</h2>
      </div>
      <div className="profile-details">
        <div className="detail-item">
          <span className="label">Email:</span>
          <span>{userInfo?.email}</span>
        </div>
        <div className="detail-item">
          <span className="label">City:</span>
          <span>{userInfo?.city || 'Not specified'}</span>
        </div>
        <div className="detail-item">
          <span className="label">User Type:</span>
          <span>{userInfo?.user_type || 'Not specified'}</span>
        </div>
        <div className="detail-item">
          <span className="label">Gender:</span>
          <span>{userInfo?.gender || 'Not specified'}</span>
        </div>
      </div>
    </div>
  );

  const renderBookingsTab = () => {
    return (
      <div className="bookings-tab">
        <h3>Your Bookings</h3>
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              <div className="booking-header">
                <h4>{booking.metadata?.[booking.subservice_ids[0]]?.name || 'Service'}</h4>
                <span className={`booking-status ${booking.status.toLowerCase()}`}>
                  {booking.status}ssssssss
                </span>
              </div>
              
              <div className="booking-details">
                <p>
                  <i className="fas fa-calendar"></i>
                  {new Date(booking.booked_date).toLocaleDateString()}
                </p>
                <p>
                  <i className="fas fa-clock"></i>
                  {booking.time_slot}
                </p>
                <p>
                  <i className="fas fa-euro-sign"></i>
                  {booking.total_price}
                </p>
              </div>

              <div className="booking-provider">
                <p>Provider: {booking.metadata?.[booking.provider_id]?.name || 'Provider'}</p>
              </div>

              {booking.status === 'CONFIRMED' && (
                <div className="booking-actions">
                  <button 
                    className="payout-button"
                    onClick={() => handlePayout(booking)}
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
                </div>
              )}
            </div>
          ))}
        </div>

        {toast && (
          <div className={`toast ${toast.type} ${toast.removing ? 'removing' : ''}`}>
            <div className="toast-content">
              <i className={`fas ${toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
              <span>{toast.message}</span>
            </div>
            <div className="toast-progress"></div>
          </div>
        )}
      </div>
    );
  };

  const renderPaymentMethods = () => (
    <div className="payment-section">
      <h3>Payment Methods</h3>
      {userInfo?.stripe_paymemt_methods?.length ? (
        <div className="cards-list">
          {userInfo.stripe_paymemt_methods.map((method) => (
            <div key={method.id} className="card-item">
              <div className="card-icon">💳</div>
              <div className="card-details">
                <p>**** **** **** {method.last4}</p>
                <p>Expires: {method.exp_month}/{method.exp_year}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No payment methods found</p>
      )}
    </div>
  );

  return (
    <div className="profile-container">
      <div className="profile-tabs">
        <button
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button
          className={`tab-button ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          Bookings
        </button>
        <button
          className={`tab-button ${activeTab === 'payment' ? 'active' : ''}`}
          onClick={() => setActiveTab('payment')}
        >
          Payment Methods
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'profile' && renderProfile()}
        {activeTab === 'bookings' && renderBookingsTab()}
        {activeTab === 'payment' && renderPaymentMethods()}
      </div>
    </div>
  );
};

export default UserProfile; 