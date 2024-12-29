import React, { useState, useEffect } from 'react';
import { getProviderDashboard, updateUserInfo, fetchUserInfo, fetchAllSubservices, logout, } from '../api';
import '../page_styles/provider_dashboard.css';
import UpdateAvailabilityModal from './UpdateAvailabilityModal';
import SubservicesModal from './SubservicesModal';
import ChatBox from './ChatBox';
import Toast from './Toast';
import { useUser } from '../userContext';

const ProviderDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    total_earnings: 0,
    completed_bookings: 0,
    pending_payments: 0,
    recent_bookings: [],
    upcoming_bookings: [],
    pending_payouts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [showSubservicesModal, setShowSubservicesModal] = useState(false);
  const [subservices, setSubservices] = useState([]);
  const { user, loading: userLoading, setUser } = useUser();
  const [chatClient, setChatClient] = useState(null);
  const [pageLoading, setPageLoading] = useState(false);
  const [toast, setToast] = useState(null);

  console.log('User data in ProviderDashboard:', user);

  const fetchDashboard = async () => {
    try {
      const data = await getProviderDashboard();
      console.log('Dashboard data received:', data); // Debug log
      
      // Ensure upcoming_bookings exists and has required properties
      if (data?.upcoming_bookings) {
        data.upcoming_bookings = data.upcoming_bookings.map(booking => ({
          ...booking,
          id: booking._id || booking.id, // Handle both MongoDB _id and regular id
          client_id: booking.client_id?.toString(), // Ensure client_id is string
        }));
      }
      
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSubservices = async () => {
    try {
      const data = await fetchAllSubservices();
      setSubservices(data);
    } catch (error) {
      console.error('Error fetching subservices:', error);
    }
  };

  useEffect(() => {
    if (user) {
      console.log('User data in ProviderDashboard:', {
        user,
        available_dates: user.available_dates,
        blocked_dates: user.blocked_dates,
        type: typeof user.available_dates,
        keys: user.available_dates ? Object.keys(user.available_dates) : []
      });
      fetchDashboard();
      fetchAvailableSubservices();
    }
  }, [user]);

  const handleSubserviceChange = (subserviceId) => {
    setUser(prev => {
      const updatedSubservices = prev.services_offered.includes(subserviceId)
        ? prev.services_offered.filter(id => id !== subserviceId)
        : [...prev.services_offered, subserviceId];

      return { ...prev, services_offered: updatedSubservices };
    });
  };

  const handleUpdateAvailability = async (availabilityData) => {
    console.log('handleUpdateAvailability 555555', availabilityData);
    try {
      await updateUserInfo({
        id: user.id,
        ...availabilityData
      });
      
      // Fetch updated user data
      const updatedUser = await fetchUserInfo();
      setUser(updatedUser);
      
      // Refresh dashboard data
      await fetchDashboard();
      
    } catch (error) {
      console.error('Failed to update availability:', error);
      throw error;
    }
  };

  const handleUpdateSubservices = async (subservicesData) => {
    try {
      await updateUserInfo({
        id: user.id,
        services_offered: subservicesData
      });
      setToast({ message: 'Services updated successfully!', type: 'success' });
    } catch (error) {
      console.error('Failed to update subservices:', error);
      setToast({ message: 'Failed to update services.', type: 'error' });
    }
  };

  const handleChatWithClient = (booking) => {
    console.log('Booking object:', booking); // Debug log

    // Check if required properties exist
    if (!booking?.id || !booking?.client_id || !user?.id) {
      console.error('Missing required properties:', {
        bookingId: booking?.id,
        clientId: booking?.client_id,
        userId: user?.id
      });
      return;
    }

    const params = {
      booking_id: booking.id.toString(),
      provider_id: user.id.toString(),
      client_id: booking.client_id.toString(),
      provider_name: user.name || 'Provider',
      client_name: booking.metadata?.[booking.client_id]?.name || 'Client',
      currentUserId: user.id.toString(),
      currentUserType: 'PROVIDER'
    };


    setChatClient(params);


    console.log('Chat params in provider dashboard:', params);

    
  };

  const handleLogout = async () => {
    try {
      setPageLoading(true);
      // Call the logout function which will handle the redirect
      await logout();
    } catch (error) {
      console.error('Error during logout:', error);
      // The logout function will handle the redirect even if there's an error
    }
  };

  if (userLoading || loading) return <div className="dashboard-loading">Loading dashboard...</div>;
  if (error) return <div className="dashboard-error">{error}</div>;
  if (!user) return <div className="dashboard-error">User not found</div>;

  return (
    <div className="provider-dashboard">
      {pageLoading ? (
        <div className="page-loader">
          <div className="loader-content">
            <div className="loader-spinner">
              <img src="/logo.png" alt="SAHAYAK" />
            </div>
            <p>Logging out...</p>
            <div className="loader-progress"></div>
          </div>
        </div>
      ) : (
        <>
          <div className="dashboard-header">
            <h1>Provider Dashboard</h1>
            <div className="header-actions">
              <div className="quick-actions">
                <button 
                  className="action-btn"
                  onClick={() => setShowAvailabilityModal(true)}
                >
                  <i className="fas fa-calendar-plus"></i>
                  Update Availability
                </button>
                <button 
                  className="action-btn"
                  onClick={() => setShowSubservicesModal(true)}
                >
                  <i className="fas fa-cogs"></i>
                  Update Services
                </button>
              </div>
              <button 
                className="logout-btn"
                onClick={handleLogout}
              >
                <i className="fas fa-sign-out-alt"></i>
                Logout
              </button>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Earnings</h3>
              <p className="amount">€{dashboardData?.total_earnings || 0}</p>
              <span className="label">(From completed payments)</span>
            </div>

            <div className="stat-card bookings">
              <div className="stat-icon">
                <i className="fas fa-calendar-check"></i>
              </div>
              <div className="stat-content">
                <h3>Completed Bookings</h3>
                <p className="stat-value">{dashboardData.completed_bookings}</p>
              </div>
            </div>

            <div className="stat-card pending">
              <div className="stat-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="stat-content">
                <h3>Pending Bookings</h3>
                <p className="stat-value">{dashboardData.pending_payments}</p>
              </div>
            </div>
          </div>

          <div className="dashboard-content">
            <div className="upcoming-bookings">
              <h2>Upcoming Bookings</h2>
              <div className="bookings-list">
                {dashboardData?.upcoming_bookings?.length > 0 ? (
                  dashboardData.upcoming_bookings.map(booking => {
                    // Skip bookings without required properties
                    if (!booking?.id || !booking?.client_id) {
                      console.warn('Booking missing required properties:', booking);
                      return null;
                    }
                    
                    return (
                      <div key={booking.id} className="booking-card">
                        <div className="booking-header">
                          <h3>{booking.service_name}</h3>
                          <span className={`booking-status ${booking.status.toLowerCase()}`}>
                            {booking.status}
                          </span>
                        </div>
                        <div className="booking-details">
                          <p>
                            <i className="fas fa-calendar"></i>
                            {new Date(booking.booked_date).toLocaleDateString()}
                          </p>
                          <p>
                            <i className="fas fa-clock"></i>
                            {new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                            {new Date(booking.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p>
                            <i className="fas fa-euro-sign"></i>
                            {booking.total_price}
                          </p>
                        </div>
                        <div className="booking-actions">
                          <button 
                            className="dashboard-btn primary"
                            onClick={() => {
                              try {
                                handleChatWithClient(booking);
                              } catch (error) {
                                console.error('Error initiating chat:', error);
                                // Optionally show an error message to the user
                              }
                            }}
                          >
                            <i className="fas fa-comments"></i>
                            Chat with Client
                          </button>
                          <button className="dashboard-btn secondary">
                            <i className="fas fa-info-circle"></i>
                            View Details
                          </button>
                        </div>
                      </div>
                    );
                  }).filter(Boolean) // Remove null entries
                ) : (
                  <p className="no-bookings">No upcoming bookings</p>
                )}
              </div>
            </div>

            <div className="recent-activity">
              <h2>Recent Activity</h2>
              <div className="activity-list">
                {dashboardData?.recent_bookings?.length > 0 ? (
                  dashboardData.recent_bookings.map(booking => (
                    <div key={booking.id} className="activity-item">
                      <div className="activity-icon">
                        <i className={`fas fa-${getBookingStatusIcon(booking.status)}`}></i>
                      </div>
                      <div className="activity-content">
                        <h4>{booking.service_name}</h4>
                        <p>{new Date(booking.booked_date).toLocaleDateString()}</p>
                        <span className={`status ${booking.status.toLowerCase()}`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="activity-price">
                        €{booking.total_price}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-activity">No recent activity</p>
                )}
              </div>
            </div>
          </div>

          {showSubservicesModal && (
            <SubservicesModal
              show={showSubservicesModal}
              onClose={() => setShowSubservicesModal(false)}
              subservices={subservices}
              selectedSubservices={user.services_offered}
              onSubserviceChange={handleSubserviceChange}
              onSave={handleUpdateSubservices}
            />
          )}

          {showAvailabilityModal && (
            <UpdateAvailabilityModal
              show={showAvailabilityModal}
              onClose={() => setShowAvailabilityModal(false)}
              onSave={handleUpdateAvailability}
              currentAvailability={user}
            />
          )}

          {chatClient && (
            <ChatBox 
              booking_id={chatClient.booking_id}
              provider_id={chatClient.provider_id}
              client_id={chatClient.client_id}
              provider_name={chatClient.provider_name}
              client_name={chatClient.client_name}
              currentUserId={chatClient.currentUserId}
              currentUserType={chatClient.currentUserType}
              onClose={() => setChatClient(null)}
            />
          )}

          {toast && (
            <Toast 
              message={toast.message} 
              type={toast.type} 
              onClose={() => setToast(null)} 
            />
          )}
        </>
      )}
    </div>
  );
};

const getBookingStatusIcon = (status) => {
  switch (status) {
    case 'COMPLETED': return 'check-circle';
    case 'PENDING': return 'clock';
    case 'CONFIRMED': return 'calendar-check';
    default: return 'info-circle';
  }
};

export default ProviderDashboard; 