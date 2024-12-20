from fastapi import APIRouter, Depends, HTTPException, Body
from typing import List, Optional
from datetime import datetime

from services.user_management.utils import get_current_user
from shared.models import User, Chat, Message, MessageType

router = APIRouter()

@router.post("/chats")
async def create_chat(
    booking_id: str = Body(...),
    client_id: Optional[str] = Body(None),
    provider_id: Optional[str] = Body(None),
    current_user: User = Depends(get_current_user)
):
    """Create a new chat between client and provider"""
    try:
        # Check if chat already exists
        existing_chat = await Chat.search_document({
            "booking_id": booking_id,
            "is_active": True
        })
        
        if existing_chat:
            return existing_chat
            
        # Create new chat
        chat = Chat(
            provider_id=provider_id,
            client_id=client_id,
            booking_id=booking_id
        )
        
        return await Chat.save_document(doc=chat)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chats/list")
async def list_chats(current_user: User = Depends(get_current_user)):
    """Get all chats for the current user"""
    try:
        # Find all chats where user is either provider or client
        chats = await Chat.find({
            "$or": [
                {"provider_id": str(current_user.id)},
                {"client_id": str(current_user.id)}
            ],
            "is_active": True
        }).to_list()
        
        # Get other participants' details
        for chat in chats:
            other_id = chat.provider_id if chat.client_id == str(current_user.id) else chat.client_id
            other_user = await User.get_document(other_id)
            chat.other_participant = {
                "id": str(other_user.id),
                "name": other_user.name,
                "image_url": other_user.image_url
            }
            
        return chats
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chats/{chat_id}/messages")
async def get_messages(
    chat_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get messages for a specific chat"""
    try:
        # Verify user is part of this chat
        chat = await Chat.get_document(chat_id)
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
            
        if str(current_user.id) not in [chat.provider_id, chat.client_id]:
            raise HTTPException(status_code=403, detail="Not authorized to view this chat")
            
        # Get 
        # 
        print("chat_id", chat_id)
        messages = await Message.search_document({ "chat_id": str(chat_id) }    )
        
        return messages
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chats/{chat_id}/messages")
async def send_message(
    chat_id: str,
    content: str = Body(...),
    message_type: MessageType = Body(MessageType.TEXT),
    current_user: User = Depends(get_current_user)
):
    """Send a new message in a chat"""
    try:
        # Verify user is part of this chat
        chat = await Chat.get_document(chat_id)
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
            
        if str(current_user.id) not in [chat.provider_id, chat.client_id]:
            raise HTTPException(status_code=403, detail="Not authorized to send messages in this chat")
            
        # Create new message
        message = Message(
            chat_id=str(chat_id),
            sender_id=str(current_user.id),
            content=content,
            message_type=message_type
        )
        
        # Update chat with last message
        chat.last_message = content
        chat.last_message_time = datetime.utcnow()
        chat.unread_count += 1
        
        # Save both message and updated chat
        saved_message = await Message.save_document(doc=message)
        await Chat.save_document(doc=chat)
        
        return saved_message
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 