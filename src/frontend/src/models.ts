import React from 'react';

export interface CardDetails {
 "brand": String;
 "checks": Array<string>;
  "country": String;
  "display_brand": String;
  "exp_month": number;
  "exp_year": number;
  "fingerprint": String;
  "funding": String;
  "generated_from": String;
  "last4": String;
  "networks": Array<string>;
  "three_d_secure_usage": Array<string>;
  "wallet": string;
}

export interface User {
  id: string;
  name: string;
  gender?: string;
  email: string;
  city?: string;
  address?: string;
  user_type?: string;
  stripe_customer_id?: string;
  stripe_paymemt_methods?: Array<any>;
  stripe_account_id?: string;
  services_offered?: Array<string>;
  available_time_slots?: Array<string>;
  available_dates?: { [key: string]: Array<string> };
  blocked_dates?: Array<string>;
  services_offered_details?: Array<any>;
  description?: string;
  number_of_bookings?: number;
  whatsapp_number?: string;
  image_url?: string;
  auth0_id?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export const createUser = (data: any = {}): User => ({
  id: data._id || 'default-id',
  name: data.name || 'Anonymous',
  gender: data.gender,
  email: data.email || 'no-email@domain.com',
  city: data.city,
  address: data.address,
  user_type: data.user_type,
  stripe_customer_id: data.stripe_customer_id,
  stripe_paymemt_methods: data.stripe_paymemt_methods,
  stripe_account_id: data.stripe_account_id,
  services_offered: data.services_offered,
  available_time_slots: data.available_time_slots,
  available_dates: data.available_dates,
  blocked_dates: data.blocked_dates,
  services_offered_details: data.services_offered_details,
  description: data.description,
  number_of_bookings: data.number_of_bookings,
  whatsapp_number: data.whatsapp_number,
  image_url: data.image_url,
  auth0_id: data.auth0_id,
  created_at: data.created_at,
  updated_at: data.updated_at,
  deleted_at: data.deleted_at
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
    description?:string;
  }

export const createServiceProvider = (data: any = {}): ServiceProvider => ({
    id: data._id || 'default-id', 
    name: data.name || 'Anonymous', 
    email: data.email || 'no-email@domain.com', 
    services_offered: data.services_offered || [], 
    available_time_slots: data.available_time_slots || [],
    description: data.description || "", 
  });

export interface Booking {
    id: string;
    client_id: string;
    provider_id: string;
    booked_date: string;
    subservice_ids: Array<string>;
    frequency: string;
    start_time: string;
    end_time: string;
    time_slot: string;
    total_price: Float32Array;
    metadata: Record<string, unknown>;
  }

export const createBooking = (data: Partial<Booking> = {}): Booking => ({
    id: data._id,
    client_id: data.client_id,
    provider_id: data.provider_id,
    booked_date: data.booked_date,
    subservice_ids: data.subservice_ids,
    frequency: data.frequency,
    start_time: data.start_time,
    end_time: data.end_time,
    time_slot: data.time_slot,
    total_price: data.total_price,
    metadata: data.metadata,
  });
