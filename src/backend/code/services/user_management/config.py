import os

AUTH_PROVIDER = os.getenv("AUTH_PROVIDER", "MICROSOFT")


AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN", "hyapps.eu.auth0.com")
AUTH0_CLIENT_ID = os.getenv("AUTH0_CLIENT_ID", "BdA2aypf6vYDBNDOn2A0OluQHpwco6e6")
AUTH0_CLIENT_SECRET = os.getenv("AUTH0_CLIENT_SECRET", "WtsIeNSzTU5MdUx8dJttb_HgT1WIp-M9R2JwQjLsVO3DubuoR8EE5BvVWpwAi_6S")
AUTH0_CALLBACK_URL = os.getenv(
    "AUTH0_CALLBACK_URL", "https://localhost:8090/auth0_authorization/callback"
)
AUTH0_API_AUDIENCE = os.getenv("AUTH0_API_AUDIENCE", "https://dps.hytechnologies.co/api")

COOKIE_AUTHORIZATION_NAME = "Authorization"
COOKIE_DOMAIN = os.getenv("COOKIE_DOMAIN", "localhost")
SECRET_KEY = os.getenv("SECRET_KEY", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
ALGORITHM = "HS256"
AUTH_FE_REDIRECT= os.getenv("AUTH_FE_REDIRECT", "https://localhost:8090/docs")



assert AUTH0_DOMAIN, "AUTH0_DOMAIN env var not set"
assert AUTH0_CLIENT_ID, "AUTH0_CLIENT_ID env var not set"
assert AUTH0_CLIENT_SECRET, "AUTH0_CLIENT_SECRET env var not set"
assert AUTH0_CALLBACK_URL, "AUTH0_CALLBACK_URL env var not set"
assert AUTH0_API_AUDIENCE, "AUTH0_API_AUDIENCE env var not set"
