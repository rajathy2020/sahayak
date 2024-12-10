""" This file holds all the routers required to interact with User and API key """
import os
import string

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import Optional
from pydantic import BaseModel
import os
from tempfile import NamedTemporaryFile
from services.user_management.utils import get_current_user
from shared.models import User, DocumentType
from services.ai.openai_service import OpenAIService
import fitz
from services.ai.document_schemas import get_document_config
router = APIRouter()


class ExtractionRequest(BaseModel):
    document_type: DocumentType

@router.post(
    "/ai/extraction",
    include_in_schema=not bool(os.getenv("SHOW_OPEN_API_ENDPOINTS"))
)
async def extract_document_info(
    document_type: DocumentType = Form(...),
    file: UploadFile = File(...)
):
    """Extract information from uploaded documents using AI."""
    
    try:
        # Validate file type
        if not file.filename.endswith('.pdf'):
            raise HTTPException(
                status_code=400,
                detail="Only PDF files are supported"
            )

        # Create a temporary file to store the upload
        with NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file.flush()

            # Extract text from PDF
            pdf_file = fitz.open(temp_file.name)
            text = ""
            for page_num, pdf_page in enumerate(pdf_file):
                print(f"Extracting page {page_num + 1} / {len(pdf_file)}")
                text += pdf_page.get_text()
            pdf_file.close()

        # Remove temporary file
        os.unlink(temp_file.name)

        # Initialize OpenAI service
        openai_service = OpenAIService(
            model_name="gpt-4o-2024-08-06",
            temperature=0.0,
            max_tokens=2000,

        )

        prompt = get_document_config(document_type)['prompt']
        content = f"{prompt} \n\n Document text: {text}"
        schema = get_document_config(document_type)['schema']

        

        print("content", content)
        messages = [
            {"role": "system", "content": "Du bist ein Experte für Dokumentenanalyse. Gebe Informationen NUR im angeforderten JSON-Format zurück."},
            {"role": "user", "content": content}
        ]

        # Extract information using OpenAI
        print("messages", messages)
        extracted_info = await openai_service.extract_document_info(
            messages=messages,
            response_format=schema
        )
        
        return {
            "status": "success",
            "document_type": document_type,
            "extracted_info": extracted_info
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing document: {str(e)}"
        )
    
@router.post(
    "/ai/ask_question",
    include_in_schema=not bool(os.getenv("SHOW_OPEN_API_ENDPOINTS"))
)
async def ask_document_question(
    question: str = Form(...),
    file: UploadFile = File(...)
):
    """Ask questions about the uploaded document using AI."""
    
    try:
        # Validate file type
        if not file.filename.endswith('.pdf'):
            raise HTTPException(
                status_code=400,
                detail="Only PDF files are supported"
            )

        # Create a temporary file to store the upload
        with NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file.flush()

            # Extract text from PDF
            pdf_file = fitz.open(temp_file.name)
            text = ""
            for page_num, pdf_page in enumerate(pdf_file):
                print(f"Extracting page {page_num + 1} / {len(pdf_file)}")
                text += pdf_page.get_text()
            pdf_file.close()

        # Remove temporary file
        os.unlink(temp_file.name)

        # Initialize OpenAI service
        openai_service = OpenAIService(
            model_name="gpt-4o-2024-08-06",
            temperature=0.0,
            max_tokens=2000,
        )

        content = f"""Please answer the following question based on the document content:

        Question: {question}

        Document text:
        {text}
        """

        messages = [
            {"role": "system", "content": "You are a helpful assistant that answers questions about documents. Provide clear, concise answers based only on the information present in the document."},
            {"role": "user", "content": content}
        ]

        response_format = {
            "type": "json_schema",
            "json_schema": {
                "name": "answer_schema",
                "schema": {
                    "type": "object",
                    "properties": {
                        "answer": {
                            "type": "string",
                            "description": "The answer to the question"
                        },
                        "confidence": {
                            "type": "string",
                            "enum": ["high", "medium", "low"],
                            "description": "Confidence level in the answer"
                        },
                        "relevant_text": {
                            "type": "string",
                            "description": "Relevant text from the document that supports the answer"
                        }
                    },
                    "required": ["answer", "confidence"],
                    "additionalProperties": False
                }
            }
        }

        # Get answer using OpenAI
        answer = await openai_service.extract_document_info(
            messages=messages,
            response_format=response_format
        )
        
        return {
            "status": "success",
            "question": question,
            "response": answer
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing document: {str(e)}"
        )
    
   