import React from 'react';

export interface User {
    id:Number;
    name: String;
    email: String;
}

export const createUser = (data: any = {}): User => ({
    id: data.id || 'default-id',        
    name: data.name || 'Anonymous',     
    email: data.email || 'no-email@domain.com',
}); 

export interface ParentService {
    id: String;
    name: String;
    image: String;
}

export const createParentService = (data: any = {}): ParentService => ({
    id: data._id || 'default-id',        
    name: data.name || 'Anonymous',     
    image: data.image || 'no-email@domain.com',
}); 

export interface ProviderSearchRequest {
    filter?: Record<string, unknown>;
    page_number: number;
    page_size: number;
    sort_by: string;
    order_by: string;
  }

export interface ServiceProvider {
    id: string;
    name: string;
    email: string;
    services_offered?: Array<string>; // List of SubService IDs that the provider offers
    available_time_slots?: Array<string>; // Array of available time slots
  }

export const createServiceProvider = (data: any = {}): ServiceProvider => ({
    id: data._id || 'default-id', 
    name: data.name || 'Anonymous', 
    email: data.email || 'no-email@domain.com', 
    services_offered: data.services_offered || [], 
    available_time_slots: data.available_time_slots || [], 
  });

export interface Booking {
    client_id: string;
    provider_id: string;
    booked_date: string;
    subservice_ids: Array<string>;
    frequency: string;
    start_time: string;
    end_time: string;
    time_slot: string;
    total_price: Float32Array;
  }

export const createBooking = (data: Partial<Booking> = {}): Booking => ({
    client_id: data.client_id,
    provider_id: data.provider_id,
    booked_date: data.booked_date,
    subservice_ids: data.subservice_ids,
    frequency: data.frequency,
    start_time: data.start_time,
    end_time: data.end_time,
    time_slot: data.time_slot,
    total_price: data.total_price,
  });
