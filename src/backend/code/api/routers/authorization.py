import os

from fastapi import APIRouter, Depends, HTTPException, Request
from services.user_management.utils import get_current_token

from services.user_management.Auth0UserManagement import Auth0UserManagement
from shared.models import *

router = APIRouter()





@router.get(
    "/auth0/login",
    include_in_schema=not bool(os.getenv("SHOW_OPEN_API_ENDPOINTS")),
)
async def auth0_login_url(request: Request):
    """Microsoft Oauth entry endpoints. Generates the url for the authorization"""

    return Auth0UserManagement().get_login_url()

@router.get(
    f"/auth0_authorization/callback",
    include_in_schema=not bool(os.getenv("SHOW_OPEN_API_ENDPOINTS")),
)
async def auth0_login_redirect(
    code: str, error: str = None, request: Request = None
):
    """Microsoft redirect endpoint"""
    if error:
        return HTTPException(status_code=400, detail="error in login")
    
    auth0_user_management =  Auth0UserManagement()
    print("code", code)
    access_token =  await auth0_user_management.get_access_token(code)
    print("access_token", access_token)
    return auth0_user_management.prepare_response(access_token)



@router.get("/auth0/logout")
async def route_logout_and_remove_cookie(
    request: Request
):
    
    microsoft_user_management =  Auth0UserManagement()
    return microsoft_user_management.logout()
 


 