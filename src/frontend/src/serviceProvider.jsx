import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchServiceProviders, fetchUserBookings, postBooking, fetchUserInfo } from './api';
import './page_styles/service_provider.css';
import './page_styles/booking_summary.css';
import ChatBox from './components/ChatBox';

const ServiceProviderCard = ({ provider, handleBookingClick, onChatClick }) => {
  return (
    <div className="service-provider-card">
      {/* Provider Image */}
      <img
        src={provider.image_url || 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'}
        alt={provider.name}
        className="provider-image"
      />

      {/* Provider Information */}
      <div className="provider-info">
        <h3 className="provider-name">{provider.name}</h3>
        <p className="provider-description">{provider.description}</p>

        {/* Ratings Section */}
        <div className="provider-ratings">
          <span className="average-rating">Average Rating: {provider.ratings.average.toFixed(1)} ⭐</span>
          <span className="total-ratings">({provider.ratings.count} ratings)</span>
          <div className="comments">
            {provider.ratings.comments.slice(0, 3).map((comment, index) => (
              <p key={index} className="comment">{comment}</p>
            ))}
          </div>
        </div>
      </div>

      <div className="card-actions">
        <button className="book-button" onClick={() => handleBookingClick(provider)}>
          Book Now
        </button>
        <button className="chat-button" onClick={() => onChatClick(provider)}>
          Chat with Provider
        </button>
      </div>
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
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('9am-12pm');
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [chatProvider, setChatProvider] = useState(null);
  const taskFormData = location.state?.taskFormData; // Retrieve the data from state

  console.log("taskFormData", taskFormData);

  const handleFilters = async (filterType, value) => {
    console.log("filterType", filterType, value)
    if (filterType === 'timeSlot') {
      setSelectedTimeSlot(value);
    } else if (filterType === 'date') {
      setSelectedDate(value);
    }

    const requestParams = taskFormData || getQueryParams();

    console.log("requestParams55555sssss", requestParams, taskFormData);

    
    // Update the filter parameters
    if (filterType === 'timeSlot') {
      requestParams.available_time_slots = value;
      requestParams.requested_date = selectedDate;
    }
    if (filterType === 'date') {
      requestParams.available_time_slots = selectedTimeSlot; // 
      requestParams.requested_date = value; // Always include the selected date
    }


    console.log("requestParams", requestParams);
    await getServiceProviders(requestParams, false);
  };

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
  const getServiceProviders = async (params = {}, isInitialLoad = false) => {
    if (isInitialLoad) {
      setLoading(true);
    }
    
    try {
      const response = await fetchServiceProviders(params);
      setSelectedServiceProviders(response);
    } catch (error) {
      setError('Failed to get service providers');
    } finally {
      if (isInitialLoad) {
        setTimeout(() => {
          setLoading(false);
        }, 800);
      }
    }
  };


  const getUser = async () => {
    try {
      const response = await fetchUserInfo();
      setUser(response);
    } catch (error) {
      setError('Failed to get user');
      navigate('/login');
      
    } finally {
      setLoading(false);
    }
  };

  // Function to handle "Book Now" button click
  const handleBookingClick = async (provider) => {
    if (!selectedDate || !selectedTimeSlot) {
      setError('Please select a date and time slot before booking.');
      return;
    }

    // Show loading state
    setLoading(true);
   
    try {
      const bookings = await fetchUserBookings();
      if (bookings.length >= 10) {
        alert('You have reached your free booking limit of 10. Please subscribe to book more services.');
        setLoading(false);
        return;
      }

      const requestParams = location.state.taskFormData || getQueryParams();
      const bookingData = {
        "sub_service_names": requestParams,
        "provider_id": provider.id,
        "client_id": user.id,
        "time_slot": selectedTimeSlot,
        "booked_date": `${selectedDate}T00:00:00Z`,
        "price": requestParams.price,
        "metadata":requestParams
      }

      setSelectedProvider(provider);
      const booking = await postBooking(bookingData);
      
      const providerData = {
        "provider_id": provider.id,
        "provider_name": provider.name,
        "booking_date": selectedDate,
        "booking_slot": selectedTimeSlot,
        "price": requestParams.price,
        "booking_id": booking.id,
        "loading": true // Add loading state to URL params
      }

      const queryParams = new URLSearchParams(providerData).toString();
      // i want to pass same i did for taskFormData 
      //  navigate('/service_providers', { state: { taskFormData: updatedFormData } });
      navigate('/checkout', { state: { providerData: providerData } });
     

    } catch (error) {
      setError('Failed to process booking. Please try again.');
      setLoading(false);
    }
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
    const requestParams = location.state.taskFormData || getQueryParams();

    console.log("requestParams55555sssss", requestParams);
    
    
    // Retrieve data from sessionStorage
    
    if (!requestParams.available_time_slots) {
        requestParams.available_time_slots = '9am-12pm';
    }
    getUser();
    getServiceProviders(requestParams, true);
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

  const handleChatClick = (provider) => {
    setChatProvider(provider);
  };

  // Render loading state if the data is still being fetched
  if (loading) {
    return (
      <div className="page-loader">
        <div className="loader-content">
          <div className="loader-spinner">
            <img 
              src="/logo.png"
              alt="SAHAYAK"
            />
          </div>
          <p>Finding Available Providers</p>
          <div className="loader-progress"></div>
          <div className="loader-steps">
            Matching your requirements...
          </div>
        </div>
      </div>
    );
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
            onChange={(e) => handleFilters('date', e.target.value)}
            min={getCurrentDate()}
          />
        </div>

        {/* Time Slot Selection */}
        <div className="filter-section">
          <label htmlFor="time-slot">Select Time Slot:</label>
          <select
            id="time-slot"
            value={selectedTimeSlot}
            onChange={(e) => handleFilters('timeSlot', e.target.value)}
          >
            <option value="9am-12pm">9am - 12pm</option>
            <option value="12pm-3pm">12pm - 3pm</option>
            <option value="3pm-8pm">3pm - 8pm</option>
            <option value="8pm-11pm">8pm - 11pm</option>
          </select>
        </div>

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
              onChatClick={handleChatClick}
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

      {chatProvider && (
        <ChatBox 
          provider={chatProvider} 
          onClose={() => setChatProvider(null)}
        />
      )}
    </div>
  );
};

export default ServiceProviderPage;
