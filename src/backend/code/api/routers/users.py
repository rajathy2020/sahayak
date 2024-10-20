""" This file holds all the routers required to interact with User and API key """
import os
import string

from fastapi import APIRouter, Depends, Request, HTTPException

from api.config import *
from shared.models import *
import core.dbs
from services.user_management.utils import get_current_user
from pydantic import BaseModel
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

    current_user_dict = current_user.dict()

    return {"user": current_user_dict}



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