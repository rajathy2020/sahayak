""" This file contains the connnection to the DB """
import os
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from shared.models import (
    User,
    ParentService,
    SubService,
    Booking
)

instance = os.getenv("INSTANCE", "local")
db_password = os.getenv("MONGODB_ROOT_aPASSWORD", "needstrongpassword")
db_url = os.getenv("MONGODB_URL", f"mongodb://root:{db_password}@mongodb:27017")

client = AsyncIOMotorClient(db_url)

print(client)


async def setup_db():
    """
    Connects to a MongoDB database and sets up the necessary collections and indexes.

    Uses the following environment variables:
    - MONGODB_ROOT_PASSWORD: the root password for the MongoDB instance.
    - MONGODB_URL: the URL for the MongoDB instance.



    Inserts an `InstanceAccessConfiguration` document with the configuration for the current instance,
    if such document does not exist yet. Inserts an `InstanceConfiguration` document with the default
    configuration, if such document does not exist yet.
    """
    # Initialize document models
    print("Connecting to DB Docsense...")
    await init_beanie(
        database=client.sahayak,
        document_models=[User, ParentService, SubService, Booking],
    )
    print("Db connected")
