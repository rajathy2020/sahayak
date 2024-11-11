import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchServiceProviders, postBooking, fetchUserInfo } from './api';
import './page_styles/service_provider.css';
import './page_styles/booking_summary.css';

const ServiceProviderCard = ({ provider, handleBookingClick }) => {
  return (
    <div className="service-provider-card">
      {/* Provider Image */}
      <img
        src={provider.image || 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'}
        alt={provider.name}
        className="provider-image"
      />

      {/* Provider Information */}
      <div className="provider-info">
        <h3 className="provider-name">{provider.name}</h3>
        <p className="provider-description">
          {provider.description}
        </p>
      </div>

      {/* Book Now Button */}
      <button className="book-button" onClick={() => handleBookingClick(provider)}>
        Book Now
      </button>
    </div>
  );
};


const BookingSummaryModal = ({ provider, selectedDate, selectedTimeSlot, onClose, onProceed }) => {
  if (!provider) return null; // Return null if no provider is selected

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Booking Summary</h2>
        <p><strong>Provider:</strong> {provider.name}</p>
        <p><strong>Date:</strong> {selectedDate}</p>
        <p><strong>Time Slot:</strong> {selectedTimeSlot}</p>

        {/* Close Modal Button */}
        <button className="close-modal-button" onClick={onClose}>Close</button>

        {/* Proceed to Payment Button */}
        <button className="proceed-button" onClick={onProceed}>Proceed to Payment</button>
      </div>
    </div>
  );
};


const ServiceProviderPage = () => {
  const [selectedServiceProviders, setSelectedServiceProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const location = useLocation();
  const [selectedProvider, setSelectedProvider] = useState(null); // Track selected provider for modal
  const [isModalOpen, setIsModalOpen] = useState(false); // Track modal visibility
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const [selectedDate, setSelectedDate] = useState(getCurrentDate());

  // Fetch query parameters from the URL
  const getQueryParams = () => {
    const params = new URLSearchParams(location.search);
    const requestParams = {};
    for (let [key, value] of params.entries()) {
      requestParams[key] = value;
    }
    return requestParams;
  };

  // Function to fetch service providers
  const getServiceProviders = async (params = {}) => {
    try {
      const response = await fetchServiceProviders(params);
      setSelectedServiceProviders(response);
    } catch (error) {
      setError('Failed to get service providers');
    } finally {
      setLoading(false);
    }
  };


  const getUser = async () => {
    try {
      const response = await fetchUserInfo();
      setUser(response);
    } catch (error) {
      setError('Failed to get user');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle "Book Now" button click
  const handleBookingClick = (provider) => {
    if (!selectedDate || !selectedTimeSlot) {
      setError('Please select a date and time slot before booking.');
      return;
    }
    const requestParams = location.state || getQueryParams();

    const providerData = {
      "provider_id": provider.id,
      "provider_name": provider.name,
      "booking_date": selectedDate,
      "booking_slot": selectedTimeSlot
    }



    const bookingData = {
      "sub_service_names": requestParams,
      "provider_id": provider.id,
      "client_id": user.id,
      "time_slot": selectedTimeSlot,
      "booked_date": `${selectedDate}T00:00:00Z`,
    }


    setSelectedProvider(provider);
    postBooking(bookingData)
    // Convert provider data into query parameters
    const queryParams = new URLSearchParams(providerData).toString();

    // Navigate to /service_providers with the form data as query parameters
    navigate(`/checkout?${queryParams}`);
  };

  // Function to handle booking creation and close modal
  const handleProceedToPayment = async () => {
    try {
      const requestParams = location.state || getQueryParams();

      const bookingDetails = {
        sub_service_names: requestParams,
        provider_id: selectedProvider.id,
        client_id: 'client-id-placeholder', // Replace with actual client ID (from user session or context)
        time_slot: selectedTimeSlot,
        booked_date: `${selectedDate}T00:00:00Z`,
      };

      // Simulate booking success
      console.log(`Booking confirmed for ${selectedDate} during ${selectedTimeSlot}`)
      setSuccessMessage(`Booking confirmed for ${selectedDate} during ${selectedTimeSlot}`);
      setError(null);
      setIsModalOpen(false); // Close the modal after successful booking
      navigate('/checkout');
    } catch (error) {
      setError('Failed to create booking. Please try again.');
      setSuccessMessage(null);
    }
  };

  // Fetch services when the page loads
  useEffect(() => {
    const requestParams = location.state || getQueryParams();
    getUser();
    getServiceProviders(requestParams);

  }, [location.state, location.search]);

  // Function to render the notification
  const renderNotification = () => {
    if (successMessage) {
      return <div className="notification success">{successMessage}</div>;
    }
    if (error) {
      return <div className="notification error">{error}</div>;
    }
    return null;
  };

  // Render loading state if the data is still being fetched
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="service-provider-page">
      {renderNotification()}

      {/* Sidebar for filters */}
      <div className="sidebar">
    

        {/* Date Selection */}
        <div className="filter-section">
          <label htmlFor="date-picker">Select Date:</label>
          <input
            type="date"
            id="date-picker"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {/* Time Slot Selection */}
        <div className="filter-section">
          <label htmlFor="time-slot">Select Time Slot:</label>
          <select
            id="time-slot"
            value={selectedTimeSlot}
            onChange={(e) => setSelectedTimeSlot(e.target.value)}
          >
            <option value="">--Select a Time Slot--</option>
            <option value="9am-12pm">9am - 12pm</option>
            <option value="12pm-3pm">12pm - 3pm</option>
            <option value="3pm-6pm">3pm - 6pm</option>
            <option value="6pm-9pm">6pm - 9pm</option>
          </select>
        </div>
        <h2>More filters</h2>

      </div>

      {/* Main content area for service provider profiles */}
      <div className="content">
        <h1>Available Service Providers</h1>
        <div className="service-providers-list">
          {selectedServiceProviders.map((provider) => (
            <ServiceProviderCard
              key={provider.id}
              provider={provider}
              handleBookingClick={handleBookingClick}
            />
          ))}
        </div>
      </div>

      {/* Booking Summary Modal */}
      {isModalOpen && (
        <BookingSummaryModal
          provider={selectedProvider}
          selectedDate={selectedDate}
          selectedTimeSlot={selectedTimeSlot}
          onClose={() => setIsModalOpen(false)} 
          onProceed={handleProceedToPayment}
        />
      )}
    </div>
  );
};

export default ServiceProviderPage;
