""" This file contains the pydantic data models used in this application """
import asyncio
from datetime import datetime
from importlib.metadata import metadata
from lib2to3.pgen2.token import OP

from typing import  Optional

import pandas as pd
from beanie import Document
from pydantic import Field
from beanie.odm.fields import ExpressionField
from .base import *



class MongoBase(Document):
    # id: Union[PydanticObjectId, str] = Field(None, alias="_id")

    class Settings:
        is_root = True

    created_at: Optional[datetime] = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = Field(None, example="2020-11-12T13:15:09.557Z")
    deleted_at: Optional[datetime] = Field(None, example="2020-11-12T13:15:09.557Z")

    relations: dict = Field(
        {},
        description="Dictionary to hold specific relation Object if loaded by API endpoint.",
    )

    @classmethod
    async def get_document(cls, doc_id: str):
        return await cls.get(doc_id)

    @classmethod
    async def search_document(
        cls, query, sort_by=None, order_by="Asc", projection=None, limit=None, skip=None
    ):
        if sort_by:
            sort_by = +sort_by if order_by == "Asc" else -sort_by

            return (
                await cls.find(query, skip=skip, limit=limit)
                .project(projection)
                .sort(sort_by)
                .to_list()
            )

        else:
            return (
                await cls.find(query, skip=skip, limit=limit)
                .project(projection)
                .to_list()
            )

    @classmethod
    async def upsert_document(cls, doc):
        return await doc.insert()

    @classmethod
    async def save_document(cls, doc):
        if doc.id:
            await doc.save()
            return doc
        else:
            return await doc.insert()

    @classmethod
    async def  filter_and_paginate(cls, filter_request):
        query = filter_request.filter
        query["deleted_at"] = None
        sort_by = ExpressionField(filter_request.sort_by) if filter_request.sort_by else cls.created_at
        page_number = filter_request.page_number if filter_request.page_number else 1
        order_by = filter_request.order_by 
        skip = (page_number - 1) * filter_request.page_size
        limit = filter_request.page_size
        
        print("Fetching Docs")
        
        print(query)

        # Retrieve the documents.
        docs = await cls.search_document(
            query,
            sort_by=sort_by,
            skip=skip,
            limit=limit,
            order_by = order_by
        )
        total_count = await cls.find(query).count()

        return {
        "total": total_count,
        "items": docs
    }

class Service(MongoBase):
    name: str
   


class User(MongoBase):
    name: str
    email: str