// Import necessary libraries
import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { TimeSlot, TIME_SLOTS } from '../models.ts';
import '../page_styles/update_availability_modal.css';

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
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [toastTimeout, setToastTimeout] = useState(null);
  const [editMode, setEditMode] = useState('available');
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);

  const startDate = new Date(2024, 11, 1); // 
  const endDate = new Date(2025, 11, 30); // 


  useEffect(() => {
    return () => {
      if (toastTimeout) {
        clearTimeout(toastTimeout);
      }
    };
  }, [toastTimeout]);

  useEffect(() => {
    if (currentAvailability) {
      const availableDates = currentAvailability.available_dates || {};
      const blockedDatesArray = Array.isArray(currentAvailability.blocked_dates)
        ? currentAvailability.blocked_dates.map(date =>
            typeof date === 'string' ? date : new Date(date).toISOString().split('T')[0]
          )
        : [];

      const blockedDates = blockedDatesArray.map(date => date.split('T')[0]);
     


      const initialFormData = {
        available_dates: availableDates,
        blocked_dates: blockedDates,
        available_time_slots: []
      };

      const firstDateSlots = Object.values(availableDates)[0];
      if (firstDateSlots) {
        initialFormData.available_time_slots = firstDateSlots;
      }

      setFormData(initialFormData);
      setSelectedDates(Object.keys(availableDates));
      setBlockedDates(blockedDates); // Ensure blocked dates are set
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
    // Extract year, month, and day from the date
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const day = String(date.getDate()).padStart(2, '0');
  
    // Format the date as YYYY-MM-DD
    const formattedDate = `${year}-${month}-${day}`;
  
    return formattedDate;
  };

  const handleDateClick = (value) => {
    if (step === 'available') {
        if (formData.available_time_slots.length === 0) {
            setError('Please select time slots first');
            return;
        }

        if (Array.isArray(value)) {
            const [start, end] = value;
            if (!start) return;

            const dates = [];
            let current = new Date(start);

            // Highlight the first selected date
            const formattedStartDate = formatDate(current);
            setSelectedDates([formattedStartDate]); // Set the first date as selected

            while (current <= (end || start)) {
                const formattedDate = formatDate(current);
                dates.push(formattedDate);
                current.setDate(current.getDate() + 1);
            }

            console.log('dates selected', dates);

            // Update selected dates
            setSelectedDates(dates);
            setDateRange(value);

            // Update form data available_dates with new dates and time slots
            setFormData(prev => {
                const newAvailableDates = { ...prev.available_dates };
                dates.forEach(date => {
                    newAvailableDates[date] = prev.available_time_slots; // Keep the old time slots
                });
                console.log('newAvailableDates', newAvailableDates);
                return { ...prev, available_dates: newAvailableDates };
            });
        }
    } else if (step === 'blocked') {
        const formattedDate = formatDate(value);

        console.log('formattedDate in the blocked step', formattedDate);


        
        // new blocked dates should add to the previous blocked dates if the date is not the blocked date else keep the previous blocked dates
      
      setFormData(prev => {
        let newBlockedDates = [];
        if (prev.blocked_dates.includes(formattedDate)) {
          newBlockedDates = prev.blocked_dates.filter(d => d !== formattedDate)
          // add the new blocked date to the available dates
          const newAvailableDates = { ...prev.available_dates };
          Object.keys(newAvailableDates).forEach(date => {
            newAvailableDates[date] = prev.available_time_slots; // Keep the old time slots
          });
          newAvailableDates[formattedDate] = prev.available_time_slots;
          console.log('newBlockedDates', newBlockedDates)
          setBlockedDates(newBlockedDates)
          return { ...prev, blocked_dates: newBlockedDates, available_dates: newAvailableDates }
        } else {
          newBlockedDates = [...prev.blocked_dates, formattedDate]
          console.log('newBlockedDates', newBlockedDates)
          setBlockedDates(newBlockedDates)
          return { ...prev, blocked_dates: newBlockedDates }
        }
      });

      


  };
};

  const showToast = (message, type) => {
    setToast({ message, type });

    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }

    const timeout = setTimeout(() => {
      setToast(prev => ({ ...prev, removing: true }));
      setTimeout(() => setToast(null), 300);
    }, 5000);

    setToastTimeout(timeout);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    console.log('handleSubmit', formData);

    try {
      await onSave(formData);
      showToast('Availability updated successfully!', 'success');
      setTimeout(() => {
        onClose();
      }, 5000);
    } catch (error) {
      setError('Failed to update availability');
      showToast('Failed to update availability. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditAvailableDates = () => {
    setEditMode('available');
    setStep('available');
  };

  const handleEditBlockedDates = () => {
    setEditMode('blocked');
    setStep('blocked');
  };

  const getTileClassName = ({ date }) => {
    const formattedDate = formatDate(date);
    let classes = [];

    const availableDates = Object.keys(formData.available_dates);


  
    // Check if the date is blocked
    if (blockedDates.includes(formattedDate)) {
      classes.push('blocked-date'); // Red for blocked dates
    } else if (availableDates.includes(formattedDate)) {
      classes.push('available-date'); // Green for available dates
    }

    // Highlight the first selected date
    if (formattedDate === selectedStartDate) {
      classes.push('selected-start-date'); // Dark green for the starting date
    } else if (selectedDates.includes(formattedDate)) {
      classes.push('available-date'); // Ensure selected dates are also marked as available
    }

    classes = [...new Set(classes)];


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
            <h3>Select Dates</h3>
            <div className="edit-buttons">
              <button 
                type="button" 
                onClick={handleEditAvailableDates} 
                className={`edit-button ${editMode === 'available' ? 'selected' : ''}`}
              >
                Edit Available Dates
              </button>
              <button 
                type="button" 
                onClick={handleEditBlockedDates} 
                className={`edit-button ${editMode === 'blocked' ? 'selected' : ''}`}
              >
                Edit Blocked Dates
              </button>
            </div>
            {selectedStartDate && selectedEndDate && (
              <div className="selected-date-banner">
                <p>Selected Start Date: <strong>{selectedStartDate}</strong></p>
                {selectedEndDate && <p>Selected End Date: <strong>{selectedEndDate}</strong></p>}
              </div>
            )}
           
            <div className={`calendar-wrapper ${editMode}`}>
              {formData.available_dates && (
              <Calendar
                selectRange={editMode === 'available'}
                onChange={handleDateClick}
                value={editMode === 'available' ? dateRange : null}
                showNeighboringMonth={false}
                tileClassName={getTileClassName}
                
              />
              )}
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-btn">
              Update Availability4444
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
