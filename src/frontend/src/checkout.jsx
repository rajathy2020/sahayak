import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchUserInfo, generateClientCardSetUpUrl, receiveClientPayment } from './api';
import './page_styles/checkout.css';
import './page_styles/header.css'; // Add this for header styling

const CheckoutPage = () => {
  // State management
  const platform_fee = 2
  const [total_fees, setTotalFee] = useState(0);
  const [user, setUser] = useState(null);
  const [cards, setCards] = useState([]);
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clientCardUrl, setClientCardUrl] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // 'idle' | 'processing' | 'success' | 'error'

  // Extract query parameters or state from the location
  const getQueryParams = () => {
    const params = new URLSearchParams(location.search);
    const requestParams = {};
    for (let [key, value] of params.entries()) {
      requestParams[key] = value;
    }
    return requestParams;
  };

  const bookingSummary = location.state || getQueryParams(); // Get booking details from state

  // Use bookingSummary to display relevant information
  console.log(bookingSummary, "bookingSummary");

  // Fetch user info function
  const getUserInfo = async () => {
    try {
      const response = await fetchUserInfo();
      console.log("userinfo 123", response);
      const payment_methods = response.stripe_paymemt_methods;
      if (payment_methods) {
        const formattedCards = payment_methods.map((method) => ({
          cardNumber: `**** **** **** ${method.last4}`,
          cardType: method.brand,
          expiry: `${method.exp_month}/${method.exp_year}`,
          payment_method_id: method.payment_method_id,
          default: method.payment_method_id === response.default_payment_method_id,
        }
      
      )
    );
        console.log("formattedCards", formattedCards);
        setSelectedCardIndex(formattedCards.findIndex(card => card.default));
        setCards(formattedCards);
        setUser(response);
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
    const total_fee = parseInt(platform_fee)+parseInt(bookingSummary.price);
    setTotalFee(total_fee);
   
  }, []);

  // Handle card selection
  const handleCardSelection = (index) => {
    setSelectedCardIndex(index);
  };

  const showToast = (message, type = 'success') => {
    // Remove existing toast with animation
    if (toast) {
      const oldToast = document.querySelector('.toast');
      if (oldToast) {
        oldToast.classList.add('removing');
        setTimeout(() => setToast(null), 300);
      }
    }

    // Show new toast after a brief delay
    setTimeout(() => {
      setToast({ message, type });
      
      // Auto dismiss and navigate after 10 seconds
      const timer = setTimeout(() => {
        const toastElement = document.querySelector('.toast');
        if (toastElement) {
          toastElement.classList.add('removing');
          setTimeout(() => {
            setToast(null);
            if (type === 'success') {
              navigate('/me');
            }
          }, 300);
        }
      }, 10000);

      // Store timer in toast data
      setToast(prev => ({ ...prev, timerId: timer }));
    }, toast ? 350 : 0);
  };

  // Handle manual close
  const handleCloseToast = () => {
    if (toast?.timerId) {
      clearTimeout(toast.timerId);
    }
    const toastElement = document.querySelector('.toast');
    if (toastElement) {
      toastElement.classList.add('removing');
      setTimeout(() => {
        setToast(null);
        if (toast?.type === 'success') {
          navigate('/me');
        }
      }, 300);
    }
  };


  

  // Handle payment processing
  const handleClientPayment = async () => {
    if (selectedCardIndex === null) {
      showToast('Please select a card to make a payment.', 'error');
      return;
    }

    setPaymentStatus('processing');
    setIsProcessing(true);

    const params = {
      booking_id: bookingSummary.booking_id,
      amount: bookingSummary.price+platform_fee,
      payment_method_id: cards[selectedCardIndex].payment_method_id,
    };

    try {
      const response = await receiveClientPayment(params);
      if (response && response.payment_intent_id) {
        setPaymentStatus('success');
        setTimeout(() => {
          showToast('Payment successful! Redirecting to your profile...', 'success');
          setTimeout(() => {
            navigate(`/me`);
          }, 2000);
        }, 500); // Show success toast after transition completes
      } else {
        setPaymentStatus('error');
        showToast('Payment failed. Please try again.', 'error');
      }
    } catch (error) {
      setPaymentStatus('error');
      showToast('An error occurred while processing your payment.', 'error');
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setPaymentStatus('idle');
      }, 2000); // Reset after transition completes
    }
  };

  useEffect(() => {
    // Your checkout page initialization logic here
    const initCheckout = async () => {
      try {
        // Your initialization code here
        // For example: fetch payment methods, validate booking, etc.
        await new Promise(resolve => setTimeout(resolve, 800)); // Minimum loading time
      } catch (error) {
        console.error('Checkout initialization failed:', error);
      } finally {
        setLoading(false);
      }
    };

    initCheckout();
  }, []);

  if (loading) {
    return (
      <div className="page-loader">
        <div className="loader-content">
          <div className="loader-spinner"></div>
          <p>Setting Up Checkout</p>
          <div className="loader-progress"></div>
          <div className="loader-steps">
            Preparing payment details...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      {/* Toast Notifications */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            <i className={`toast-icon fas ${
              toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'
            }`}></i>
            <span className="toast-message">{toast.message}</span>
            <button className="toast-close" onClick={handleCloseToast}>
              <i className="fas fa-times"></i>
            </button>
            <div className="toast-progress"></div>
          </div>
        </div>
      )}

      <header className="checkout-header">
        <h1>Secure Checkout</h1>
      </header>

      <div className="checkout-container">
        {/* Payment Section */}
        <div className="payment-section">
          <h2>Payment Method</h2>
          <div className="cards-grid">
            {cards.map((card, index) => (
              <div 
                key={index} 
                className={`card-item ${selectedCardIndex === index ? 'selected' : ''}`}
                onClick={() => handleCardSelection(index)}
              >
                <input
                  type="radio"
                  className="card-radio"
                  checked={selectedCardIndex === index}
                  onChange={() => handleCardSelection(index)}
                />
                <div className="card-details">
                  <div className="card-number">{card.cardNumber}</div>
                  <div className="card-info">
                    <span className="card-brand">{card.cardType}</span>
                    <span className="card-expiry">Expires {card.expiry}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="payment-actions">
            <button className="add-card-button" onClick={getClientCardSetupUrl}>
              <i className="fas fa-plus"></i>
              {cards.length === 0 ? 'Add Card' : 'Add New'}
            </button>
            
            {cards.length > 0 && (
              <button 
                className={`payment-button ${paymentStatus === 'processing' ? 'processing' : ''}`}
                onClick={handleClientPayment}
                disabled={isProcessing}
              >
                <div className="button-content">
                  <span>
                    {paymentStatus === 'processing' ? 'Processing...' : 'Pay Now'}
                  </span>
                  <span className="amount">€{total_fees}</span>
                </div>
                <div className="spinner"></div>
              </button>
            )}
          </div>

          <div className="security-badge">
            <i className="fas fa-shield-alt"></i>
            <div className="security-text">
              Your payment information is encrypted and secure. We use industry-standard security measures to protect your data.
            </div>
          </div>
        </div>

        {/* Order Summary Section */}
        <div className="order-summary">
          <h2>Booking Summary</h2>
          
          <div className="booking-details">
            <div className="booking-header">
              <div className="provider-avatar">
                {bookingSummary.provider_name.charAt(0)}
              </div>
              <div className="booking-info">
                <h3>{bookingSummary.provider_name}</h3>
                <div className="booking-meta">
                  Professional Service Provider
                </div>
              </div>
            </div>
          </div>

          <div className="summary-items">
            <div className="summary-item">
              <span className="summary-label">
                <i className="far fa-calendar"></i>
                Date
              </span>
              <span className="summary-value">{bookingSummary.booking_date}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">
                <i className="far fa-clock"></i>
                Time Slot
              </span>
              <span className="summary-value">{bookingSummary.time_slot}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">
                <i className="far fa-map-marker-alt"></i>
                Location
              </span>
              {user && <span className="summary-value">{user.address}</span>}
            </div>
          </div>

          <div className="price-breakdown">
          <div className="price-item">
              <span>Service Fee</span>
              <span>€{bookingSummary.price}</span>
            </div>
            <div className="price-item">
              <span>Platform Fee</span>
              <span>€{platform_fee}</span>
            </div>
            <div className="total-amount">
              <span className="total-label">Total Amount</span>
              <span className="total-value">€{total_fees}</span>
            </div>
          </div>

          <div className="booking-guarantee">
            <i className="fas fa-shield-alt guarantee-icon"></i>
            <p className="guarantee-text">
              Your booking is protected by our satisfaction guarantee. 100% money-back if you're not satisfied.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
