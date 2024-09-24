""" This file holds all the routers required to interact with User and API key """
import os
import string

from fastapi import APIRouter, Depends, Request, HTTPException

from api.config import *
from shared.models import *
import core.dbs
from services.user_management.utils import get_current_user

router = APIRouter()
alphabet = string.ascii_letters + string.digits


@router.get(
    "/users/me", include_in_schema=not bool(os.getenv("SHOW_OPEN_API_ENDPOINTS"))
)
async def read_users_me(
    request: Request, current_user: User = Depends(get_current_user)
):
    """Get the system user"""

    current_user_dict = current_user.dict()


    

    return {"user": current_user_dict}


# 