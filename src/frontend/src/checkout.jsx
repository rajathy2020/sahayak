import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchUserInfo, generateClientCardSetUpUrl, receiveClientPayment } from './api';
import './page_styles/checkout.css';
import './page_styles/header.css'; // Add this for header styling

const CheckoutPage = () => {
  // State management
  const [user, setUser] = useState(null);
  const [cards, setCards] = useState([]);
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clientCardUrl, setClientCardUrl] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Extract query parameters or state from the location
  const getQueryParams = () => {
    const params = new URLSearchParams(location.search);
    const requestParams = {};
    for (let [key, value] of params.entries()) {
      requestParams[key] = value;
    }
    return requestParams;
  };

  const bookingSummary = location.state || getQueryParams();

  // Fetch user info function
  const getUserInfo = async () => {
    try {
      const response = await fetchUserInfo();
      const payment_methods = response.stripe_paymemt_methods;
      if (payment_methods) {
        const formattedCards = payment_methods.map((method) => ({
          cardNumber: `**** **** **** ${method.last4}`,
          cardType: method.brand,
          expiry: `${method.exp_month}/${method.exp_year}`,
          payment_method_id: method.payment_method_id,
        }));
        setCards(formattedCards);
      }
    } catch (error) {
      setError('Failed to get user info');
    } finally {
      setLoading(false);
    }
  };

  // Generate client card setup URL function
  const getClientCardSetupUrl = async () => {
    try {
      const response = await generateClientCardSetUpUrl();
      setClientCardUrl(response);
      window.location.href = response;
    } catch (error) {
      setError('Failed to generate card setup URL');
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetching
  useEffect(() => {
    getUserInfo();
  }, []);

  // Handle card selection
  const handleCardSelection = (index) => {
    setSelectedCardIndex(index);
  };

  // Handle payment processing
  const handleClientPayment = async () => {
    if (selectedCardIndex === null) {
      alert('Please select a card to make a payment.');
      return;
    }

    const params = {
      amount: 100, // Replace with dynamic amount if needed
      payment_method_id: cards[selectedCardIndex].payment_method_id,
    };

    try {
      const response = await receiveClientPayment(params);
      if (response && response.payment_intent_id) {
        alert('Payment was successful!');
        navigate(`/my_bookings`);
      } else {
        alert('Payment failed. Please try again.');
      }
    } catch (error) {
      setError('Failed to process payment');
      alert('An error occurred while processing your payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      {/* Header Section */}
      <header className="header">
        <div className="logo">Pay your SAHAYAK</div>
      </header>

      {/* Main Content Section */}
      <div className="checkout-container">
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <>
            {/* Left section for cards */}
            <div className="cards-section" style={{ flex: 2, backgroundColor: '#ffffff' }}>
              <h3>Available Cards</h3>
              {cards.length > 0 ? (
                <div className="card-list">
                  {cards.map((card, index) => (
                    <div key={index} className="card-item">
                      <input
                        type="checkbox"
                        checked={selectedCardIndex === index}
                        onChange={() => handleCardSelection(index)}
                      />
                      <label>
                        <p><strong>Card:</strong> {card.cardNumber}</p>
                        <p><strong>Expiry:</strong> {card.expiry}</p>
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No card added. Please add a card to proceed.</p>
              )}
              {cards.length === 0 && (
                <button className="add-card-button" onClick={getClientCardSetupUrl}>
                  Add Card
                </button>
              )}
              {cards.length > 0 && (
                <button className="make-payment-button" onClick={handleClientPayment}>
                  Make Payment
                </button>
              )}
            </div>

            {/* Right section for booking summary */}
            <div className="booking-summary" style={{ flex: 1, backgroundColor: '#f0f0f0' }}>
              <h3>Booking Summary</h3>
              <p><strong>Provider:</strong> {bookingSummary.provider_name}</p>
              <p><strong>Date:</strong> {bookingSummary.booking_date}</p>
              <p><strong>Time Slot:</strong> {bookingSummary.booking_slot}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
