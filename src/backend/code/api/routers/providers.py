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


router = APIRouter()

class ProviderSearchRequest(BaseModel):
    parent_service_id: Optional[int]  # Optional filter by parent service
    subservice_name: Optional[SubServiceName]  # Optional filter by subservice
    location: Optional[str]  # Optional location filter
   

@router.post(
    "/providers/search",
    response_model = ProviderSearchRequest,
    include_in_schema=not bool(os.getenv("SHOW_OPEN_API_ENDPOINTS")),
)
async def search_providers_by_filter_params(
    filter_request:ProviderSearchRequest,
    current_user: User = Depends(get_current_user),

):
    
    service_providers =  await ServiceProvider.filter_and_paginate(filter_request)
   
    for service_provider in service_providers:
        services_offered_details = []
        for service_offered in service_provider.services_offered:
           sub_service = SubService.get_document(doc_id = service_offered)
           services_offered_details.append(sub_service)

        service_provider.services_offered_details = services_offered_details

    return service_providers
       

       
       
       
       



    

