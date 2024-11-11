import axios from 'axios';
import {createUser, createParentService, ProviderSearchRequest, createServiceProvider, createBooking} from './models.ts';

const api = axios.create({
    baseURL: 'http://0.0.0.0:8090',
})



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

export const fetchParentServices = async () => {
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
    return response.data;
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
        return response.data.map(createBooking);
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