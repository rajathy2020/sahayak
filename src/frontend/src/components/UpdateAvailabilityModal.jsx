import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { TimeSlot, TIME_SLOTS } from '../models.ts';
import '../page_styles/service_provider_modal.css';

const UpdateAvailabilityModal = ({ show, onClose, onSave, currentAvailability }) => {
  console.log('UpdateAvailabilityModal Props:', {
    currentAvailability,
    type: typeof currentAvailability,
    available_dates: currentAvailability?.available_dates,
    blocked_dates: currentAvailability?.blocked_dates
  });

  const [formData, setFormData] = useState({
    available_time_slots: [],
    available_dates: {},
    blocked_dates: [],
  });
  const [selectedDates, setSelectedDates] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [step, setStep] = useState('available');
  const [dateRange, setDateRange] = useState(null);
  const [error, setError] = useState(null);
  const [dateFilters, setDateFilters] = useState({
    showAvailable: true,
    showBlocked: true
  });

  // Add new state for loading
  const [isSaving, setIsSaving] = useState(false);
  
  // Add toast state (if not using global toast)
  const [toast, setToast] = useState(null);

  const [toastTimeout, setToastTimeout] = useState(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (toastTimeout) {
        clearTimeout(toastTimeout);
      }
    };
  }, [toastTimeout]);

  // Initialize with current availability data
  useEffect(() => {
    if (currentAvailability) {
      // Initialize available dates and blocked dates
      const availableDates = currentAvailability.available_dates || {};
      const blockedDatesArray = Array.isArray(currentAvailability.blocked_dates) 
        ? currentAvailability.blocked_dates.map(date => 
            typeof date === 'string' ? date : new Date(date).toISOString().split('T')[0]
          )
        : [];

      console.log('Processing dates:', {
        availableDates,
        blockedDatesArray,
        availableDateKeys: Object.keys(availableDates)
      });

      // Set form data with initial values
      const initialFormData = {
        available_dates: availableDates,
        blocked_dates: blockedDatesArray,
        available_time_slots: []
      };

      // Get time slots from the first available date if it exists
      const firstDateSlots = Object.values(availableDates)[0];
      if (firstDateSlots) {
        initialFormData.available_time_slots = firstDateSlots;
      }

      console.log('Setting initial form data:', initialFormData);
      setFormData(initialFormData);

      // Set selected dates from available_dates
      setSelectedDates(Object.keys(availableDates));
      setBlockedDates(blockedDatesArray);

      // Log the state after setting
      console.log('Initial state set:', {
        availableDates: Object.keys(availableDates),
        blockedDates: blockedDatesArray
      });
    }
  }, [currentAvailability]);

  const handleTimeSlotChange = (slot) => {
    setFormData(prev => {
      const newTimeSlots = prev.available_time_slots.includes(slot)
        ? prev.available_time_slots.filter(s => s !== slot)
        : [...prev.available_time_slots, slot];

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

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const handleDateClick = (value) => {
    if (step === 'available') {
      if (formData.available_time_slots.length === 0) {
        setError('Please select time slots first');
        return;
      }

      if (Array.isArray(value)) {
        const [start, end] = value;
        if (!start || !end) return;

        const dates = [];
        let current = new Date(start);
        
        while (current <= end) {
          const formattedDate = formatDate(current);
          if (!formData.blocked_dates.includes(formattedDate)) {
            dates.push(formattedDate);
          }
          current.setDate(current.getDate() + 1);
        }

        // Update available dates
        const newAvailableDates = { ...formData.available_dates };
        dates.forEach(date => {
          newAvailableDates[date] = formData.available_time_slots;
        });

        setFormData(prev => ({
          ...prev,
          available_dates: newAvailableDates
        }));
        setSelectedDates(prev => [...new Set([...prev, ...dates])]);
        setDateRange(value);
      }
    } else if (step === 'blocked') {
      const formattedDate = formatDate(value);
      
      setFormData(prev => {
        const newBlockedDates = prev.blocked_dates.includes(formattedDate)
          ? prev.blocked_dates.filter(d => d !== formattedDate)
          : [...prev.blocked_dates, formattedDate];

        // Remove from available dates if being blocked
        const newAvailableDates = { ...prev.available_dates };
        if (newBlockedDates.includes(formattedDate)) {
          delete newAvailableDates[formattedDate];
        }

        return {
          ...prev,
          blocked_dates: newBlockedDates,
          available_dates: newAvailableDates
        };
      });

      setBlockedDates(prev => 
        prev.includes(formattedDate)
          ? prev.filter(d => d !== formattedDate)
          : [...prev, formattedDate]
      );
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    
    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }

    // Set a 5-second timeout for the toast
    const timeout = setTimeout(() => {
      setToast(prev => ({ ...prev, removing: true }));
      // Add a small delay for the removal animation
      setTimeout(() => setToast(null), 300);
    }, 5000); // 5 seconds

    setToastTimeout(timeout);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await onSave(formData);
      showToast('Availability updated successfully!', 'success');
      
      // Close modal after the toast shows
      setTimeout(() => {
        onClose();
      }, 5000); // Wait for toast to finish
      
    } catch (error) {
      setError('Failed to update availability');
      showToast('Failed to update availability. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFilterToggle = (filterType) => {
    setDateFilters(prev => ({
      ...prev,
      [filterType]: !prev[filterType]
    }));
  };

  const getTileClassName = ({ date }) => {
    const formattedDate = formatDate(date);
    const classes = [];
    
    const isBlocked = formData.blocked_dates.includes(formattedDate);
    const isAvailable = Object.keys(formData.available_dates).includes(formattedDate);
    
    if (isBlocked && dateFilters.showBlocked) {
      classes.push('blocked-date');
    } else if (isAvailable && dateFilters.showAvailable) {
      classes.push('available-date');
    }

    return classes.join(' ');
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="provider-onboarding-modal">
        <div className="modal-header">
          <h2>Update Availability</h2>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
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
            <h3>Select Available Dates</h3>
            <div className="calendar-wrapper">
              <Calendar
                minDate={new Date()}
                maxDate={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)}
                selectRange={step === 'available'}
                onChange={handleDateClick}
                value={step === 'available' ? dateRange : null}
                tileClassName={getTileClassName}
                tileDisabled={({ date }) => {
                  const formattedDate = formatDate(date);
                  // Only disable dates that are blocked when in available selection mode
                  if (step === 'available') {
                    return formData.blocked_dates.includes(formattedDate);
                  }
                  // In blocked mode, only allow selecting from available dates
                  return !Object.keys(formData.available_dates).includes(formattedDate);
                }}
              />
            </div>
          </div>

          <div className="calendar-actions">
            {step === 'blocked' && (
              <button 
                type="button" 
                className="calendar-btn back" 
                onClick={() => setStep('available')}
              >
                <i className="fas fa-arrow-left"></i>
                Back to Available Dates
              </button>
            )}
            {step === 'available' && selectedDates.length > 0 && (
              <button 
                type="button" 
                className="calendar-btn next" 
                onClick={() => setStep('blocked')}
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

          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          <div className="modal-footer">
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="save-btn"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="spinner"></span>
                  Updating...
                </>
              ) : (
                <>
                  <i className="fas fa-check-circle"></i>
                  Update Availability
                </>
              )}
            </button>
          </div>

          {toast && (
            <div className={`toast ${toast.type} ${toast.removing ? 'removing' : ''}`}>
              <div className="toast-content">
                <i className={`fas ${toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                <span>{toast.message}</span>
              </div>
              <div className="toast-progress"></div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default UpdateAvailabilityModal; 