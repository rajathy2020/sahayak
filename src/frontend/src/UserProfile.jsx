import React, { useEffect, useState } from 'react';
import { fetchUserInfo, fetchUserBookings } from './api';
import './page_styles/user_profile.css';

const UserProfile = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');

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

  const renderBookings = () => (
    <div className="bookings-section">
      <h3>Your Bookings</h3>
      {bookings.length === 0 ? (
        <p>No bookings found</p>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              <div className="booking-header">
                <span className="booking-date">{formatDate(booking.booked_date)}</span>
                <span className="booking-price">€{booking.total_price}</span>
              </div>
              <div className="booking-details">
                <p>Time: {booking.time_slot}</p>
                <p>Services: {booking.subservice_ids.join(', ')}</p>
                <p>Status: {booking.status || 'Scheduled'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

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
        {activeTab === 'bookings' && renderBookings()}
        {activeTab === 'payment' && renderPaymentMethods()}
      </div>
    </div>
  );
};

export default UserProfile; 