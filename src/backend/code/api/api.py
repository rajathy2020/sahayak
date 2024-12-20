""" This file is the entrypoint for the backed api's"""
import os
from logging.config import fileConfig
from os import path

import pandas as pd

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from api.config import *
from core.dbs import setup_db

from passlib.context import CryptContext

from .routers import (
    authorization,
    users,
    services,
    providers,
    booking,
    payment,
    ai,
    chat


    )
import asyncio
root_path = "/"

"""
Log configuration
"""


app = FastAPI(
    root_path=root_path,
    description="Documentation for External Fraud Detection API",
)

@app.on_event("startup")
async def app_init():
    await setup_db()


origins = [
        "http://localhost:8080",
        "http://localhost:3000",
        "https://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8090",
        "https://localhost:8090",
        "https://cera-dev.hytechnologies.co",
        "https://cera.hytechnologies.co",
]



app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
app.include_router(authorization.router, tags=["Authorization"])
app.include_router(services.router, tags=["Services"])
app.include_router(providers.router, tags=["Providers"])
app.include_router(users.router, tags=["Users"])
app.include_router(booking.router, tags=["Bookings"])
app.include_router(payment.router, tags=["Payment"])
app.include_router(ai.router, tags=["AI"])
app.include_router(chat.router, tags=["Chat"])



