""" This file contains the pydantic data models used in this application """
import asyncio
from datetime import datetime
from importlib.metadata import metadata
from lib2to3.pgen2.token import OP

from typing import  Optional, List

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


class User(MongoBase):
    name: str
    email: str

class Usertype(str, Enum):
    SERVICE_PROVIDER = "SERVICE_PROVIDER"
    CLIENT = "CLIENT"

# Enum for predefined time slots
class TimeSlot(str, Enum):
    MORNING = "9am-12pm"
    MIDDAY = "12pm-3pm"
    AFTERNOON_EVENING = "3pm-8pm"
    Night = "8pm-11pm"

# Parent Service Model (e.g., Cleaning, Nanny, Cooking)
class ParentService(MongoBase):
    name: str  # e.g., Cleaning, Nanny, Cooking

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
    
    # Nanny Subservices
    TODDLER_CARE = "toddler_care"
    INFANT_CARE = "infant_care"
    SCHOOL_AGE_CARE = "school_age_care"
    
    # Cooking Subservices
    VEGETARIAN_MEAL = "vegetarian_meal"
    VEGAN_MEAL = "vegan_meal"
    REGULAR_MEAL = "regular_meal"


class SubServiceName(str, Enum):
    BERLIN = "BERLIN"
    MUNICH = "MUNICH"
    FRANKFURT = "FRANKFURT"

# SubService Model (using SubServiceName Enum)
class SubService(MongoBase):
    name: SubServiceName  # Uses the enum for predefined subservice names
    parent_service_id: str  # Link back to the Parent Service
    price: float  # Price of the subservice
    duration: int # Duration of the service (e.g., 2 hours for deep clean)


# Provider Model (Each provider can offer multiple services)
class ServiceProvider(MongoBase):
    name: str
    city: SubServiceName
    services_offered: List[str]  # List of SubService IDs that the provider offers
    services_offered_details: List[SubService]
    available_time_slots: List[TimeSlot]  

# Client Model
class Client(MongoBase):
    name: str
    address: str


# Booking Model (A client books a subservice provided by a provider)
class Booking(MongoBase):
    client_id: str
    provider_id: str
    subservice_id: str  # Reference to the SubService
    frequency: ServiceFrequency 
     # Frequency chosen by the client at the time of booking
    total_price: float  # Total price based on service and frequency


# Response Models for APIs
class ParentServiceListResponse(MongoBase):
    parent_services: List[ParentService]  # List of top categories


