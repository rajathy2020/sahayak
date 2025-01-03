from services.user_management.AbstractUserManagement import AbstractUserManagement
from fastapi import Request, HTTPException
from services.user_management.config import *

from fastapi.responses import RedirectResponse
import jwt
import requests
import urllib.parse

from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse

class Auth0UserManagement(AbstractUserManagement):
    def _validate_token(cls, token):
        auth0_issuer_url: str = f"https://{AUTH0_DOMAIN}/"
        auth0_audience: str = f"{AUTH0_API_AUDIENCE}"
        algorithm: str = "RS256"
        jwks_uri: str = f"{auth0_issuer_url}.well-known/jwks.json"

        try:
            jwks_client = jwt.PyJWKClient(jwks_uri)

            jwt_signing_key = jwks_client.get_signing_key_from_jwt(token).key
            payload = jwt.decode(
                token,
                jwt_signing_key,
                algorithms=algorithm,
                audience=auth0_audience,
                issuer=auth0_issuer_url,
            )
            auth0_id = payload.get("sub")


            if auth0_id is None:
                raise HTTPException(status_code=401, detail="Not a user")
            return auth0_id
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="token_expired")
        except Exception as e:
            print("e", e)
            raise HTTPException(status_code=401, detail="Not a user")

    def get_login_url(self) -> str:
        auth0_url = f"https://{AUTH0_DOMAIN}/authorize"
        params = {
            "client_id": AUTH0_CLIENT_ID,
            "response_type": "code",
            "redirect_uri": AUTH0_CALLBACK_URL,
            "audience": AUTH0_API_AUDIENCE,
            "scope": "openid profile email",
            "prompt": "login",  # Force login page to appear
        }
        url = requests.Request("GET", auth0_url, params=params).prepare().url
        return RedirectResponse(url)

    async def get_access_token(self, code) -> str:
        if code is None:
            return HTMLResponse("Authentication failed.")
        else:
            data = {
                "grant_type": "authorization_code",
                "client_id": AUTH0_CLIENT_ID,
                "client_secret": AUTH0_CLIENT_SECRET,
                "code": code,
                "redirect_uri": AUTH0_CALLBACK_URL,
                "audience": AUTH0_API_AUDIENCE,
                "scope": "openid profile email"
            }
            token_response = requests.post(
                f"https://{AUTH0_DOMAIN}/oauth/token", data=data
            ).json()



            access_token = token_response["access_token"]            
            user_url = f"https://{AUTH0_DOMAIN}/userinfo"
            headers = {"Authorization": f"Bearer {access_token}"}
            user_info = requests.get(user_url, headers=headers).json()
            user = await self._check_or_add_user(email = user_info.get("email"), name = user_info.get("name"), image_url =  user_info.get("picture"), auth0_id = user_info.get("sub"))
            return access_token
           
    def logout(self) -> str:
        redirect_url = f"https://{AUTH0_DOMAIN}/oidc/logout?post_logout_redirect_uri=" +  "http://localhost:3000/login?status=logged_out"
        print("redirect_url", redirect_url)
        response = RedirectResponse(redirect_url)
        response.delete_cookie(COOKIE_AUTHORIZATION_NAME, domain=COOKIE_DOMAIN)

        print(" logount response", dir(response))
        
    async def  get_current_user(self, request: Request, token):
        auth0_id = self._validate_token(token)
        user = await self._get_user(auth0_id=auth0_id)

        
        if user is None or not user.email:
            raise HTTPException(status_code=401, detail="Not a user3")

        return user
            

       
        
