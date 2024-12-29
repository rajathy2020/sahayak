""" This file holds all the routers required to interact with User and API key """
import os
import string

from fastapi import APIRouter, Depends, Request, HTTPException

from api.config import *
from shared.models import *
import core.dbs
from services.user_management.utils import get_current_user
from pydantic import BaseModel
from services.payment import stripe_payment


router = APIRouter()
alphabet = string.ascii_letters + string.digits



class UserUpdateRequest(BaseModel):
    user_type: Optional[Usertype] = None
    city: Optional[City] = None
    whatsapp_number: Optional[str] = None
    address: Optional[str] = None
    name: Optional[str] = None
    services_offered: Optional[List[str]] = None
    available_time_slots: Optional[List[TimeSlot]] = None
    available_dates: Optional[Dict[str, List[TimeSlot]]] = None
    blocked_dates: Optional[List[datetime]] = Field(
        default=[],
        description="List of dates when provider is not available"
    )
    default_payment_method_id: Optional[str] = None
    


@router.get(
    "/users/me", include_in_schema=not bool(os.getenv("SHOW_OPEN_API_ENDPOINTS"))
)
async def read_users_me(
    request: Request, current_user: User = Depends(get_current_user)
):
    """Get the system user"""
    
    user_bookings  = await Booking.search_document({"client_id": str(current_user.id),  "deleted_at": None})
    current_user.number_of_bookings = len(user_bookings)
    
    
    return current_user

   
@router.get(
    "/users/detailed_info", include_in_schema=not bool(os.getenv("SHOW_OPEN_API_ENDPOINTS"))
)
async def read_user_details(
    request: Request, current_user: User = Depends(get_current_user)
):
    """Get the system user"""
    
    payment_details = stripe_payment.get_client_payment_info(current_user.stripe_customer_id)
    
    current_user.stripe_paymemt_methods = payment_details
    user_bookings  = await Booking.search_document({"client_id": str(current_user.id),  "deleted_at": None})
    current_user.number_of_bookings = len(user_bookings)
    # sort blocked dates
    current_user.blocked_dates = sorted(current_user.blocked_dates, key=lambda x: x.date())
    if len(current_user.stripe_paymemt_methods) == 1:
        current_user.default_payment_method_id = current_user.stripe_paymemt_methods[0].get("payment_method_id")
    return current_user



@router.put(
    "/users/{id}", include_in_schema=not bool(os.getenv("SHOW_OPEN_API_ENDPOINTS"))
)
async def update_users(
    id: str,
    user_update_request: UserUpdateRequest,
    request: Request, current_user: User = Depends(get_current_user)
):
    """Get the system user"""


    print(user_update_request, "user_update_request")


    if user_update_request.user_type:
        current_user.user_type = user_update_request.user_type

    if user_update_request.city:
        current_user.city = user_update_request.city
    
    if user_update_request.whatsapp_number:
        current_user.whatsapp_number = user_update_request.whatsapp_number

    if user_update_request.address:
        current_user.address = user_update_request.address
    
    if user_update_request.name:
        current_user.name = user_update_request.name

    if user_update_request.services_offered:
        current_user.services_offered = user_update_request.services_offered

    if user_update_request.available_time_slots:
        current_user.available_time_slots = user_update_request.available_time_slots

    if user_update_request.available_dates:
        current_user.available_dates = user_update_request.available_dates

    if user_update_request.blocked_dates:
        current_user.blocked_dates = user_update_request.blocked_dates

    if user_update_request.default_payment_method_id:
        current_user.default_payment_method_id = user_update_request.default_payment_method_id


    return await User.save_document(doc = current_user)
