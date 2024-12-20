""" This file contains the pydantic data models used in this application """
import asyncio
from datetime import datetime
from importlib.metadata import metadata
from lib2to3.pgen2.token import OP

from typing import  Optional, List, Dict

import pandas as pd
from beanie import Document
from pydantic import Field
from beanie.odm.fields import ExpressionField
from .base import *




class MongoBase(Document):
    # id: Union[PydanticObjectId, str] = Field(None, alias="_id")

    class Settings:
        is_root = True

    created_at: Optional[datetime] = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = Field(None, example="2020-11-12T13:15:09.557Z")
    deleted_at: Optional[datetime] = Field(None, example="2020-11-12T13:15:09.557Z")

    relations: dict = Field(
        {},
        description="Dictionary to hold specific relation Object if loaded by API endpoint.",
    )

    @classmethod
    async def get_document(cls, doc_id: str):
        return await cls.get(doc_id)

    @classmethod
    async def search_document(
        cls, query, sort_by=None, order_by="Asc", projection=None, limit=None, skip=None
    ):
        if sort_by:
            sort_by = +sort_by if order_by == "Asc" else -sort_by

            return (
                await cls.find(query, skip=skip, limit=limit)
                .project(projection)
                .sort(sort_by)
                .to_list()
            )

        else:
            return (
                await cls.find(query, skip=skip, limit=limit)
                .project(projection)
                .to_list()
            )

    @classmethod
    async def upsert_document(cls, doc):
        return await doc.insert()

    @classmethod
    async def save_document(cls, doc):
        if doc.id:
            await doc.save()
            return doc
        else:
            return await doc.insert()

    @classmethod
    async def  filter_and_paginate(cls, filter_request):
        query = filter_request.filter
        query["deleted_at"] = None
        sort_by = ExpressionField(filter_request.sort_by) if filter_request.sort_by else cls.created_at
        page_number = filter_request.page_number if filter_request.page_number else 1
        order_by = filter_request.order_by 
        skip = (page_number - 1) * filter_request.page_size
        limit = filter_request.page_size
        
        print("Fetching Docs")
        
        print(query)

        # Retrieve the documents.
        docs = await cls.search_document(
            query,
            sort_by=sort_by,
            skip=skip,
            limit=limit,
            order_by = order_by
        )
        total_count = await cls.find(query).count()

        return {
        "total": total_count,
        "items": docs
    }

class City(str, Enum):
    BERLIN = "BERLIN"
    MUNICH = "MUNICH"
    FRANKFURT = "FRANKFURT"

class DocumentType(str, Enum):
    SALARY = "SALARY"
    HOUSE_CONTRACT = "HOUSE_CONTRACT"
    OTHER_DOC = "OTHER_DOC"
    JOB_CONTRACT = "JOB_CONTRACT"
    UTILITY_BILL = "UTILITY_BILL"
    SOCIAL_SECURITY = "SOCIAL_SECURITY"
    HEALTH_INSURANCE = "HEALTH_INSURANCE"
    BANK_STATEMENT = "BANK_STATEMENT"
    TAX_DOCUMENT = "TAX_DOCUMENT"
    RESIDENCE_PERMIT = "RESIDENCE_PERMIT"
    VISA = "VISA"
    EDUCATION_CERTIFICATE = "EDUCATION_CERTIFICATE"
    MARRIAGE_CERTIFICATE = "MARRIAGE_CERTIFICATE"
    BIRTH_CERTIFICATE = "BIRTH_CERTIFICATE"
    DRIVING_LICENSE = "DRIVING_LICENSE"
    INSURANCE_POLICY = "INSURANCE_POLICY"
    EMPLOYMENT_REFERENCE = "EMPLOYMENT_REFERENCE"
    LANGUAGE_CERTIFICATE = "LANGUAGE_CERTIFICATE"

class Usertype(str, Enum):
    SERVICE_PROVIDER = "SERVICE_PROVIDER"
    CLIENT = "CLIENT"

# Enum for predefined time slots
class TimeSlot(str, Enum):
    MORNING = "9am-12pm"
    MIDDAY = "12pm-3pm"
    AFTERNOON_EVENING = "3pm-8pm"
    NIGHT = "8pm-11pm"

# Parent Service Model (e.g., Cleaning, Nanny, Cooking, Combo)
class ParentService(MongoBase):
    name: str  # e.g., Cleaning, Nanny, Cooking, combo
    image: str

# Frequency Enum for service booking
class ServiceFrequency(str, Enum):
    ONE_TIME = "one_time"
    THREE_TIMES_A_WEEK = "three_times_a_week"
    FIVE_TIMES_A_WEEK = "five_times_a_week"
    FULL_WEEK = "FULL_WEEK"


# Enum for SubService names
class SubServiceName(str, Enum):
    # Cleaning Subservices
    DEEP_CLEAN = "deep_clean"
    REGULAR_CLEAN = "regular_clean"
    WINDOW_CLEAN = "window_clean"
    KITCHEN = "kitchen"
    BATHROOM = "bathroom"
    
    # Nanny Subservices
    TODDLER_CARE = "toddler_care"
    INFANT_CARE = "infant_care"
    SCHOOL_AGE_CARE = "school_age_care"
    
    # Cooking Subservices
    VEGETARIAN_MEAL = "vegetarian_meal"
    VEGAN_MEAL = "vegan_meal"
    NON_VEGETARIAN_MEAL = "non_vegetarian_meal"
    JAIN_MEAL = "jain_meal"
    
    # Combo Subservices
    COOKING_CLEANING = "cooking_cleaning"
    COOKING_NANNY = "cooking_nanny"
    CLEANING_NANNY = "cleaning_nanny"
    COOKING_CLEANING_NANNY = "cooking_cleaning_nanny"


# SubService Model (using SubServiceName Enum)
class SubService(MongoBase):
    name: Optional[SubServiceName ] = None # Uses the enum for predefined subservice names
    parent_service_id: Optional[str ] = None  # Link back to the Parent Service
    base_price: Optional[float ] = None  # Price of the subservice
    description: Optional[str ] = None  
    price_per_extra_person: Optional[float] = None
    price_per_extra_room: Optional[float] = None
    duration: Optional[float] = None


class UserRatings(MongoBase):
    average: float = 0.0
    count: int = 0
    total: int = 0

class User(MongoBase):
    name: str
    gender: Optional[str] = None
    email: str
    city: Optional[City] = None
    address: Optional[str] = None
    user_type: Optional[Usertype] = None
    stripe_customer_id: Optional[str] = None
    stripe_paymemt_methods: Optional[List] = []
    stripe_account_id: Optional[str] = None
    services_offered: Optional[List[str]] = None
    available_time_slots: Optional[List[TimeSlot]] = None
    available_dates: Optional[Dict[str, List[TimeSlot]]] = Field(
        default={},
        description="Dictionary mapping dates (YYYY-MM-DD) to available time slots"
    )
    blocked_dates: Optional[List[datetime]] = Field(
        default=[],
        description="List of dates when provider is not available"
    )
    services_offered_details: Optional[List[SubService]] = None
    description: Optional[str] = None
    number_of_bookings: Optional[int] = None
    whatsapp_number: Optional[str] = None
    image_url: Optional[str] = None
    auth0_id: Optional[str] = None
    ratings: Optional[UserRatings] = Field(
        default_factory=lambda: UserRatings(average=0, count=0, total=0)
    )


# Booking Model (A client books a subservice provided by a provider)
class BookingStatus(str, Enum):
    RESERVED = "RESERVED"
    CONFIRMED = "CONFIRMED"
    EXPIRED = "EXPIRED"
    CANCELLED = "CANCELLED"
    PAYMENT_MADE = "PAYMENT_MADE"  # New status for provider payment

class Booking(MongoBase):
    client_id: str
    provider_id: str
    booked_date: datetime = None
    subservice_ids: List[str]
    frequency: ServiceFrequency
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    time_slot: Optional[str] = None
    total_price: float
    metadata: Optional[dict] = None
    status: BookingStatus = BookingStatus.RESERVED
    reserved_at: Optional[datetime] = None
    payment_deadline: Optional[datetime] = None
    payment_intent_id: Optional[str] = None
    payout_id: Optional[str] = None  # Track Stripe payout ID
    paid_at: Optional[datetime] = None  # Track when provider was paid
    rating: Optional[int] = None
    rating_comment: Optional[str] = None

# Response Models for APIs
class ParentServiceListResponse(MongoBase):
    parent_services: List[ParentService]  # List of top categories



class ServiceProvider(User, MongoBase):
    services_offered: Optional[List[str]] = None  # List of SubService IDs that the provider offers
    available_time_slots: Optional[List[TimeSlot] ] = None
    services_offered_details:Optional[List[SubService] ] = None
    

class MessageType(str, Enum):
    TEXT = "TEXT"
    IMAGE = "IMAGE"
    SYSTEM = "SYSTEM"

class Message(MongoBase):
    chat_id: Optional[str] = None
    sender_id: Optional[str] = None
    content: Optional[str] = None
    message_type: MessageType = MessageType.TEXT
    read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Chat(MongoBase):
    provider_id: str
    client_id: str
    booking_id: Optional[str] = None
    last_message: Optional[str] = None
    last_message_time: Optional[datetime] = None
    unread_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True
    
