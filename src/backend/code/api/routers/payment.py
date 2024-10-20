from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from services.user_management.utils import get_current_user
from services.payment.stripe_payment import (
    create_service_provider_account,
    create_stripe_service_provider_setup_link,
    create_stripe_customer,
    create_stripe_client_card_setup_url,
    charge_client_for_booking,
    payout_to_provider,
)
from shared.models import User

router = APIRouter()

# Create Service Provider Account
@router.post("/payment/create_service_provider_account")
async def create_service_provider(current_user: User = Depends(get_current_user)):
    account = create_service_provider_account(current_user)
    if not account:
        raise HTTPException(status_code=500, detail="Failed to create service provider account.")
    current_user.stripe_account_id = account.id
    current_user = await User.save_document(doc = current_user)
    return current_user

# Redirect Service Provider for Onboarding (Stripe URL)
@router.get("/payment/service_provider_onboard")
async def service_provider_onboard(current_user: User = Depends(get_current_user)):
    setup_link = create_stripe_service_provider_setup_link(current_user)
    if not setup_link:
        raise HTTPException(status_code=500, detail="Failed to generate Stripe setup link.")
    return {"setup_url": setup_link}

# Create Stripe Customer (Client)
@router.post("/payment/create_client")
async def create_client(current_user: User = Depends(get_current_user)):
    customer = create_stripe_customer(current_user)
    if not customer:
        raise HTTPException(status_code=500, detail="Failed to create Stripe customer.")
    current_user.stripe_customer_id = customer.id
    current_user = await User.save_document(doc = current_user)
    return current_user


# Setup Client Card (Stripe Checkout URL)
@router.get("/payment/client_setup_card")
async def client_setup_card(current_user: User = Depends(get_current_user)):
    setup_url = create_stripe_client_card_setup_url(current_user)
    if not setup_url:
        raise HTTPException(status_code=500, detail="Failed to generate card setup link.")
    return {"setup_url": setup_url}

# Charge Client for Booking
class BookingChargeRequest(BaseModel):
    amount: int  # amount in cents
    description: str = "Service Booking"

@router.post("/payment/charge_client")
async def charge_client(request: BookingChargeRequest, current_user: User = Depends(get_current_user)):
    payment_intent = charge_client_for_booking(request.amount, current_user, request.description)
    if not payment_intent:
        raise HTTPException(status_code=500, detail="Failed to charge the client.")
    return {"payment_intent_id": payment_intent.id}

# Payout to Service Provider
class PayoutRequest(BaseModel):
    amount: int  # amount in cents

@router.post("/payment/payout_provider")
async def payout_provider(request: PayoutRequest, current_user: User = Depends(get_current_user)):
    payout = payout_to_provider(current_user, request.amount)
    if not payout:
        raise HTTPException(status_code=500, detail="Failed to payout to the provider.")
    return {"payout_id": payout.id}

