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
            email = payload[list(payload.keys())[0]]

            if email is None:
                raise HTTPException(status_code=401, detail="Not a user")
            return email
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
            "scope": "openid profile email,read:blabla",
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
            }
            token_response = requests.post(
                f"https://{AUTH0_DOMAIN}/oauth/token", data=data
            ).json()


            access_token = token_response["access_token"]            
            email = self._validate_token(access_token)
            user_url = f"https://{AUTH0_DOMAIN}/userinfo"
            headers = {"Authorization": f"Bearer {access_token}"}
            user_info = requests.get(user_url, headers=headers).json()
            user = await self._check_or_add_user(email = email, name = user_info.get("name"))
            return access_token
           
    def logout(self) -> str:
        response = RedirectResponse(f"https://{AUTH0_DOMAIN}/oidc/logout?post_logout_redirect_uri=" + urllib.parse.quote(os.getenv('AUTH_FE_REDIRECT1', "http://localhost:8090/docs"), safe=''))
        response.delete_cookie(COOKIE_AUTHORIZATION_NAME, domain=COOKIE_DOMAIN)
        return response
        
    async def  get_current_user(self, request: Request, token):
        email = self._validate_token(token)
        user = await self._get_user(email=email)
        
        if user is None or not user.email:
            raise HTTPException(status_code=401, detail="Not a user3")

        return user
            

       
        
