import stripe 
import os
stripe.api_key = "sk_test_51QA9MVIV6MeGCGLBosEPq1QsMYkeeq8PfWsPcz4c6a1WEpRpwU0XylGwRZGAumSpAPbLMwP2GWgahv8Ns9yE0UhE00JwHlmPlR"

SUCCESS_URL = os.getenv("STRIPE_SUCCESS_URL", "http://localhost:3000/me#payment")
FAILURE_URL = os.getenv("STRIPE_FAILURE_URL", "http://localhost:3000/me")


def create_service_provider_stripe_account(user):
    try:
        account = stripe.Account.create(
            type="express",  # Using Express for easier onboarding
            country="DE",  # Change this based on the provider's country
            email=user.email,  # Provider's email
            business_type="individual",  # Could be 'company' if they're a business entity
            capabilities={
                "transfers": {"requested": True},  # To enable transfers to provider
            },
        )
        return account

    except stripe.error.StripeError as e:
    # Handle any errors that occur during session creation
        print(f"Failed to create checkout session: {e.error.message}")
        return None



def create_stripe_service_provider_setup_link(user):
    try:
        account_link = stripe.AccountLink.create(
        account=user.stripe_account_id,
        refresh_url=FAILURE_URL,  # Where to send them if onboarding fails
        return_url=SUCCESS_URL,  # Where to send them after onboarding
        type="account_onboarding",  # This starts the onboarding flow
    )
    
        # Now redirect the provider to account_link.url
        return account_link["url"]
    
        
    except stripe.error.StripeError as e:
        # Handle any errors that occur during session creation
        print(f"Failed to create checkout session: {e.error.message}")
        return None


def create_stripe_customer(user):
    """
    Creates a Stripe customer with the provided name and email.

    Parameters:
    - name: Full name of the customer
    - email: Email address of the customer
    
    Returns:
    - Stripe customer object
    """
    try:
        # Create the customer in Stripe
        customer = stripe.Customer.create(
            name=user.name,
            email=user.email,
            metadata={
                "platform_user_id": str(user.id),  # Link to your platform's user ID
            }
        )
       
        print(f"Customer created successfully! Customer ID: {customer.id}")
        return customer

    except stripe.error.StripeError as e:
        # Handle any errors that occur during session creation
        print(f"Failed to create checkout session: {e.error.message}")
        return None


def create_stripe_client_card_setup_url(user):
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            mode='setup',  # Use 'setup' mode for adding payment methods without charging
            customer=user.stripe_customer_id,  # The existing Stripe customer ID
            success_url=SUCCESS_URL,  # Where to redirect the user after success
            cancel_url=FAILURE_URL  # Where to redirect the user if they cancel
        )
    
            # Step 2: Return the session URL to redirect the customer to
        return session.url

    except stripe.error.StripeError as e:
        # Handle any errors that occur during session creation
        print(f"Failed to create checkout session: {e.error.message}")
        return None



def charge_client_for_booking(amount, payment_method_id, user, description="Service Booking"):
    """
    Charges the client and adds the money to the company's Stripe account.
    The money will stay in the company's Stripe account until it is transferred to the provider.
    
    Parameters:
    - amount: The amount to charge (in cents, e.g., 5000 for $50)
    - currency: The currency code (e.g., "usd", "eur")
    - user: The user object containing Stripe customer information
    - description: A description for the charge
    
    Returns:
    - PaymentIntent object if successful, None otherwise
    """
    try:
        # Retrieve the Stripe customer ID from the user object
        customer_id = user.stripe_customer_id

        # Step 1: Create a Payment Intent to charge the client
        payment_intent = stripe.PaymentIntent.create(
            amount=amount,  # Amount in cents (e.g., 5000 for $50)
            currency="eur",
            customer=customer_id,  # Stripe customer ID
            payment_method=payment_method_id,  # The client's saved payment method
            off_session=True,  # The client is not actively in session (for automated charges)
            confirm=True,  # Confirm and capture the payment automatically
            description=description,
        )

        print(f"Payment successful! Payment Intent ID: {payment_intent.id}")
        return payment_intent

    except stripe.error.CardError as e:
        # Handle error if the card is declined or if there's an issue with the payment
        print(f"Error charging client: {e.error.message}")
        return None

    except stripe.error.StripeError as e:
        # Handle other general Stripe API errors
        print(f"Stripe error: {e.error.message}")
        return None

def payout_to_provider(user, amount, currency="eur"):
    """
    Transfers funds from your platform's main Stripe account to a connected provider's Stripe account,
    then immediately initiates a payout from the connected provider's account to their external bank account.

    Parameters:
    - stripe_account_id: The connected provider's Stripe account ID (e.g., acct_ABC123).
    - amount: The amount to transfer and payout in cents (e.g., 10000 for €100).
    - currency: The currency for the transfer and payout (e.g., "eur").

    Returns:
    - The payout object if successful.
    """
    try:
        # Step 1: Transfer funds from the platform's main account to the provider's connected Stripe account
        transfer = stripe.Transfer.create(
            amount=amount,  # Amount in cents (e.g., 10000 for €100)
            currency=currency,  # Currency (e.g., "eur")
            destination=user.stripe_account_id,  # Provider's connected Stripe account ID
            description="Payment for completed service"
        )
        print(f"Transferred {amount / 100} {currency.upper()} to provider {user.stripe_account_id}")

        # Step 2: Payout from the connected provider's account to their bank account
        payout = stripe.Payout.create(
            amount=amount,  # Same amount in cents for payout
            currency=currency,  # Same currency for payout
            description="Payout to provider's bank account",
            stripe_account=user.stripe_account_id  # Payout from the provider's account
        )
        print(f"Payout of {amount / 100} {currency.upper()} to provider's bank account was successful!")
        return payout

    except stripe.error.StripeError as e:
        print(f"Failed: {e.error.message}")
        return None



def get_client_payment_info(client_stripe_id):
    payment_details = stripe.PaymentMethod.list(
        customer = client_stripe_id,
        type = "card",
    )

    
    if payment_details :
        cards = []
        for payment_methods in payment_details["data"]:
            payment_method_id = {"payment_method_id": payment_methods["id"]}

            cards.append({**payment_methods["card"],**  payment_method_id})


        print(cards, "cards")
        return cards
        
    return []

def remove_payment_method(payment_method_id):
    """
    Removes a payment method from Stripe
    """
    try:
        # Detach the payment method from the customer
        payment_method = stripe.PaymentMethod.detach(payment_method_id)

        return payment_method
    except stripe.error.StripeError as e:
        print(f"Failed to remove payment method: {e.error.message}")
        return None