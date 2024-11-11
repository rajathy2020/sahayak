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


@router.get(
    "/users/me", include_in_schema=not bool(os.getenv("SHOW_OPEN_API_ENDPOINTS"))
)
async def read_users_me(
    request: Request, current_user: User = Depends(get_current_user)
):
    """Get the system user"""
    
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

    return await User.save_document(doc = current_user)