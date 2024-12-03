// ProfilePage.js
import React, { useState, useEffect } from 'react';
import './page_styles/profile.css';
import { fetchUserBookings, initiateChatWithProvider, transferProviderPayment, fetchUserInfo, updateUserInfo } from './api';

const ProfilePage = () => {
  const [selectedSection, setSelectedSection] = useState('profile');
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

  useEffect(() => {
    if (selectedSection === 'profile') {
      getUserInfo();
    } else if (selectedSection === 'bookings') {
      getUserBookings();
    }
  }, [selectedSection]);

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
    setLoading(true);
    setError(null);
    try {
      const response = await fetchUserBookings();
      const formattedBookings = response.map((booking) => {
        const provider = booking.metadata[booking.provider_id];
        const services = booking.subservice_ids.map((subserviceId) => {
          return booking.metadata[subserviceId]?.name || 'Unknown Service';
        });
        return {
          ...booking,
          provider_name: provider ? provider.name : 'Unknown Provider',
          services: services
        };
      });
      setBookings(formattedBookings);
    } catch (error) {
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to initiate chat with the provider
  const handleChat = (providerId) => {
    try {
      initiateChatWithProvider(providerId);
      alert('Chat initiated with the service provider.');
    } catch (error) {
      console.error('Failed to initiate chat:', error);
      alert('Failed to initiate chat. Please try again.');
    }
  };

  const handleProviderPayment = (booking) => {
    const params = {
      provider_id: booking.provider_id,
      amount: booking.total_price * 100,
    };
    transferProviderPayment(params);
  };

  // Handlers for saving profile information
  const handleSaveProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await updateUserInfo({
        id: userInfo.id,
        name: userInfo.name,
        whatsapp_number: userInfo.whatsappNumber,
        address: userInfo.address,
        city: userInfo.city,
      });
      setUserInfo((prev) => ({
        ...prev,
        name: updatedUser.name,
        whatsappNumber: updatedUser.whatsapp_number,
        address: updatedUser.address,
        city: updatedUser.city,
      }));
      alert('Profile information saved successfully!');
    } catch (error) {
      setError('Failed to update user information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="profile-page">
      {/* Sidebar Navigation */}
      <div className="profile-sidebar">
        <button onClick={() => setSelectedSection('profile')}>Edit Profile</button>
        <button onClick={() => setSelectedSection('bookings')}>My Bookings</button>
        <button onClick={() => setSelectedSection('payment')}>Payment Info</button>
      </div>

      {/* Content Section */}
      <div className="profile-content">
        {selectedSection === 'profile' && (
          <div className="profile-info">
            <h2>Edit Profile Information</h2>
            {loading ? (
              <p>Loading profile information...</p>
            ) : error ? (
              <p className="error-message">{error}</p>
            ) : (
              <>
                <label>
                  Name:
                  <input
                    type="text"
                    name="name"
                    value={userInfo.name}
                    onChange={handleInputChange}
                  />
                </label>
                <label>
                  Email:
                  <input
                    type="email"
                    name="email"
                    value={userInfo.email}
                    onChange={handleInputChange}
                    disabled
                  />
                </label>
                <label>
                  WhatsApp Number:
                  <input
                    type="text"
                    name="whatsappNumber"
                    value={userInfo.whatsappNumber}
                    onChange={handleInputChange}
                  />
                </label>
                <label>
                  Address:
                  <input
                    type="text"
                    name="address"
                    value={userInfo.address}
                    onChange={handleInputChange}
                  />
                </label>
                <label>
                  City:
                  <input
                    type="text"
                    name="city"
                    value={userInfo.city}
                    onChange={handleInputChange}
                  />
                </label>
                <button onClick={handleSaveProfile}>Save</button>
              </>
            )}
          </div>
        )}

        {selectedSection === 'bookings' && (
          <div className="bookings">
            <h2>My Bookings</h2>
            {loading ? (
              <p>Loading bookings...</p>
            ) : error ? (
              <p className="error-message">{error}</p>
            ) : bookings.length > 0 ? (
              <ul className="bookings-list">
                {bookings.map((booking) => (
                  <li key={booking._id} className="booking-list-item">
                    <div className="booking-details">
                      <p><strong>Services:</strong></p>
                      <ul>
                        {booking.services.map((service, index) => (
                          <li key={index}>{service}</li>
                        ))}
                      </ul>
                      <p><strong>Provider:</strong> {booking.provider_name}</p>
                      <p><strong>Date:</strong> {booking.booked_date}</p>
                      <p><strong>Time Slot:</strong> {booking.time_slot}</p>
                    </div>
                    <div className="button-group">
                      <button
                        className="chat-button"
                        onClick={() => handleChat(booking.provider_id)}
                      >
                        Chat with Provider
                      </button>
                      <button
                        className="details-button"
                        onClick={() => handleProviderPayment(booking)}
                      >
                        Confirm Booking
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No bookings found.</p>
            )}
          </div>
        )}

        {selectedSection === 'payment' && (
          <div className="payment-info">
            <h2>Payment Information</h2>
            {loading ? (
              <p>Loading payment information...</p>
            ) : error ? (
              <p className="error-message">{error}</p>
            ) : userInfo.stripe_paymemt_methods.length > 0 ? (
              <ul className="payment-methods-list">
                {userInfo.stripe_paymemt_methods.map((method, index) => (
                  <li key={index} className="payment-method-item">
                    <p><strong>Card Brand:</strong> {method.brand}</p>
                    <p><strong>Last 4 Digits:</strong> {method.last4}</p>
                    <p><strong>Expiry:</strong> {method.exp_month}/{method.exp_year}</p>
                    <p><strong>Country:</strong> {method.country}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No payment methods found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
