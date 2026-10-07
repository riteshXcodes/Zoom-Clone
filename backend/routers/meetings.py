from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from crud import (
    create_instant_meeting,
    create_scheduled_meeting,
    get_meeting,
    get_recent_meetings,
    get_upcoming_meetings,
    join_meeting,
)
from database import get_db
from schemas import (
    MeetingCreate,
    MeetingResponse,
    ParticipantJoin,
    ParticipantResponse,
    ScheduledMeetingCreate,
)

router = APIRouter(
    prefix="/api/meetings",
    tags=["Meetings"],
)


@router.post(
    "",
    response_model=MeetingResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_meeting(
    data: MeetingCreate,
    db: Session = Depends(get_db),
):
    return create_instant_meeting(
        db,
        data.title,
    )


@router.post(
    "/schedule",
    response_model=MeetingResponse,
    status_code=status.HTTP_201_CREATED,
)
def schedule_meeting(
    data: ScheduledMeetingCreate,
    db: Session = Depends(get_db),
):
    return create_scheduled_meeting(
        db=db,
        title=data.title,
        description=data.description,
        scheduled_at=data.scheduled_at,
        duration=data.duration,
    )


@router.get(
    "/upcoming",
    response_model=list[MeetingResponse],
)
def upcoming_meetings(
    db: Session = Depends(get_db),
):
    return get_upcoming_meetings(db)


@router.get(
    "/recent",
    response_model=list[MeetingResponse],
)
def recent_meetings(
    db: Session = Depends(get_db),
):
    return get_recent_meetings(db)


@router.get(
    "/{meeting_id}",
    response_model=MeetingResponse,
)
def get_single_meeting(
    meeting_id: str,
    db: Session = Depends(get_db),
):
    meeting = get_meeting(
        db,
        meeting_id,
    )

    if not meeting:
        raise HTTPException(
            status_code=404,
            detail="Meeting not found",
        )

    return meeting


@router.post(
    "/{meeting_id}/join",
    response_model=ParticipantResponse,
)
def join_existing_meeting(
    meeting_id: str,
    data: ParticipantJoin,
    db: Session = Depends(get_db),
):
    meeting = get_meeting(
        db,
        meeting_id,
    )

    if not meeting:
        raise HTTPException(
            status_code=404,
            detail="Meeting not found",
        )

    return join_meeting(
        db=db,
        meeting=meeting,
        display_name=data.display_name,
    )