from fastapi import APIRouter, Depends, HTTPException, status

from auth import get_current_user
from sqlalchemy.orm import Session

from crud import (
    create_instant_meeting,
    create_scheduled_meeting,
    get_meeting,
    get_recent_meetings,
    get_upcoming_meetings,
    join_meeting,
    get_or_create_user,
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
    current_user=Depends(get_current_user),
):
    clerk_user_id = current_user.payload.get("sub")

    if not clerk_user_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid Clerk user",
        )

    user = get_or_create_user(
        db=db,
        clerk_user_id=clerk_user_id,
        name=f"User {clerk_user_id[:8]}",
        email=f"{clerk_user_id}@clerk.local",
        avatar="U",
    )

    return create_instant_meeting(
        db,
        data.title,
        user.id,
    )

@router.post(
    "/schedule",
    response_model=MeetingResponse,
    status_code=status.HTTP_201_CREATED,
)
@router.post(
    "/schedule",
    response_model=MeetingResponse,
    status_code=status.HTTP_201_CREATED,
)
def schedule_meeting(
    data: ScheduledMeetingCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    clerk_user_id = current_user.payload.get("sub")

    if not clerk_user_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid Clerk user",
        )

    email = f"{clerk_user_id}@clerk.local"
    name = f"User {clerk_user_id[:8]}"

    avatar = (
        name[0].upper()
        if name
        else "U"
    )

    user = get_or_create_user(
        db=db,
        clerk_user_id=clerk_user_id,
        name=name,
        email=email,
        avatar="U",
    )

    return create_scheduled_meeting(
        db=db,
        title=data.title,
        description=data.description,
        scheduled_at=data.scheduled_at,
        duration=data.duration,
        user_id=user.id,
    )


@router.get(
    "/upcoming",
    response_model=list[MeetingResponse],
)
def upcoming_meetings(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return get_upcoming_meetings(db)


@router.get(
    "/recent",
    response_model=list[MeetingResponse],
)
def recent_meetings(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return get_recent_meetings(db)


@router.get(
    "/{meeting_id}",
    response_model=MeetingResponse,
)
def get_single_meeting(
    meeting_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
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
    current_user=Depends(get_current_user),
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