import os
import uuid
from abc import ABC, abstractmethod
from datetime import timedelta
from typing import Optional

from beanie.odm.operators.find.logical import And
from fastapi import Depends, HTTPException, Request
from fastapi.security.oauth2 import (OAuth2, OAuthFlowsModel,
                                     get_authorization_scheme_param)
from shared.models import *
from starlette.status import HTTP_403_FORBIDDEN
from services.user_management.Auth0UserManagement import Auth0UserManagement
from services.user_management.config import *



class OAuth2PasswordBearerCookie(OAuth2):
    """Model for Microsoft OAuth"""

    def __init__(
        self,
        tokenUrl: str,
        scheme_name: str = None,
        scopes: dict = None,
        auto_error: bool = True,
    ):
        if not scopes:
            scopes = {}
        flows = OAuthFlowsModel(password={"tokenUrl": tokenUrl, "scopes": scopes})
        super().__init__(flows=flows, scheme_name=scheme_name, auto_error=auto_error)

    async def __call__(self, request: Request) -> Optional[str]:
        header_authorization: str = request.headers.get("Authorization")
        cookie_authorization: str = request.cookies.get("Authorization")

        header_scheme, header_param = get_authorization_scheme_param(
            header_authorization
        )
        cookie_scheme, cookie_param = get_authorization_scheme_param(
            cookie_authorization
        )

        if header_scheme.lower() == "bearer":
            authorization = True
            scheme = header_scheme
            param = header_param

        elif cookie_scheme.lower() == "bearer":
            authorization = True
            scheme = cookie_scheme
            param = cookie_param

        else:
            authorization = False

        if not authorization or scheme.lower() != "bearer":
            if self.auto_error:
                raise HTTPException(
                    status_code=HTTP_403_FORBIDDEN, detail="Not authenticated"
                )
            else:
                return None

        return param

oauth2_scheme = OAuth2PasswordBearerCookie(tokenUrl="/token")


async def get_current_user(request: Request):

    return User(name = "HELLO", email = "rajat.jain@hy.co")

   
    if AUTH_PROVIDER == "MICROSOFT":
        user = await  MicrosoftUserManagement().get_current_user(request ,token)

    if AUTH_PROVIDER == "AUTH0":
        user = await Auth0UserManagement().get_current_user(request ,token)

    if user is None or not user.email:
        raise HTTPException(status_code=401, detail="Not a user")
    
    if user.email.lower() in [it.lower() for it in os.getenv("ADMIN_USERS").split(",")] or "editor" in user.roles:
        pass
    else:
        raise HTTPException(
            status_code=403, detail="The user does not have enough privileges"
        )
    
    return user
    
async def get_current_token(request: Request, token: str = Depends(oauth2_scheme)):
    return token
