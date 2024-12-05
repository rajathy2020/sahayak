""" This file holds all the internal routers required to interact with projects """
from datetime import datetime, date, timedelta, time
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
from services.booking.booking import BookingService

SERVICE_TYPES= ["vegan_meal", "vegetarian_meal","non_vegetarian_meal", "kitchen", "bathroom", "deep_clean"]

router = APIRouter()

class ProviderSearchRequest(BaseModel):
    filter: Optional[dict] = None
    page_number: int = 1
    page_size: int = 50
    sort_by: str = "created_at"
    order_by: str = "asc"

@router.post(
    "/providers/search",
    response_model=List[User],
    include_in_schema=not bool(os.getenv("SHOW_OPEN_API_ENDPOINTS")),
)
async def search_providers_by_filter_params(
    filter_request: ProviderSearchRequest,
    current_user: User = Depends(get_current_user),
):
    booking_service = BookingService()
    return await booking_service.get_available_providers(
        filter_request=filter_request.filter,
        service_types=SERVICE_TYPES
    )






       
       
       
       



    

