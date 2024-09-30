""" This file holds all the internal routers required to interact with projects """
from datetime import datetime
import os
from typing import List, Optional

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

router = APIRouter()

TIME_SLOT_MAPPING = {
    TimeSlot.MORNING: (time(9, 0), time(12, 0)),
    TimeSlot.MIDDAY: (time(12, 0), time(15, 0)),
    TimeSlot.AFTERNOON_EVENING: (time(15, 0), time(20, 0)),
    TimeSlot.Night: (time(20, 0), time(23, 0))
}
       

class BookingRequest(BaseModel):
    sub_service_id: str
    provider_id: str
    client_id: str
    time_slot: TimeSlot
    frequency: ServiceFrequency


class ProviderSearchRequest(BaseModel):
    parent_service_id: Optional[int]  # Optional filter by parent service
    subservice_name: Optional[SubServiceName]  # Optional filter by subservice
    location: Optional[str]  # Optional location filter
   

@router.post(
    "/bookings",
    response_model=Booking,
    include_in_schema=not bool(os.getenv("SHOW_OPEN_API_ENDPOINTS")),
)
async def book_service(
    booking_request: BookingRequest,
    current_user: User = Depends(get_current_user),
):
    # Fetch provider and their existing bookings
    provider = await User.get_document(doc_id=booking_request.provider_id)
    
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    provider_bookings = await Booking.search_document({"provider_id": booking_request.provider_id})

    # Get booked time slots within the selected time slot
    provider_booked_time_slots = [
        booking for booking in provider_bookings if booking.time_slot == booking_request.time_slot
    ]
    
    # Fetch the requested subservice to get its duration
    sub_service = await SubService.get_document(doc_id=booking_request.sub_service_id)
    
    if not sub_service:
        raise HTTPException(status_code=404, detail="Subservice not found")
    
    time_required_to_finish_sub_service = sub_service.duration  # Assume it's a timedelta

    # Fetch the start and end time of the requested time slot (morning, midday, etc.)
    slot_start, slot_end = TIME_SLOT_MAPPING[booking_request.time_slot]

    # Calculate available time within the time slot by removing conflicts with booked slots
    available_times = [(slot_start, slot_end)]  # Initially, the entire time slot is available

    # Remove booked times from available times
    for booking in provider_booked_time_slots:
        booked_start, booked_end = booking.start_time, booking.end_time

        for i, (avail_start, avail_end) in enumerate(available_times):
            if avail_start < booked_start < avail_end:  # Conflict at the start
                available_times[i] = (avail_start, booked_start)
            if avail_start < booked_end < avail_end:  # Conflict at the end
                available_times[i] = (booked_end, avail_end)
            if booked_start <= avail_start and booked_end >= avail_end:  # Fully booked
                available_times[i] = None

        # Clean up any None values (fully booked slots)
        available_times = [slot for slot in available_times if slot]

    # Now check if any available time can accommodate the service's duration
    booking_start_time = None
    for avail_start, avail_end in available_times:
        if datetime.combine(datetime.today(), avail_end) - datetime.combine(datetime.today(), avail_start) >= time_required_to_finish_sub_service:
            booking_start_time = avail_start
            break

    if not booking_start_time:
        raise HTTPException(status_code=400, detail="No available time slots for the selected time period.")

    # Calculate end time based on service duration
    booking_end_time = (datetime.combine(datetime.today(), booking_start_time) + time_required_to_finish_sub_service).time()

    # Create the booking entry
    booking = Booking(
        provider_id=booking_request.provider_id,
        client_id=booking_request.client_id,
        subservice_id=booking_request.sub_service_id,
        time_slot=booking_request.time_slot,
        start_time=booking_start_time,
        end_time=booking_end_time,
        frequency=booking_request.frequency,
        total_price=sub_service.price,  # Assuming price is a fixed value in SubService
    )

    await Booking.save_document(doc = booking)

    return booking

       



    

