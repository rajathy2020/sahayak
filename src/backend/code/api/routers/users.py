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



    return await User.save_document(doc = current_user)
