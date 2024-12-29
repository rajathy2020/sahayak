from api.routers import chat

app.include_router(chat.router, tags=["chat"]) 