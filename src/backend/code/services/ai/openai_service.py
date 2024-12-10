from typing import Optional, List, Dict
from openai import OpenAI
import os
import json
from fastapi import HTTPException
from .document_schemas import get_document_config

class OpenAIService:
    """Service class for handling OpenAI API interactions."""

    def __init__(
        self,
        model_name: str = "gpt-4",
        temperature: float = 0.0,
        max_tokens: Optional[int] = None,
        api_key: Optional[str] = None
    ):
        
        
        """Initialize OpenAI service with configuration."""
        self.model_name = model_name
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    async def extract_document_info(self, messages: List[Dict], response_format) -> dict:
        """
        Extract information from document text using OpenAI with JSON schema validation.
        """
        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                temperature=self.temperature,
                response_format= response_format
            )


            return json.loads(response.choices[0].message.content)

        except json.JSONDecodeError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to parse JSON response: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error processing document: {str(e)}"
            )