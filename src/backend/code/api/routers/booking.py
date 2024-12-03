""" This file holds all the internal routers required to interact with projects """
from datetime import datetime
import os
from typing import List, Optional, Union

from services.user_management.utils import get_current_user
from beanie.odm.operators.find.logical import And
from bson import ObjectId
import core.dbs
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
import pandas as pd
from pydantic import BaseModel
from shared.models import *
from shared.models import User
import time
from datetime import time, timedelta, datetime  # Import time manipulation classes
SERVICE_TYPES= ["vegan_meal", "vegetarian_meal","non_vegetarian_meal", "kitchen", "bathroom", "deep_clean", "jain_meal", "cooking_cleaning", "cooking_cleaning_washing"]
router = APIRouter()



TIME_SLOT_MAPPING = {
    TimeSlot.MORNING: (time(9, 0), time(12, 0)),
    TimeSlot.MIDDAY: (time(12, 0), time(15, 0)),
    TimeSlot.AFTERNOON_EVENING: (time(15, 0), time(20, 0)),
    TimeSlot.NIGHT: (time(20, 0), time(23, 0))
}


class ProviderSearchRequest(BaseModel):
    parent_service_id: Optional[int]  # Optional filter by parent service
    subservice_name: Optional[SubServiceName]  # Optional filter by subservice
    location: Optional[str]  # Optional location filter

# Example customizations for sub-services
class CookingCustomization(BaseModel):
    sub_service_id: str
    number_of_people: int

class CleaningCustomization(BaseModel):
    sub_service_id: str
    number_of_rooms: int

# BookingRequest model that accepts multiple sub-services and customizations
class BookingRequest(BaseModel):
    sub_service_names: dict
    booked_date: datetime  # The date on which the booking is made
    provider_id: str
    client_id: str
    time_slot: TimeSlot
    customizations: Optional[List[Union[CookingCustomization, CleaningCustomization]]]
 

async def map_service_type_with_id(filter_request):
    services_ids = []
    for key,value in filter_request.items():
        if value in SERVICE_TYPES:
            query = {"name": value}
            services = await SubService.search_document(query)
            if services:
                services_ids.append(str(services[0].id))
    return services_ids

@router.post(
    "/bookings",
    response_model=Booking,
    include_in_schema=not bool(os.getenv("SHOW_OPEN_API_ENDPOINTS")),
)

async def book_service(booking_request: BookingRequest, current_user: User = Depends(get_current_user)):
    # Fetch provider and their existing bookings
    provider = await User.get_document(doc_id=booking_request.provider_id)
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    # Fetch all bookings for the provider within the requested time slot
    provider_bookings = await Booking.search_document({"provider_id": booking_request.provider_id, "deleted_at": None})

    # Get booked time slots within the selected time slot
    provider_booked_time_slots = [
        booking for booking in provider_bookings if booking.time_slot == booking_request.time_slot
    ]
    
    subservices_ids = await map_service_type_with_id(booking_request.sub_service_names)
    # Fetch all sub-services to get their durations and base prices
    sub_services = [await SubService.get_document(doc_id=sub_service_id) for sub_service_id in subservices_ids]
    if not sub_services:
        raise HTTPException(status_code=404, detail="One or more sub-services not found")

    # Calculate total duration and total price based on customizations
    total_duration = timedelta()
    total_price = 0

    # Dictionary to store sub-service durations and prices
    sub_service_details = {}
    
    for sub_service in sub_services:
        # Calculate base duration and price
        print()
        sub_service_duration = timedelta(hours=sub_service.duration)
        sub_service_price = sub_service.base_price

        # Apply customizations if provided
        for customization in booking_request.customizations or []:
            
            if customization.sub_service_id == str(sub_service.id):
                if isinstance(customization, CookingCustomization):
                    # Increase price based on number of people
                    sub_service_price += (customization.number_of_people -2)  * sub_service.price_per_extra_person   # 10 currency units per person

                elif isinstance(customization, CleaningCustomization):
                    # Increase price based on number of rooms
                    print(sub_service.price_per_extra_room)
                    sub_service_price += (customization.number_of_rooms - 2) * sub_service.price_per_extra_room  # 15 currency units per room

        # Store the sub-service's total duration and price
        sub_service_details[sub_service.id] = {
            "duration": sub_service_duration,
            
            "price": sub_service_price
        }

        # Add to the total duration and price
        total_duration += sub_service_duration
        total_price += sub_service_price

    # Fetch the start and end time of the requested time slot (morning, midday, etc.)
    slot_start, slot_end = TIME_SLOT_MAPPING[booking_request.time_slot]

    # Calculate available time within the time slot by removing conflicts with booked slots
    available_times = [(slot_start, slot_end)]  # Initially, the entire time slot is available

    # Remove booked times from available times
    for booking in provider_booked_time_slots:
        booked_start, booked_end = booking.start_time.time(), booking.end_time.time()

        for i, (avail_start, avail_end) in enumerate(available_times):
            if avail_start < booked_start < avail_end:  # Conflict at the start
                available_times[i] = (avail_start, booked_start)
            if avail_start < booked_end < avail_end:  # Conflict at the end
                available_times[i] = (booked_end, avail_end)
            if booked_start <= avail_start and booked_end >= avail_end:  # Fully booked
                available_times[i] = None

        # Clean up any None values (fully booked slots)
        available_times = [slot for slot in available_times if slot]

    # Now check if any available time can accommodate the combined duration of all sub-services
    booking_start_time = None
    for avail_start, avail_end in available_times:
        # Combine available start and end times with the booked date to get datetime objects
        avail_start_dt = datetime.combine(booking_request.booked_date, avail_start)
        avail_end_dt = datetime.combine(booking_request.booked_date, avail_end)

        # Check if the available slot can accommodate the total duration
        if avail_end_dt - avail_start_dt >= total_duration:
            booking_start_time = avail_start_dt
            break

    if not booking_start_time:
        raise HTTPException(status_code=400, detail="No available time slots for the selected time period.")

    # Calculate end time based on combined duration
    booking_end_time = booking_start_time + total_duration

    # Create the single booking entry with combined sub-service details

    booking = Booking(
        provider_id=booking_request.provider_id,
        client_id=booking_request.client_id,
        subservice_ids=subservices_ids,  # Storing sub-services with their details
        time_slot=booking_request.time_slot,
        start_time=booking_start_time,
        end_time=booking_end_time,
        frequency=ServiceFrequency.ONE_TIME,
        total_price=total_price,
        booked_date=booking_request.booked_date,
    )

    # Save the booking to the database
    await Booking.save_document(doc=booking)
    #payment_intent = charge_client_for_booking(request.amount, current_user, request.description)
    return booking


@router.get(
    "/bookings",
    response_model=List[Booking],
    include_in_schema=not bool(os.getenv("SHOW_OPEN_API_ENDPOINTS")),
)

async def get_user_bookings(current_user: User = Depends(get_current_user)):
    client_bookings = await Booking.search_document({"client_id": str(current_user.id),  "deleted_at": None})
    for booking in client_bookings:
        booking_metadata = {}       
        provider_id = booking.provider_id
        provider = await User.get_document(doc_id=provider_id)
        booking_metadata[provider_id] = provider
        subservice_ids = booking.subservice_ids
        for subservice_id in subservice_ids:
            service = await SubService.get_document(doc_id=subservice_id)
            booking_metadata[subservice_id] = service
        booking.metadata = booking_metadata
    return client_bookings
