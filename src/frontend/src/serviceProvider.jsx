import { React, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchServiceProviders, createBooking } from './api';
import './page_styles/service_provider.css';

const ServiceProviderCard = ({ provider, postBooking }) => {
  return (
    <div className="service-provider-card">
      {/* Provider Image */}
      <img
        src={provider.image || 'default-image-url'}
        alt={provider.name}
        className="provider-image"
      />

      {/* Provider Information */}
      <div className="provider-info">
        <h3 className="provider-name">{provider.name}</h3>
        <p className="provider-description">
          {provider.description || 'No description provided'}
        </p>
        <p className="provider-services">
          {provider.services_offered && provider.services_offered.join(', ')}
        </p>
      </div>

      {/* Book Now Button */}
      <button className="book-button" onClick={() => postBooking(provider.id)}>
        Book Now
      </button>
    </div>
  );
};

const ServiceProviderPage = () => {
  const [selectedServiceProviders, setSelectedServiceProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // To track error
  const [successMessage, setSuccessMessage] = useState(null); // To track success message
  const location = useLocation();
  const [booking, setBooking] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(''); // Track selected time slot
  const [selectedDate, setSelectedDate] = useState(''); // Track selected date

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

  // Function to post booking
  const postBooking = async (provider_id) => {
    try {
      const requestParams = location.state || getQueryParams();
      const bookingDetails = {
        sub_service_names: requestParams,
        provider_id: provider_id, // Provider ID
        client_id: 'client-id-placeholder', // Replace with actual client ID (from user session or context)
        time_slot: selectedTimeSlot, // Use the selected time slot
        booked_date: `${selectedDate}T00:00:00Z`, // Combine selected date with a time to form a full datetime
      };

      const response = await createBooking(bookingDetails);
      setBooking(response);
      setSuccessMessage(`Booking confirmed for ${selectedDate} during ${selectedTimeSlot}`);
      setError(null); // Reset any previous error message
    } catch (error) {
      setError('Failed to create booking. Please try again.');
      setSuccessMessage(null); // Reset success message if there's an error
    } finally {
      setLoading(false);
    }
  };

  // Fetch services when the page loads
  useEffect(() => {
    const requestParams = location.state || getQueryParams();
    getServiceProviders(requestParams);
  }, [location.state, location.search]); // Depend on location state and search query

  // Conditionally render success or error notifications
  const renderNotification = () => {
    if (successMessage) {
      return <div className="notification success">{successMessage}</div>;
    }
    if (error) {
      return <div className="notification error">{error}</div>;
    }
    return null;
  };

  if (loading) {
    return <div>Loading...</div>; // Show a loading indicator while data is being fetched
  }

  return (
    <div className="service-provider-page">
      {/* Notification Section */}
      {renderNotification()}

      {/* Sidebar for filters */}
      <div className="sidebar">
        <h2>Filters</h2>

        {/* Date Selection */}
        <div className="filter-section">
          <label htmlFor="date-picker">Select Date:</label>
          <input
            type="date"
            id="date-picker"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)} // Update date state
          />
        </div>

        {/* Time Slot Selection */}
        <div className="filter-section">
          <label htmlFor="time-slot">Select Time Slot:</label>
          <select
            id="time-slot"
            value={selectedTimeSlot}
            onChange={(e) => setSelectedTimeSlot(e.target.value)} // Update time slot state
          >
            <option value="">--Select a Time Slot--</option>
            <option value="9am-12pm">9am - 12pm</option>
            <option value="12pm-3pm">12pm - 3pm</option>
            <option value="3pm-6pm">3pm - 6pm</option>
            <option value="6pm-9pm">6pm - 9pm</option>
          </select>
        </div>
      </div>

      {/* Main content area for service provider profiles */}
      <div className="content">
        <h1>Service Providers</h1>
        <div className="service-providers-list">
          {selectedServiceProviders.map((provider) => (
            <ServiceProviderCard key={provider.id} provider={provider} postBooking={postBooking} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServiceProviderPage;
