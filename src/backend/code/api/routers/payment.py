from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from services.user_management.utils import get_current_user
from services.payment.stripe_payment import (
    create_service_provider_stripe_account,
    create_stripe_service_provider_setup_link,
    create_stripe_customer,
    create_stripe_client_card_setup_url,
    charge_client_for_booking,
    payout_to_provider,
)
from shared.models import User
import stripe
from backend.code.services.notification.whatsappnotification import WhatsappNotification
router = APIRouter()

# Create Service Provider Account
@router.post("/payment/create_service_provider_account")
async def create_service_provider_account(current_user: User = Depends(get_current_user)):
    user = await User.get_document(doc_id = "672a02557c1a294cd5aafa0f")
    print(user)
    account = create_service_provider_stripe_account(user)
    print(account)
    if not account:
        raise HTTPException(status_code=500, detail="Failed to create service provider account.")
    user.stripe_account_id = account.id
    user = await User.save_document(doc = user)
    return user

# Redirect Service Provider for Onboarding (Stripe URL)
@router.get("/payment/service_provider_onboard")
async def service_provider_onboard(current_user: User = Depends(get_current_user)):
    user = await User.get_document(doc_id = "672a02557c1a294cd5aafa0f")
    setup_link = create_stripe_service_provider_setup_link(user)
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
    if not current_user.stripe_customer_id:
        customer = create_stripe_customer(current_user)
        current_user.stripe_customer_id = customer.id
        current_user = await User.save_document(doc = current_user)
    setup_url = create_stripe_client_card_setup_url(current_user)
    if not setup_url:
        raise HTTPException(status_code=500, detail="Failed to generate card setup link.")
    return {"setup_url": setup_url}
    payment_methods = stripe.PaymentMethod.list(
            customer=current_user.stripe_customer_id,
            type="card"  # Change "card" to another payment method type if needed
    )

    current_user.payment_methods = payment_methods.data 
    return await User.save_document(doc = current_user)
    

# Charge Client for Booking
class BookingChargeRequest(BaseModel):
    amount: int  # amount in cents
    payment_method_id: str
    description: str = "Service Booking"

@router.post("/payment/charge_client")
async def charge_client(request: BookingChargeRequest, current_user: User = Depends(get_current_user)):
    payment_intent = charge_client_for_booking(request.amount, request.payment_method_id,current_user, request.description)
    if not payment_intent:
        raise HTTPException(status_code=500, detail="Failed to charge the client.")
    WhatsappNotification.charge_client(current_user)
    return {"payment_intent_id": payment_intent.id}

# Payout to Service Provider
class PayoutRequest(BaseModel):
    amount: int # amount in cents
    provider_id: str

@router.post("/payment/payout_provider")
async def payout_provider(request: PayoutRequest, current_user: User = Depends(get_current_user)):
    provider = await User.get_document(doc_id=request.provider_id)
    payout = payout_to_provider(provider, request.amount)
    if not payout:
        raise HTTPException(status_code=500, detail="Failed to payout to the provider.")
    return {"payout_id": payout.id}

