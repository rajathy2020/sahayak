import os
import uuid
from abc import ABC, abstractmethod

from beanie.odm.operators.find.logical import And

from shared.models import *
from services.user_management.config import *
from fastapi.responses import RedirectResponse




class AbstractUserManagement():


    async def _check_or_add_user(self, email, name, image_url = None, auth0_id  = None):
        query = And(User.email == email)
        user = await User.search_document(query=query)

        print("user", user, email, name, image_url, auth0_id,   )

        if not user:
            print("Adding new user", user)
            user = User(email=email, name=name, gender = "male", image_url = image_url, auth0_id = auth0_id )
            user = await User.save_document(doc=user)
            user = [user]

        return user[0]
    
    async def _get_user(self, auth0_id: str):
        query = And(User.auth0_id == auth0_id)
        user = await User.search_document(query=query)

        if not user:
            return None

        return user[0]
    
    def prepare_response(self, token):
        res = RedirectResponse(AUTH_FE_REDIRECT, status_code=302)
        print("AUTH_FE_REDIRECT", AUTH_FE_REDIRECT)
        res.set_cookie(
            key=COOKIE_AUTHORIZATION_NAME,
            value=f"Bearer {token}",
            httponly=False,
            domain=COOKIE_DOMAIN,
            path="/",  # Ensure it is available to all routes
            max_age=18000,
            expires=18000,
            samesite="None",
            secure=True,
            
        )



        # redirect to the frontend but also use cookie
        
        print("res", res.headers,  COOKIE_DOMAIN)

        return res
       
    @abstractmethod
    def get_login_url(self) -> str:
        """Entry point for the document processing for indiviual checks"""
        pass

    @abstractmethod
    def get_access_token(self) -> str:
        """Entry point for the document processing for indiviual checks"""
        pass
        
    @abstractmethod
    async def logout(self):
        pass

    @abstractmethod
    async def get_current_user(self):
        pass
    
   





