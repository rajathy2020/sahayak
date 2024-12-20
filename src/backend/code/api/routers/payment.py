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
    remove_payment_method,
    is_provider_payment_info_complete
)
from shared.models import User, Booking, BookingStatus
from services.notification.whatsappnotification import WhatsappNotification
from datetime import datetime
router = APIRouter()

# Create Service Provider Account
@router.post("/payment/create_service_provider_account")
async def create_service_provider_account(current_user: User = Depends(get_current_user)):
    if current_user.stripe_account_id:
        return current_user
    account = create_service_provider_stripe_account(current_user)
    if not account:
        raise HTTPException(status_code=500, detail="Failed to create service provider account.")
    current_user.stripe_account_id = account.id
    current_user = await User.save_document(doc = current_user)
    return current_user

# Redirect Service Provider for Onboarding (Stripe URL)
@router.get("/payment/service_provider_onboard")
async def service_provider_onboard(current_user: User = Depends(get_current_user)):
    print(current_user, "current_user")
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
    booking_id: str
    amount: int  # amount in cents
    payment_method_id: str
    description: str = "Service Booking"

@router.post("/payment/charge_client")
async def charge_client(request: BookingChargeRequest, current_user: User = Depends(get_current_user)):
    payment_intent = charge_client_for_booking(request.amount, request.payment_method_id,current_user, request.description)
    if not payment_intent:
        raise HTTPException(status_code=500, detail="Failed to charge the client.")
    #WhatsappNotification.charge_client(current_user)
    booking = await Booking.get_document(doc_id = request.booking_id)
    booking.total_price = request.amount
    booking.status = BookingStatus.CONFIRMED
    booking.payment_intent_id = payment_intent.id
    await Booking.save_document(doc=booking)
    return {"payment_intent_id": payment_intent.id}

# Payout to Service Provider
class PayoutRequest(BaseModel):
    booking_id: str
    amount: float

@router.post("/payment/payout_provider")
async def payout_provider(request: PayoutRequest, current_user: User = Depends(get_current_user)):
    """Process payout to provider and update booking status"""
    try:
        # Get the booking
        booking = await Booking.get_document(request.booking_id)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        print(booking, "booking")

        # Verify booking is in CONFIRMED status
        if booking.status != BookingStatus.CONFIRMED:
            raise HTTPException(
                status_code=400, 
                detail="Only confirmed bookings can be paid out to provider"
            )

        # Get the provider
        provider = await User.get_document(booking.provider_id)
        if not provider:
            raise HTTPException(status_code=404, detail="Provider not found")


        print(provider.stripe_account_id, "provider")
        # Process the payout via Stripe
        try:
            payout_result = payout_to_provider(
                amount=int(1000),
                provider_stripe_account_id=provider.stripe_account_id,
                description=f"Payout for booking {booking.id}"
            )
            print(payout_result, "payout_result")

            # Update booking status after successful payout
            booking.status = BookingStatus.PAYMENT_MADE
            booking.payout_id = payout_result.get('id')
            booking.paid_at = datetime.utcnow()
            await Booking.save_document(doc=booking)

            return {
                "message": "Provider payment processed successfully",
                "payout_id": payout_result.get('id'),
                "booking_id": str(booking.id),
                "should_rate": True
            }

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to process provider payment: {str(e)}"
            )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing provider payment: {str(e)}"
        )

@router.delete("/payment/remove_payment_method/{payment_method_id}")
async def remove_payment_method_endpoint(
    payment_method_id: str,
    current_user: User = Depends(get_current_user)
):
    try:
        # Remove from Stripe
        result = remove_payment_method(payment_method_id)
        if not result:
            raise HTTPException(status_code=400, detail="Failed to remove payment method from Stripe")
        
        # Remove from user's payment methods
        if current_user.stripe_paymemt_methods:
            current_user.stripe_paymemt_methods = [
                method for method in current_user.stripe_paymemt_methods 
                if method.get('payment_method_id') != payment_method_id
            ]
            # Save updated user
            await User.save_document(doc=current_user)
            
        return {"message": "Payment method removed successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/payment/check_provider_payment_info")
async def check_provider_payment_info(current_user: User = Depends(get_current_user)):
    if not current_user.stripe_account_id:
        return {"payment_info": False}
    payment_info = is_provider_payment_info_complete(current_user.stripe_account_id)
    return {"payment_info": True if payment_info == "active" else False}