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



class ServicePostRequest(BaseModel):
    name: str 
    


class ServiceUpdateRequest(BaseModel):
    name: Optional[str]
    

@router.get(
    "/services",
    response_model=List[Service],
    include_in_schema=not bool(os.getenv("SHOW_OPEN_API_ENDPOINTS")),
)
async def get_services(current_user: User = Depends(get_current_user)):
    query = And(Service.deleted_at == None)

    services = await Service.search_document(
        query, sort_by=Service.created_at, order_by="Asc"
    )

    return services


@router.post(
    "/services",
    response_model=Service,
    include_in_schema=not bool(os.getenv("SHOW_OPEN_API_ENDPOINTS")),
)
async def post_service(
    request: ServicePostRequest,
    current_user: User = Depends(get_current_user),
):
    service = Service(
        
        name=request.name,
        
    )

    service = await Service.save_document(service)
    return service


@router.get(
    "/services/{id}",
    response_model=Service,
    include_in_schema=not bool(os.getenv("SHOW_OPEN_API_ENDPOINTS")),
)
async def get_service_by_id(
    id: str, current_user: User = Depends(get_current_user)
):
    query = And(
        Service.id == ObjectId(id),
        Service.deleted_at == None,
    )

    services = await Service.search_document(
        query, sort_by=Service.created_at, order_by="Asc"
    )

    if not services:
        raise HTTPException(status_code=404, detail="Service not found")

    return services[0]


@router.put(
    "/services/{id}",
    response_model=Service,
    include_in_schema=not bool(os.getenv("SHOW_OPEN_API_ENDPOINTS")),
)
async def update_service_by_id(
    id: str,
    request: ServiceUpdateRequest,
    current_user: User = Depends(get_current_user),
):
    query = And(
        Service.id == ObjectId(id),
        Service.deleted_at == None,
    )

    services = await Service.search_document(
        query, sort_by=Service.created_at, order_by="Asc"
    )

    if not services:
        raise HTTPException(status_code=404, detail="Service not found")

    service = services[0]
    if request.name:
        service.name = request.name

   

    print(service)        
    return await Service.save_document(service)


@router.delete(
    "/services/{id}",
    response_model=Service,
    include_in_schema=not bool(os.getenv("SHOW_OPEN_API_ENDPOINTS")),
)
async def delete_service(
    id: str,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
):
    # TODO: Rajat Remove all documents from the service

    query = And(Service.id == ObjectId(id))

    services = await Service.search_document(
        query, sort_by=Service.created_at, order_by="Asc"
    )

    if not services:
        raise HTTPException(status_code=404, detail="Project not found")

    service = services[0]
    service.deleted_at = datetime.now()


    return await Service.save_document(doc=service)


