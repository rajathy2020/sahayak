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

class SubServiceListResponse(BaseModel):
    parent_service_id: str
    subservices: List[SubService]  


class ServicePostRequest(BaseModel):
    name: str 
    image: str
    


class ServiceUpdateRequest(BaseModel):
    name: Optional[str]
    image: Optional[str]
    

class PriceCalculationRequest(BaseModel):
    sub_service_names: List[str]
    number_of_persons: Optional[int]
    number_of_rooms: Optional[int]
    

INCREMENT_PRICE_PER_UNIT = 5

@router.get(
    "/parent_services",
    response_model=List[ParentService],
    include_in_schema=not bool(os.getenv("SHOW_OPEN_API_ENDPOINTS")),
)
async def get_services(current_user: User = Depends(get_current_user)):
    query = And(ParentService.deleted_at == None)

    services = await ParentService.search_document(
        query, sort_by=ParentService.created_at, order_by="Asc"
    )
    print(services)

    return services


@router.post(
    "/parent_services",
    response_model=ParentService,
    include_in_schema=not bool(os.getenv("SHOW_OPEN_API_ENDPOINTS")),
)
async def post_service(
    request: ServicePostRequest,
    current_user: User = Depends(get_current_user),
):
    service = ParentService(
        
        name=request.name,
        image=request.image
        
    )

    service = await ParentService.save_document(service)
    return service


@router.get(
    "/parent_services/{id}",
    response_model=ParentService,
    include_in_schema=not bool(os.getenv("SHOW_OPEN_API_ENDPOINTS")),
)
async def get_service_by_id(
    id: str, current_user: User = Depends(get_current_user)
):
    query = And(
        ParentService.id == ObjectId(id),
        ParentService.deleted_at == None,
    )

    services = await ParentService.search_document(
        query, sort_by=ParentService.created_at, order_by="Asc"
    )

    if not services:
        raise HTTPException(status_code=404, detail="Service not found")

    return services[0]


@router.put(
    "/parent_services/{id}",
    response_model=ParentService,
    include_in_schema=not bool(os.getenv("SHOW_OPEN_API_ENDPOINTS")),
)
async def update_service_by_id(
    id: str,
    request: ServiceUpdateRequest,
    current_user: User = Depends(get_current_user),
):
    query = And(
        ParentService.id == ObjectId(id),
        ParentService.deleted_at == None,
    )

    services = await ParentService.search_document(
        query, sort_by=ParentService.created_at, order_by="Asc"
    )

    if not services:
        raise HTTPException(status_code=404, detail="Service not found")

    service = services[0]
    if request.name:
        service.name = request.name

   

    print(service)        
    return await ParentService.save_document(service)


@router.delete(
    "/parent_services/{id}",
    response_model=ParentService,
    include_in_schema=not bool(os.getenv("SHOW_OPEN_API_ENDPOINTS")),
)
async def delete_service(
    id: str,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
):
    # TODO: Rajat Remove all documents from the service

    query = And(ParentService.id == ObjectId(id))

    services = await ParentService.search_document(
        query, sort_by=ParentService.created_at, order_by="Asc"
    )

    if not services:
        raise HTTPException(status_code=404, detail="Project not found")

    service = services[0]
    service.deleted_at = datetime.now()


    return await ParentService.save_document(doc=service)



@router.get(
    "/parent_services/{id}/sub_services",
    response_model=List[SubService],
    include_in_schema=not bool(os.getenv("SHOW_OPEN_API_ENDPOINTS")),
)
async def get_sub_services(
    id: str,
    current_user: User = Depends(get_current_user),
):

    query = {"parent_service_id": str(id)}
    sub_services = await SubService.search_document(
        query, sort_by=SubService.created_at, order_by="Asc"
    )

    if not sub_services:
        raise HTTPException(status_code=404, detail="Project not found")

    return sub_services
   

@router.get(
    "/parent_services/{id}/sub_services",
    response_model=List[SubService],
    include_in_schema=not bool(os.getenv("SHOW_OPEN_API_ENDPOINTS")),
)
async def get_sub_services(
    id: str,
    current_user: User = Depends(get_current_user),
):

    query = {"parent_service_id": str(id)}
    sub_services = await SubService.search_document(
        query, sort_by=SubService.created_at, order_by="Asc"
    )

    if not sub_services:
        raise HTTPException(status_code=404, detail="Project not found")

    return sub_services


@router.post(
    "/parent_services/{name}/calculate_price",
    response_model=dict,
    include_in_schema=not bool(os.getenv("SHOW_OPEN_API_ENDPOINTS")),
)
async def get_sub_services(
    name: str,
    request: PriceCalculationRequest,
    current_user: User = Depends(get_current_user),
):
    price = 0
    for sub_service in request.sub_service_names:
        query = {"name": sub_service}
        sub_services = await SubService.search_document(
            query, sort_by=SubService.created_at, order_by="Asc"
        )
        price += sub_services[0].base_price
        
    if request.number_of_persons:
        price += (request.number_of_persons-2)*INCREMENT_PRICE_PER_UNIT
        
    if request.number_of_rooms:
        price += (request.number_of_rooms -2)*INCREMENT_PRICE_PER_UNIT
    
    return {"price":price}


@router.get(
    "/subservices",
    response_model=List[SubService],
    include_in_schema=not bool(os.getenv("SHOW_OPEN_API_ENDPOINTS")),
)
async def get_all_subservices(current_user: User = Depends(get_current_user)):
    """Get all available subservices grouped by parent service"""

    return await SubService.search_document(query={}, sort_by=SubService.created_at, order_by="Asc")


