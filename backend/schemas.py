from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class MeetingCreate(BaseModel):
    title: str = "Instant Meeting"


class ScheduledMeetingCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    scheduled_at: datetime
    duration: int = Field(default=60, gt=0, le=1440)


class ParticipantJoin(BaseModel):
    display_name: str = Field(
        ...,
        min_length=1,
        max_length=100,
    )


class MeetingResponse(BaseModel):
    id: int
    meeting_id: str
    title: str
    description: Optional[str]
    host_id: int
    scheduled_at: Optional[datetime]
    duration: int
    invite_link: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ParticipantResponse(BaseModel):
    id: int
    meeting_id: int
    display_name: str
    joined_at: datetime
    left_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)