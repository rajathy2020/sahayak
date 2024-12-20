import React from 'react';

export enum City {
    BERLIN = "BERLIN",
    MUNICH = "MUNICH",
    FRANKFURT = "FRANKFURT"
}

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

export enum UserType {
    SERVICE_PROVIDER = "SERVICE_PROVIDER",
    CLIENT = "CLIENT"
}

export interface UserInfo {
    id: string;
    name: string;
    gender?: string;
    email: string;
    city?: City;
    address?: string;
    user_type?: UserType;
    stripe_customer_id?: string;
    stripe_paymemt_methods?: any[];
    stripe_account_id?: string;
    services_offered?: string[];
    available_time_slots?: string[];
    services_offered_details?: any[];
    description?: string;
    number_of_bookings?: number;
    whatsappNumber?: string;
    image_url?: string;
    blocked_dates?: string[];
    available_dates?: string[];
    ratings?: {
      average: number;
      count: number;
      total: number;
    };
}

export const createUser = (data: any = {}): UserInfo => ({
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
  services_offered_details: data.services_offered_details,
  description: data.description,
  number_of_bookings: data.number_of_bookings,
  whatsappNumber: data.whatsapp_number,
  image_url: data.image_url,
  blocked_dates: data.blocked_dates,
  available_dates: data.available_dates,
  ratings: {
    average: data.ratings?.average || 0,
    count: data.ratings?.count || 0,
    total: data.ratings?.total || 0,
  },
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
    status: string;
    reserved_at: string;
    payment_deadline: string;
    payment_intent_id: string;
    payout_id: string;
    paid_at: string;
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
    status: data.status,
    payment_intent_id: data.payment_intent_id,
    payout_id: data.payout_id,
    paid_at: data.paid_at,
    payment_deadline: data.payment_deadline,
    reserved_at: data.reserved_at,

  });



export enum TimeSlot {
  MORNING = "9am-12pm",
  MIDDAY = "12pm-3pm",
  AFTERNOON_EVENING = "3pm-8pm",
  NIGHT = "8pm-11pm"
}

export const TIME_SLOTS = Object.values(TimeSlot);

export enum MessageType {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  SYSTEM = "SYSTEM"
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  message_type: MessageType;
  read: boolean;
  created_at: string;
}

export interface Chat {
  id: string;
  provider_id: string;
  client_id: string;
  booking_id?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  other_participant?: {
    id: string;
    name: string;
    image_url?: string;
  };
}

export const createMessage = (data: any = {}): Message => ({
  id: data._id || data.id,
  chat_id: data.chat_id,
  sender_id: data.sender_id,
  content: data.content,
  message_type: data.message_type || MessageType.TEXT,
  read: data.read || false,
  created_at: data.created_at || new Date().toISOString()
});

export const createChat = (data: any = {}): Chat => ({
  id: data._id || data.id,
  provider_id: data.provider_id,
  client_id: data.client_id,
  booking_id: data.booking_id,
  last_message: data.last_message,
  last_message_time: data.last_message_time,
  unread_count: data.unread_count || 0,
  created_at: data.created_at || new Date().toISOString(),
  updated_at: data.updated_at || new Date().toISOString(),
  is_active: data.is_active ?? true,
  other_participant: data.other_participant
});
