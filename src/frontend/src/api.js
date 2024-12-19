import axios from 'axios';
import {createUser, createParentService, ProviderSearchRequest, createServiceProvider, createBooking} from './models.ts';

// Function to get cookie by name
const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
};



console.log('process.env.REACT_APP_API_URL', process.env.REACT_APP_API_URL);
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8090',
    withCredentials: true,
});

// Add request interceptor to include Authorization header




api.interceptors.request.use((config) => {
    console.log('config', config);
    console.log('getCookie', getCookie('Authorization'));
    console.log('config.headers', config.headers);
    
    const authToken = getCookie('Authorization');
    if (authToken) {
        config.headers.Authorization = authToken;
    }
    return config;
});

export const fetchusers = async () => {
    try {
        const response = await api.get('/users');
        return response.data.map(createUser);
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

export const fetchUserInfo = async () => {
    try {
        const response = await api.get('/users/detailed_info');
        return createUser(response.data);
    } catch (error) {
        console.error('error fetching user info:', error);
        throw error;
    }

};

export const updateUserInfo = async (userData) => {
  try {
    const response = await fetch('/api/users/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error('Failed to update user information');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in updateUserInfo:', error);
    throw error;
  }
};

export const fetchParentServices = async () => {
    try {
        const response = await api.get('/parent_services');
        return response.data.map(createParentService);
    } catch (error) {
        console.error('Error fetching services:', error);
        throw error;
    }
};

export const fetchParentService = async (params) => {
    try {
        const response = await api.get('/parent_services');
        return response.data.map(createParentService);
    } catch (error) {
        console.error('Error fetching services:', error);
        throw error;
    }
};


export const fetchServiceProviders = async (params = {}) => {
    try {
      // Set default values for the request payload if not provided
      const requestPayload = {
        filter:  params || {},
        page_number: params.page_number || 1,
        page_size: params.page_size || 50,
        sort_by: params.sort_by || 'created_at',
        order_by: params.order_by || 'asc',
      };
  
      // Send POST request to the '/providers/search' endpoint
      const response = await api.post('/providers/search', requestPayload);
  
      // Assuming that the backend returns a list of ServiceProvider objects
      return response.data.map(createServiceProvider);
    } catch (error) {
      console.error('Error fetching service providers:', error);
      throw error;
    }
  };

export const postBooking = async (params = {}) => {
    try {
    const requestPayload = {
        sub_service_names: params.sub_service_names,
        provider_id: params.provider_id,
        client_id: params.client_id,
        time_slot: params.time_slot,
        booked_date: params.booked_date,

    }
    const response = await api.post('/bookings', requestPayload); 
    return createBooking(response.data);
    } catch (error) {
        console.error('Error while creating a booking', error);
        throw error;
    }
}

export const generateClientCardSetUpUrl = async () => {
    try {
        const response = await api.get('/payment/client_setup_card');
        return response.data.setup_url;
    } catch (error) {
        console.error('Error while generating client card setup_url:', error);
        throw error;
    }
}

export const receiveClientPayment = async (params = {}) => {
    try {
    const requestPayload = {
        booking_id: params.booking_id,
        amount: params.amount,
        payment_method_id: params.payment_method_id,
        description: params.description,

    }
    const response = await api.post('/payment/charge_client', requestPayload); 
    return response.data;
    } catch (error) {
        console.error('Error while creating a booking', error);
        throw error;
    }
}

export const fetchUserBookings = async () => {
    try {
        const response = await api.get('/bookings');
        return response.data;
    } catch (error) {
        console.error('Error fetching bookings:', error);
        throw error;
    }
}; 

export const initiateChatWithProvider = async () => {

}

export const transferProviderPayment = async (params = {}) => {
    try {
        const requestPayload = {
            amount: params.amount,
            provider_id: params.provider_id
        }
        const response = await api.post('/payment/payout_provider', requestPayload);
        return response.data;
    } catch (error) {
        console.error('Error while transferring payment to Provider', error);
        throw error;
    }
}


export const fetchCalculatedPrice = async (params = {}) => {
    try {
        const requestPayload = {
            sub_service_names: params.sub_service_names,
            number_of_persons: params.number_of_persons,
            number_of_rooms: params.number_of_rooms
        }
        const response = await api.post(`/parent_services/uuu/calculate_price`, requestPayload);
        return response.data;
    } catch (error) {
        console.error('Error while calculating the price for service', error);
        throw error;
    }
}

export const extractDocumentInfo1 = async (file, documentType) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);

    const response = await api.post('/ai/extraction', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error processing document:', error);
    throw error.response?.data?.detail || error.message || 'Error processing document';
  }
};

export const askDocumentQuestion = async (file, question) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('question', question);

    const response = await api.post('/ai/ask_question', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error asking document question:', error);
    throw error.response?.data?.detail || error.message || 'Error processing document question';
  }
};

export const removePaymentMethod = async (paymentMethodId) => {
  try {
    const response = await api.delete(`/payment/remove_payment_method/${paymentMethodId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing payment method:', error);
    throw error.response?.data?.detail || error.message || 'Failed to remove payment method';
  }
};

