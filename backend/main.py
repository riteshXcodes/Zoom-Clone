from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

import uuid
from typing import Dict

from database import Base, SessionLocal, engine
from models import Meeting, User
from routers.meetings import router as meetings_router


class MeetingConnectionManager:
    def __init__(self):
        self.rooms: Dict[str, Dict[str, dict]] = {}

    # async def connect(
    #     self,
    #     meeting_id: str,
    #     participant_id: str,
    #     websocket: WebSocket,
    #     display_name: str,
    # ):
    #     await websocket.accept()

    #     if meeting_id not in self.rooms:
    #         self.rooms[meeting_id] = {}

    #     existing_participants = [
    #         {
    #             "id": participant_id_,
    #             "name": participant_data["name"],
    #         }
    #         for participant_id_, participant_data
    #         in self.rooms[meeting_id].items()
    #     ]

    #     self.rooms[meeting_id][participant_id] = {
    #         "socket": websocket,
    #         "name": display_name,
    #     }

    #     await websocket.send_json({
    #         "type": "participants",
    #         "participants": existing_participants,
    #     })

    #     await self.broadcast(
    #         meeting_id,
    #         {
    #             "type": "user-joined",
    #             "participant": {
    #                 "id": participant_id,
    #                 "name": display_name,
    #             },
    #         },
    #         exclude=participant_id,
    #     )\
    
    async def connect(
    self,
    meeting_id: str,
    participant_id: str,
    websocket: WebSocket,
    display_name: str,
):
        await websocket.accept()

        if meeting_id not in self.rooms:
            self.rooms[meeting_id] = {}

        is_host = len(self.rooms[meeting_id]) == 0

        existing_participants = [
            {
                "id": participant_id_,
                "name": participant_data["name"],
                "is_host": participant_data["is_host"],
            }
            for participant_id_, participant_data
            in self.rooms[meeting_id].items()
        ]

        self.rooms[meeting_id][participant_id] = {
            "socket": websocket,
            "name": display_name,
            "is_host": is_host,
        }

        await websocket.send_json({
            "type": "participants",
            "participants": existing_participants,
            "is_host": is_host,
        })

        await self.broadcast(
            meeting_id,
            {
                "type": "user-joined",
                "participant": {
                    "id": participant_id,
                    "name": display_name,
                    "is_host": is_host,
                },
            },
            exclude=participant_id,
        )

    # async def disconnect(
    #     self,
    #     meeting_id: str,
    #     participant_id: str,
    # ):
    #     room = self.rooms.get(meeting_id)

    #     if not room:
    #         return

    #     participant = room.pop(participant_id, None)

    #     if participant:
    #         await self.broadcast(
    #             meeting_id,
    #             {
    #                 "type": "user-left",
    #                 "participant_id": participant_id,
    #             },
    #             exclude=participant_id,
    #         )

    #     if not room:
    #         self.rooms.pop(meeting_id, None)

    async def disconnect(
    self,
    meeting_id: str,
    participant_id: str,
):
        room = self.rooms.get(meeting_id)

        if not room:
            return

        participant = room.pop(
            participant_id,
            None,
        )

        if participant:
            await self.broadcast(
                meeting_id,
                {
                    "type": "user-left",
                    "participant_id": participant_id,
                },
                exclude=participant_id,
            )

        if not room:
            self.rooms.pop(
                meeting_id,
                None,
            )
            return

        remaining_host = next(
            (
                participant_id_
                for participant_id_, participant_data
                in room.items()
                if participant_data["is_host"]
            ),
            None,
        )

        if remaining_host is None:
            new_host_id = next(
                iter(room)
            )

            room[new_host_id]["is_host"] = True

            await room[new_host_id]["socket"].send_json({
                "type": "host-changed",
                "is_host": True,
            })
        
    async def broadcast(
        self,
        meeting_id: str,
        message: dict,
        exclude: str | None = None,
    ):
        room = self.rooms.get(meeting_id)

        if not room:
            return

        disconnected = []

        for participant_id, participant in list(room.items()):
            if participant_id == exclude:
                continue

            try:
                await participant["socket"].send_json(message)
            except Exception:
                disconnected.append(participant_id)

        for participant_id in disconnected:
            room.pop(participant_id, None)

    async def send_to(
        self,
        meeting_id: str,
        participant_id: str,
        message: dict,
    ):
        room = self.rooms.get(meeting_id)

        if not room:
            return

        participant = room.get(participant_id)

        if not participant:
            return

        try:
            await participant["socket"].send_json(message)
        except Exception:
            await self.disconnect(
                meeting_id,
                participant_id,
            )


manager = MeetingConnectionManager()


app = FastAPI(
    title="Zoom Clone API",
    description="Backend API for Zoom Clone",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


Base.metadata.create_all(bind=engine)

app.include_router(meetings_router)


@app.on_event("startup")
def seed_database():
    db = SessionLocal()

    try:
        user = db.query(User).filter(User.id == 1).first()

        if not user:
            user = User(
                id=1,
                name="Ritesh Anand",
                email="ritesh@example.com",
                avatar="R",
            )

            db.add(user)
            db.commit()

        existing_meeting = (
            db.query(Meeting)
            .filter(Meeting.title == "Project Discussion")
            .first()
        )

        if not existing_meeting:
            from datetime import datetime, timedelta

            meeting = Meeting(
                meeting_id="847293615",
                title="Project Discussion",
                description="Discussion about the project",
                host_id=1,
                scheduled_at=datetime.utcnow() + timedelta(days=1),
                duration=60,
                invite_link="/meeting/847293615",
                status="scheduled",
            )

            db.add(meeting)
            db.commit()

    finally:
        db.close()


@app.get("/")
def root():
    return {
        "message": "Zoom Clone API is running",
        "status": "success",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
    }
    
    
@app.websocket("/ws/meeting/{meeting_id}")
async def meeting_websocket(
    websocket: WebSocket,
    meeting_id: str,
):
    display_name = (
        websocket.query_params.get(
            "name"
        )
        or "Guest"
    )

    db = SessionLocal()

    try:
        meeting = (
            db.query(Meeting)
            .filter(
                Meeting.meeting_id == meeting_id
            )
            .first()
        )

        if not meeting:
            await websocket.close(
                code=1008,
                reason="Meeting not found",
            )
            return

        participant_id = uuid.uuid4().hex[:12]

        await manager.connect(
            meeting_id=meeting_id,
            participant_id=participant_id,
            websocket=websocket,
            display_name=display_name,
        )

        try:
            while True:
                message = await websocket.receive_json()

                message_type = message.get("type")

                if message_type in {
                    "offer",
                    "answer",
                    "ice-candidate",
                }:
                    target = message.get("to")

                    if not target:
                        continue

                    await manager.send_to(
                        meeting_id,
                        target,
                        {
                            **message,
                            "from": participant_id,
                        },
                    )

                elif message_type == "chat":
                    await manager.broadcast(
                        meeting_id,
                        {
                            "type": "chat",
                            "from": participant_id,
                            "name": display_name,
                            "message": message.get(
                                "message",
                                "",
                            ),
                        },
                    )
                    
                elif message_type == "media-state":
                    await manager.broadcast(
                        meeting_id,
                        {
                            "type": "media-state",
                            "participant_id": participant_id,
                            "mic_on": message.get("mic_on", True),
                            "camera_on": message.get("camera_on", True),
                        },
                        exclude=participant_id,
                    )
                
                elif message_type == "host-mute":
                    target = message.get("to")

                    if not target:
                        continue

                    room = manager.rooms.get(
                        meeting_id,
                        {}
                    )

                    sender = room.get(
                        participant_id
                    )

                    if not sender or not sender["is_host"]:
                        continue

                    target_participant = room.get(
                        target
                    )

                    if not target_participant:
                        continue

                    # Tell the target user to mute locally.
                    await target_participant["socket"].send_json({
                        "type": "host-mute",
                    })

                    # Tell everyone else that this participant
                    # is now muted.
                    await manager.broadcast(
                        meeting_id,
                        {
                            "type": "host-mute-status",
                            "participant_id": target,
                        },
                        exclude=target,
                    )

                elif message_type == "host-remove":
                    target = message.get("to")

                    if not target:
                        continue

                    room = manager.rooms.get(
                        meeting_id,
                        {}
                    )

                    sender = room.get(
                        participant_id
                    )

                    if not sender or not sender["is_host"]:
                        continue

                    target_participant = room.get(
                        target
                    )

                    if not target_participant:
                        continue

                    await target_participant["socket"].send_json({
                        "type": "host-remove",
                    })

                    await target_participant["socket"].close(
                        code=1000,
                        reason="Removed by host",
                    )

        except WebSocketDisconnect:
            pass

    except Exception as error:
        print(
            "WebSocket error:",
            error,
        )

        try:
            await websocket.close(
                code=1011,
            )
        except Exception:
            pass

    finally:
        await manager.disconnect(
            meeting_id,
            participant_id
            if "participant_id" in locals()
            else "",
        )

        db.close()