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

SERVICE_TYPES= ["vegan_meal", "vegetarian_meal","non_vegetarian_meal", "kitchen", "bathroom", "deep_clean"]

router = APIRouter()

class ProviderSearchRequest(BaseModel):
    filter: Optional[dict] = None
    page_number: int = 1  # Optional filter by parent service
    page_size:int = 50   # Optional filter by subservice
    sort_by: str = "created_at"
    order_by: str = "asc"

   

@router.post(
    "/providers/search",
    response_model = List[User],
    include_in_schema=not bool(os.getenv("SHOW_OPEN_API_ENDPOINTS")),
)
async def search_providers_by_filter_params(
    filter_request:ProviderSearchRequest,
    current_user: User = Depends(get_current_user),

):
    
    filter = filter_request.filter
    subservices = await map_service_type_with_id(filter)
    query = {"services_offered": {"$in": subservices}}
    service_providers =  await User.search_document(query)

    if not service_providers:
        return []
        
   
    for service_provider in service_providers:
        services_offered_details = []
        for service_offered in service_provider.services_offered:
           sub_service = await SubService.get_document(doc_id = service_offered)
           if sub_service:
                services_offered_details.append(sub_service)

        service_provider.services_offered_details = services_offered_details


    return service_providers
       

async def map_service_type_with_id(filter_request):
    services_ids = []
    for key,value in filter_request.items():
        if value in SERVICE_TYPES:
            query = {"name": value}
            services = await SubService.search_document(query)
            if services:
                services_ids.append(str(services[0].id))
    return services_ids






       
       
       
       



    

