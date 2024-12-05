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

        

        if "bearer" in header_scheme.lower():
            authorization = True
            scheme = header_scheme
            param = header_param.split('""')[0]

        elif "bearer" in cookie_scheme.lower():
            authorization = True
            scheme = cookie_scheme
            param = cookie_param

        else:
            authorization = False

        

        if not authorization or not "bearer" in scheme.lower() :
            if self.auto_error:
                raise HTTPException(
                    status_code=HTTP_403_FORBIDDEN, detail="Not authenticated"
                )
            else:
                return None
        if param.endswith('"'):
            param = param[:-1]
        return param

oauth2_scheme = OAuth2PasswordBearerCookie(tokenUrl="/token")

async def get_current_user(request: Request, token: str = Depends(oauth2_scheme)):
    return await Auth0UserManagement().get_current_user(request ,token)
   