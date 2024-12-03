import os

AUTH_PROVIDER = os.getenv("AUTH_PROVIDER", "MICROSOFT")


AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN", "dev-ul6v6uihffxieq0r.us.auth0.com")
AUTH0_CLIENT_ID = os.getenv("AUTH0_CLIENT_ID", "YNeStY2oya7Ow4l5osH8jxntG04bWgIc")
AUTH0_CLIENT_SECRET = os.getenv("AUTH0_CLIENT_SECRET", "ey6NYYnPvsq-oBb2zZberbC-onTwB7qL29pU9JqDe4hOFK-ODxv9XrSEZ3M4iCju")
AUTH0_CALLBACK_URL = os.getenv(
    "AUTH0_CALLBACK_URL", "http://localhost:8090/auth0_authorization/callback"
)
AUTH0_API_AUDIENCE = os.getenv("AUTH0_API_AUDIENCE", "https://dev-ul6v6uihffxieq0r.us.auth0.com/api/v2/")

COOKIE_AUTHORIZATION_NAME = "Authorization"
COOKIE_DOMAIN = os.getenv("COOKIE_DOMAIN11", "localhost")
SECRET_KEY = os.getenv("SECRET_KEY", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
ALGORITHM = "HS256"
AUTH_FE_REDIRECT= os.getenv("AUTH_FE_REDIRECT1", "http://localhost:3000")


 
assert AUTH0_DOMAIN, "AUTH0_DOMAIN env var not set"
assert AUTH0_CLIENT_ID, "AUTH0_CLIENT_ID env var not set"
assert AUTH0_CLIENT_SECRET, "AUTH0_CLIENT_SECRET env var not set"
assert AUTH0_CALLBACK_URL, "AUTH0_CALLBACK_URL env var not set"
assert AUTH0_API_AUDIENCE, "AUTH0_API_AUDIENCE env var not set"
