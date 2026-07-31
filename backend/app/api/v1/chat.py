from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.websocket_service import ws_manager

router = APIRouter(prefix="/chat", tags=["LiveChat WebSocket"])

@router.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    await ws_manager.connect(websocket, room_id)
    try:
        while True:
            data = await websocket.receive_json()
            await ws_manager.broadcast_to_room(
                {"room_id": room_id, "data": data, "type": "chat_message"},
                room_id
            )
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, room_id)
