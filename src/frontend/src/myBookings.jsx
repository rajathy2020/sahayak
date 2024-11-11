import React, { useState, useEffect } from 'react';
import { fetchUserBookings, initiateChatWithProvider, transferProviderPayment } from './api'; // Adjust these API imports as needed
import './page_styles/myBookings.css'; // Import a CSS file for styling

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch user bookings
  const getUserBookings = async () => {
    try {
      const response = await fetchUserBookings();
      setBookings(response);
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
        "provider_id": booking.provider_id,
        "amount": booking.total_price*100
    }
    transferProviderPayment(params)
  };

  // Fetch bookings on component mount
  useEffect(() => {
    getUserBookings();
  }, []);

  return (
    <div className="my-bookings-page">
      <h2>My Bookings</h2>
      {loading ? (
        <p>Loading bookings...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : bookings.length > 0 ? (
        <ul className="bookings-list">
          {bookings.map((booking) => (
            <li key={booking.id} className="booking-list-item">
              <div className="booking-details">
                <p><strong>Service:</strong> {booking.service_name}</p>
                <p><strong>Provider:</strong> {booking.provider_name}</p>
                <p><strong>Date:</strong> {booking.booking_date}</p>
                <p><strong>Time Slot:</strong> {booking.booking_slot}</p>
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
  );
};

export default MyBookingsPage;
