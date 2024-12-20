import React, { useState, useEffect } from 'react';
import { fetchAllSubservices, createServiceProviderAccount, getServiceProviderOnboardLink, updateUserInfo, checkProviderPaymentInfo } from '../api';
import '../page_styles/service_provider_modal.css';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { TimeSlot, TIME_SLOTS } from '../models.ts';

const ServiceProviderOnboardingModal = ({ show, onClose, onSave, user }) => {
  const [formData, setFormData] = useState({
    services_offered: [],
    available_time_slots: [],
    available_dates: {},
    blocked_dates: [],
    description: '',
    hourly_rate: '',
  });

  const [subservices, setSubservices] = useState([]);
  const [paymentInfo, setPaymentInfo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedDates, setSelectedDates] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [step, setStep] = useState('available'); // 'available' or 'blocked'
  const [dateRange, setDateRange] = useState(null);

  const [dateFilters, setDateFilters] = useState({
    showAvailable: true,
    showBlocked: true
  });

  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle', 'saving', 'creating_account', 'redirecting'

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await fetchAllSubservices();
        const payment_info = await checkProviderPaymentInfo();
        console.log('Fetched subservices:', data); // Debug log
        setSubservices(data);
        setPaymentInfo(payment_info);
      } catch (error) {
        console.error('Failed to load services:', error);
        setError('Failed to load services');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Group subservices by parent service
  const groupedServices = subservices.reduce((acc, sub) => {
    console.log('Processing subservice:', sub); // Debug log
    const parentId = sub.parent_service_id;
    if (!acc[parentId]) {
      acc[parentId] = {
        id: parentId,
        name: sub.parent_service_name || 'Unknown Service',
        icon: sub.parent_service_icon || 'fas fa-concierge-bell',
        subservices: []
      };
    }
    acc[parentId].subservices.push({
      id: sub._id || sub.id,
      name: sub.name,
      description: sub.description,
      base_price: sub.base_price
    });
    return acc;
  }, {});

  const handleServiceChange = (serviceId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setFormData(prev => {
      const newServices = prev.services_offered.includes(serviceId.toString())
        ? prev.services_offered.filter(id => id !== serviceId.toString())
        : [...prev.services_offered, serviceId.toString()];
        
      return {
        ...prev,
        services_offered: newServices
      };
    });
  };

  const handleTimeSlotChange = (slot) => {
    setFormData(prev => {
      const newTimeSlots = prev.available_time_slots.includes(slot)
        ? prev.available_time_slots.filter(s => s !== slot)
        : [...prev.available_time_slots, slot];

      // Update available_dates to use new time slots for all selected dates
      const newAvailableDates = { ...prev.available_dates };
      Object.keys(newAvailableDates).forEach(date => {
        newAvailableDates[date] = newTimeSlots;
      });

      return {
        ...prev,
        available_time_slots: newTimeSlots,
        available_dates: newAvailableDates
      };
    });
  };

  const handleBlockedDatesChange = (e) => {
    const dates = e.target.value.split(',').map(date => date.trim());
    setFormData(prev => ({
      ...prev,
      blocked_dates: dates
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.available_time_slots.length === 0) {
      setError('Please select at least one time slot');
      return;
    }

    if (Object.keys(formData.available_dates).length === 0) {
      setError('Please select available dates');
      return;
    }

    try {
      // First save profile data
      setSaveStatus('saving');
      const updateData = {
        id: user.id.toString(),
        services_offered: formData.services_offered,
        available_dates: formData.available_dates,
        blocked_dates: formData.blocked_dates.map(date => new Date(date).toISOString()),
        description: formData.description || '',
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : 0
      };

      const updatedUser = await onSave(updateData);
      
      // If no stripe account, proceed with bank setup
      // If payment info is not complete, proceed with bank setup
      if (!paymentInfo) {
        // Show "Creating Bank Account..." state for 1.5 seconds
        setSaveStatus('creating_account');
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        await createServiceProviderAccount();
        
        // Show "Redirecting to Stripe..." state for 1.5 seconds
        setSaveStatus('redirecting');
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const { setup_url } = await getServiceProviderOnboardLink();
        window.location.assign(setup_url);
      } else {
        setSaveStatus('completed');
        await new Promise(resolve => setTimeout(resolve, 1500));
        onClose();
      }
    } catch (error) {
      console.error('Operation failed:', error);
      setError(error.message || 'Failed to complete setup. Please try again.');
      setSaveStatus('idle');
    }
  };

  const getNextThreeMonths = () => {
    const today = new Date();
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    return { minDate: today, maxDate };
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const handleDateClick = (value) => {
    if (formData.available_time_slots.length === 0) {
      setError('Please select time slots first');
      return;
    }

    if (step === 'available' && Array.isArray(value)) {
      const [start, end] = value;
      const dates = [];
      const currentDate = new Date(start);
      
      while (currentDate <= end) {
        dates.push(formatDate(new Date(currentDate)));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      setSelectedDates(prev => {
        const existingDates = prev.filter(date => !blockedDates.includes(date));
        const newDates = dates.filter(date => !blockedDates.includes(date));
        const mergedDates = [...new Set([...existingDates, ...newDates])];
        
        // Create available_dates dictionary with selected time slots
        const newAvailableDates = { ...formData.available_dates };
        mergedDates.forEach(date => {
          newAvailableDates[date] = formData.available_time_slots;
        });

        setFormData(prevForm => ({
          ...prevForm,
          available_dates: newAvailableDates
        }));
        
        return mergedDates;
      });
      setDateRange(null);
    }
    // For blocked dates, only allow single date selection
    else if (step === 'blocked' && !Array.isArray(value)) {
      const formattedDate = formatDate(value);
      if (selectedDates.includes(formattedDate) && !blockedDates.includes(formattedDate)) {
        setBlockedDates(prev => {
          const newDates = [...prev, formattedDate];
          // Remove blocked date from available dates
          setSelectedDates(current => 
            current.filter(d => d !== formattedDate)
          );
          removeFromAvailableDates(formattedDate);
          setFormData(prevForm => ({
            ...prevForm,
            blocked_dates: newDates
          }));
          return newDates;
        });
      }
    }
    // Allow single click to toggle available dates
    else if (step === 'available' && !Array.isArray(value)) {
      const formattedDate = formatDate(value);
      if (!blockedDates.includes(formattedDate)) {
        setSelectedDates(prev => {
          const newDates = prev.includes(formattedDate)
            ? prev.filter(d => d !== formattedDate)
            : [...prev, formattedDate];
          
          setFormData(prevForm => ({
            ...prevForm,
            available_dates: newDates
          }));
          
          return newDates;
        });
      }
    }
  };

  const handleNextStep = () => {
    if (step === 'available') {
      setStep('blocked');
    }
  };

  const handlePrevStep = () => {
    if (step === 'blocked') {
      setStep('available');
    }
  };

  const handleFilterToggle = (filterType) => {
    setDateFilters(prev => ({
      ...prev,
      [filterType]: !prev[filterType]
    }));
  };

  const handleSelectAll = () => {
    const allSubserviceIds = Object.values(groupedServices).flatMap(
      parent => parent.subservices
        .filter(sub => sub && sub.id)
        .map(sub => sub.id.toString())
    );
    
    const allSelected = allSubserviceIds.length > 0 && allSubserviceIds.every(id => 
      formData.services_offered.includes(id)
    );

    setFormData(prev => ({
      ...prev,
      services_offered: allSelected ? [] : allSubserviceIds
    }));
  };

  const removeFromAvailableDates = (dateToRemove) => {
    setFormData(prev => {
      const newAvailableDates = { ...prev.available_dates };
      delete newAvailableDates[dateToRemove];
      return {
        ...prev,
        available_dates: newAvailableDates
      };
    });
  };

  const getSaveButtonText = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <>
            <span className="spinner"></span>
            Saving Profile...
          </>
        );
      case 'creating_account':
        return (
          <>
            <span className="spinner"></span>
            Creating Bank Account...
          </>
        );
      case 'redirecting':
        return (
          <>
            <span className="spinner"></span>
            Redirecting to Stripe...
          </>
        );
      case 'completed':
        return (
          <>
            <i className="fas fa-check-circle"></i>
            Setup Complete
          </>
        );
      default:
        return (
          <>
            <i className="fas fa-check-circle"></i>
            Save Profile
          </>
        );
    }
  };

  // Update the button styles to be more prominent during different states
  const getButtonStyles = () => {
    switch (saveStatus) {
      case 'saving':
        return 'save-btn saving';
      case 'creating_account':
        return 'save-btn creating';
      case 'redirecting':
        return 'save-btn redirecting';
      case 'completed':
        return 'save-btn completed';
      default:
        return 'save-btn';
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="provider-onboarding-modal">
        <div className="modal-header">
          <h2>Complete Your Provider Profile</h2>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {loading ? (
          <div className="modal-loading">Loading services...</div>
        ) : error ? (
          <div className="modal-error">{error}</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-section">
              <div className="services-header">
                <h3>Services Offered</h3>
                <button 
                  type="button"
                  className="select-all-btn"
                  onClick={handleSelectAll}
                >
                  {Object.values(groupedServices).every(parent => 
                    parent.subservices.length > 0 && 
                    parent.subservices.every(sub => 
                      sub && sub.id && formData.services_offered.includes(sub.id.toString())
                    )
                  ) ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <p className="section-description">
                <i className="fas fa-info-circle"></i>
                Select all the services you can provide
              </p>
              
              {Object.values(groupedServices).map(parent => (
                <div key={parent.id} className="service-category">
                  <h4>
                    <i className={parent.icon || 'fas fa-concierge-bell'}></i>
                    {parent.name}
                  </h4>

                  <div className="services-grid">
                    {parent.subservices.map(sub => (
                      <div 
                        key={sub.id} 
                        className={`service-item ${
                          formData.services_offered.includes(sub.id?.toString()) ? 'selected' : ''
                        }`}
                      >
                        <label className="service-checkbox">
                          <input
                            type="checkbox"
                            checked={formData.services_offered.includes(sub.id?.toString())}
                            onChange={(e) => handleServiceChange(sub.id, e)}
                          />
                          <div className="service-content">
                            <span className="service-name">{sub.name}</span>
                            {sub.base_price && (
                              <span className="service-price">€{sub.base_price}/hr</span>
                            )}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-section">
              <h3>Available Time Slots</h3>
              <p className="section-description">
                <i className="fas fa-info-circle"></i>
                Select your available time slots first
              </p>
              <div className="time-slots-grid">
                {Object.values(TimeSlot).map(slot => (
                  <div 
                    key={slot}
                    className={`time-slot ${
                      formData.available_time_slots.includes(slot) ? 'selected' : ''
                    }`}
                    onClick={() => handleTimeSlotChange(slot)}
                  >
                    {slot}
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-section">
              <div className="dates-header">
                <h3>Availability Calendar</h3>
                <div className="step-indicator">
                  <div className={`step ${step === 'available' ? 'active' : 'completed'}`}>
                    <span className="step-number">1</span>
                    <span className="step-label">Available Dates</span>
                  </div>
                  <div className={`step ${step === 'blocked' ? 'active' : ''}`}>
                    <span className="step-number">2</span>
                    <span className="step-label">Blocked Dates</span>
                  </div>
                </div>
              </div>

              <div className="calendar-wrapper">
                <div className="calendar-instructions">
                  <p>
                    <i className="fas fa-info-circle"></i>
                    {step === 'available' 
                      ? 'Click and drag to select multiple dates, or click individual dates to toggle availability'
                      : 'Click dates to mark them as blocked (only available dates can be blocked)'
                    }
                  </p>
                  {step === 'available' && blockedDates.length > 0 && (
                    <p className="calendar-note">
                      <i className="fas fa-exclamation-circle"></i>
                      Red dates are blocked and cannot be selected
                    </p>
                  )}
                </div>

                <Calendar
                  {...getNextThreeMonths()}
                  tileClassName={({ date }) => {
                    const formattedDate = formatDate(date);
                    const classes = [];
                    
                    if (selectedDates.includes(formattedDate) && dateFilters.showAvailable) {
                      classes.push('available-date');
                    }
                    if (blockedDates.includes(formattedDate) && dateFilters.showBlocked) {
                      classes.push('blocked-date');
                    }
                    return classes.join(' ');
                  }}
                  onChange={handleDateClick}
                  selectRange={step === 'available'}
                  value={step === 'available' ? dateRange : null}
                  tileDisabled={({ date }) => {
                    const formattedDate = formatDate(date);
                    // In blocked dates step, only allow selecting from available dates
                    if (step === 'blocked') {
                      return !selectedDates.includes(formattedDate) || blockedDates.includes(formattedDate);
                    }
                    // In available dates step, don't allow selecting already blocked dates
                    return blockedDates.includes(formattedDate);
                  }}
                />
              </div>

              <div className="calendar-actions">
                {step === 'blocked' && (
                  <button 
                    type="button" 
                    className="calendar-btn back" 
                    onClick={handlePrevStep}
                  >
                    <i className="fas fa-arrow-left"></i>
                    Back to Available Dates
                  </button>
                )}
                {step === 'available' && selectedDates.length > 0 && (
                  <button 
                    type="button" 
                    className="calendar-btn next" 
                    onClick={handleNextStep}
                  >
                    Select Blocked Dates
                    <i className="fas fa-arrow-right"></i>
                  </button>
                )}
              </div>

              <div className="dates-legend">
                <div className="legend-item">
                  <label className="legend-checkbox">
                    <input
                      type="checkbox"
                      checked={dateFilters.showAvailable}
                      onChange={() => handleFilterToggle('showAvailable')}
                    />
                    <span className="legend-color available"></span>
                    <span>Available Dates ({selectedDates.filter(date => !blockedDates.includes(date)).length})</span>
                  </label>
                </div>
                <div className="legend-item">
                  <label className="legend-checkbox">
                    <input
                      type="checkbox"
                      checked={dateFilters.showBlocked}
                      onChange={() => handleFilterToggle('showBlocked')}
                    />
                    <span className="legend-color blocked"></span>
                    <span>Blocked Dates ({blockedDates.length})</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="modal-section">
              <h3>Description</h3>
              <textarea
                placeholder="Tell us about your experience and expertise..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  description: e.target.value
                }))}
                rows={4}
              />
            </div>

            <div className="modal-section">
              <h3>Hourly Rate (€)</h3>
              <input
                type="number"
                placeholder="Enter your hourly rate"
                value={formData.hourly_rate}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  hourly_rate: e.target.value
                }))}
              />
            </div>

            <div className="modal-footer">
              <button type="button" className="cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button 
                type="submit" 
                className={getButtonStyles()}
                disabled={saveStatus !== 'idle'}
              >
                {getSaveButtonText()}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ServiceProviderOnboardingModal; 