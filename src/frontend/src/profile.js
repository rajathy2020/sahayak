// ProfilePage.js
import React, { useState, useEffect } from 'react';
import './page_styles/profile.css';
import { fetchUserBookings, initiateChatWithProvider, transferProviderPayment, fetchUserInfo, updateUserInfo } from './api';
import ChatBox from './components/ChatBox';

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
  const [chatProvider, setChatProvider] = useState(null);

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
      console.log('Raw bookings response:', response); // Debug log
      
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
      
      console.log('Formatted bookings:', formattedBookings); // Debug log
      setBookings(formattedBookings);
    } catch (error) {
      console.error('Error in getUserBookings:', error); // Debug error
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to initiate chat with the provider
  const handleChat = (providerId, providerName) => {
    const provider = {
      id: providerId,
      name: providerName
    };
    setChatProvider(provider);
  };

  const handleProviderPayment = (booking) => {
    const params = {
      provider_id: booking.provider_id,
      amount: booking.total_price * 100,
    };
    transferProviderPayment(params);
  };


  const handleAddPayment = () => {
    // Implement payment method addition logic here
    console.log('Add Payment Method clicked');
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    // Handle image upload
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSaveProfile();
  };

  return (
    <div className="profile-page">
      {/* Sidebar Navigation */}
      <div className="profile-sidebar">
        <button 
          data-section="profile"
          className={selectedSection === 'profile' ? 'active' : ''}
          onClick={() => setSelectedSection('profile')}
        >
          Edit Profile
        </button>
        <button 
          data-section="bookings"
          className={selectedSection === 'bookings' ? 'active' : ''}
          onClick={() => setSelectedSection('bookings')}
        >
          My Bookings
        </button>
        <button 
          data-section="payment"
          className={selectedSection === 'payment' ? 'active' : ''}
          onClick={() => setSelectedSection('payment')}
        >
          Payment Info
        </button>
      </div>

      {/* Content Section */}
      <div className="profile-content">
        {selectedSection === 'profile' && (
          <div className="profile-info">
            <div className="profile-header">
              <div className="profile-avatar">
                <img 
                  src={userInfo.image_url || 'https://via.placeholder.com/120'} 
                  alt={userInfo.name} 
                />
                <label className="avatar-upload">
                  <input type="file" accept="image/*" onChange={handleImageUpload} />
                </label>
              </div>
              <h2>Edit Profile Information</h2>
            </div>

            {loading ? (
              <div className="profile-skeleton">
                <div className="profile-header">
                  <div className="avatar-skeleton skeleton" />
                  <div className="text-skeleton title skeleton" />
                </div>
                
                <div className="profile-form">
                  <div className="form-group">
                    <div className="text-skeleton short skeleton" />
                    <div className="input-skeleton skeleton" />
                  </div>
                  
                  <div className="form-group">
                    <div className="text-skeleton short skeleton" />
                    <div className="input-skeleton skeleton" />
                  </div>
                  
                  <div className="form-group">
                    <div className="text-skeleton short skeleton" />
                    <div className="input-skeleton skeleton" />
                  </div>
                  
                  <div className="form-group">
                    <div className="text-skeleton short skeleton" />
                    <div className="input-skeleton skeleton" />
                  </div>
                  
                  <div className="form-group full-width">
                    <div className="text-skeleton medium skeleton" />
                    <div className="input-skeleton skeleton" />
                  </div>
                  
                  <div className="form-actions">
                    <div className="button-skeleton skeleton" />
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : (
              <form className="profile-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={userInfo.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="form-group disabled">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={userInfo.email}
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>WhatsApp Number</label>
                  <input
                    type="tel"
                    name="whatsappNumber"
                    value={userInfo.whatsappNumber}
                    onChange={handleInputChange}
                    placeholder="Enter your WhatsApp number"
                  />
                </div>

                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={userInfo.city}
                    onChange={handleInputChange}
                    placeholder="Enter your city"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Address</label>
                  <input
                    type="text"
                    name="address"
                    value={userInfo.address}
                    onChange={handleInputChange}
                    placeholder="Enter your full address"
                  />
                </div>

                <div className="form-actions">
                  <button type="button" className="cancel-button">
                    Cancel
                  </button>
                  <button type="submit" className="save-button">
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {selectedSection === 'bookings' && (
          <div className="bookings">
            <h2>My Bookings</h2>
            {loading ? (
              <div className="bookings-skeleton">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="booking-list-item skeleton">
                    <div className="text-skeleton short skeleton" />
                    <div className="text-skeleton medium skeleton" />
                    <div className="text-skeleton long skeleton" />
                    <div className="button-group">
                      <div className="button-skeleton skeleton" />
                      <div className="button-skeleton skeleton" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : bookings.length > 0 ? (
              <ul className="bookings-list">
                {bookings.map((booking) => (
                  <li key={booking._id} className={`booking-list-item ${booking.status === 'EXPIRED' ? 'expired' : ''}`}>
                    <div className="booking-details">
                      <span className={`booking-status status-${(booking.status || 'pending').toLowerCase()}`}>
                        {booking.status || 'Pending'}
                      </span>
                      <p><strong>Services:</strong></p>
                      <ul>
                        {booking.services.map((service, index) => (
                          <li key={index}>{service}</li>
                        ))}
                      </ul>
                      <p><strong>Provider:</strong> {booking.provider_name}</p>
                      <p><strong>Date:</strong> {new Date(booking.booked_date).toLocaleDateString()}</p>
                      <p><strong>Time Slot:</strong> {booking.time_slot}</p>
                      <p><strong>Start Time:</strong> {new Date(booking.start_time).toLocaleTimeString()}</p>
                      <p><strong>End Time:</strong> {new Date(booking.end_time).toLocaleTimeString()}</p>
                      <p><strong>Price:</strong> €{booking.total_price}</p>
                    </div>
                    {booking.status !== 'EXPIRED' && (
                      <div className="button-group">
                        <button
                          className="chat-button"
                          onClick={() => handleChat(booking.provider_id, booking.provider_name)}
                        >
                          Chat with Provider
                        </button>
                        <button
                          className="details-button"
                          onClick={() => handleProviderPayment(booking)}
                        >
                           <p><strong>Pay :</strong> {booking.provider_name}</p>
                        </button>
                      </div>
                    )}
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
            <div className="payment-header">
              <h2>Payment Methods</h2>
              <button className="add-payment-button" onClick={handleAddPayment}>
                Add Payment Method
              </button>
            </div>

            {loading ? (
              <div className="payment-skeleton">
                <div className="text-skeleton title skeleton" />
                <div className="payment-methods-list">
                  {[1, 2].map((n) => (
                    <div key={n} className="payment-method-item skeleton">
                      <div className="text-skeleton short skeleton" />
                      <div className="text-skeleton medium skeleton" />
                      <div className="text-skeleton medium skeleton" />
                      <div className="text-skeleton short skeleton" />
                      <div className="card-actions">
                        <div className="button-skeleton skeleton" />
                        <div className="button-skeleton skeleton" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : userInfo.stripe_paymemt_methods?.length > 0 ? (
              <ul className="payment-methods-list">
                {userInfo.stripe_paymemt_methods.map((method, index) => (
                  <li key={index} className="payment-method-item">
                    {index === 0 && <span className="default-badge">Default</span>}
                    <div 
                      className="card-brand-logo" 
                      style={{ backgroundImage: `url(/card-brands/${method.brand}.png)` }} 
                    />
                    <p><strong>Card Number:</strong> •••• {method.last4}</p>
                    <p><strong>Expiration:</strong> {method.exp_month}/{method.exp_year}</p>
                    <p><strong>Card Type:</strong> {method.brand}</p>
                    <p><strong>Country:</strong> {method.country}</p>
                    
                    <div className="card-actions">
                      <button className="card-action-button edit-card">
                        Edit Card
                      </button>
                      <button className="card-action-button remove-card">
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="no-payment-methods">
                <h3>No Payment Methods Added</h3>
                <p>Add a payment method to start booking services</p>
                <button className="add-payment-button" onClick={handleAddPayment}>
                  Add Your First Payment Method
                </button>
              </div>
            )}
          </div>
        )}

        {chatProvider && (
          <ChatBox 
            provider={chatProvider} 
            onClose={() => setChatProvider(null)}
          />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
