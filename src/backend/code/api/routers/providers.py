""" This file holds all the internal routers required to interact with projects """
from datetime import datetime, date, timedelta, time
import os
from typing import List, Optional

from services.user_management.utils import get_current_user
from beanie.odm.operators.find.logical import And
from bson import ObjectId
import core.dbs
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Body
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
    """
    Search for available providers based on filter criteria and booking status.
    """
    booking_service = BookingService()
    return await booking_service.get_available_providers(
        filter_request=filter_request.filter,
        service_types=SERVICE_TYPES
    )

@router.get("/subservices/all")
async def get_all_subservices():
    """Get all available subservices in the platform"""
    try:
        # Fetch all parent services first
        parent_services = await ParentService.get_all_documents()
        
        # Collect all subservices
        all_subservices = []
        for parent in parent_services:
            subservices = await SubService.get_documents_by_query(
                {"parent_service_id": parent.id}
            )
            for sub in subservices:
                all_subservices.append({
                    "id": sub.id,
                    "name": sub.name,
                    "description": sub.description,
                    "parent_service": {
                        "id": parent.id,
                        "name": parent.name,
                        "icon": parent.icon
                    }
                })
        
        return all_subservices
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch subservices: {str(e)}"
        )

@router.get("/provider/dashboard")
async def get_provider_dashboard(current_user: User = Depends(get_current_user)):
    """Get provider dashboard with payment tracking"""
    try:
        # Get all bookings for the provider
        bookings = await Booking.search_document({"provider_id": str(current_user.id)})
        
        # Calculate earnings only from PAYMENT_MADE bookings
        total_earnings = sum(
            booking.total_price 
            for booking in bookings 
            if booking.status == BookingStatus.PAYMENT_MADE
        )
        
        # Get counts for different booking statuses
        completed_bookings = len([
            b for b in bookings 
            if b.status == BookingStatus.PAYMENT_MADE
        ])
        
        pending_payments = len([
            b for b in bookings 
            if b.status == BookingStatus.CONFIRMED
        ])

        print("bookings", total_earnings, completed_bookings, pending_payments)
        
        return {
            "total_earnings": total_earnings,
            "completed_bookings": completed_bookings,
            "pending_payments": pending_payments,
            "recent_bookings": sorted(
                [b for b in bookings if b.status != BookingStatus.EXPIRED],
                key=lambda x: x.booked_date,
                reverse=True
            )[:10],
            "upcoming_bookings": sorted(
                [b for b in bookings if b.status == BookingStatus.CONFIRMED],
                key=lambda x: x.booked_date,
                reverse=True
            )[:10]
            
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class RatingRequest(BaseModel):
    provider_id: str
    booking_id: str
    rating: int
    comment: Optional[str] = None

@router.post("/provider/rate")
async def rate_provider(
    rating_data: RatingRequest,
    current_user: User = Depends(get_current_user)
):
    """Rate a provider after service completion"""
    try:
        # Verify booking exists and is completed
        booking = await Booking.get_document(rating_data.booking_id)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
            
        if booking.client_id != str(current_user.id):
            raise HTTPException(status_code=403, detail="Not authorized to rate this booking")
            
        if booking.status != BookingStatus.PAYMENT_MADE:
            raise HTTPException(status_code=400, detail="Can only rate after payment is made")

        # Get provider
        provider = await User.get_document(rating_data.provider_id)
        if not provider:
            raise HTTPException(status_code=404, detail="Provider not found")

        # Update provider ratings
        if not provider.ratings:
            provider.ratings = UserRatings()

        provider.ratings.total += rating_data.rating
        provider.ratings.count += 1
        provider.ratings.average = provider.ratings.total / provider.ratings.count
        provider.ratings.comments.append(rating_data.comment)

        # Save the updated provider
        await User.save_document(doc=provider)

        # Add rating to booking
        booking.rating = rating_data.rating
        booking.rating_comment = rating_data.comment
        await Booking.save_document(doc=booking)

        return {
            "message": "Rating submitted successfully",
            "new_average": provider.ratings.average
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))






       
       
       
       



    

