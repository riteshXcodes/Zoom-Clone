import secrets
from datetime import datetime

from sqlalchemy.orm import Session

from models import Meeting, Participant, User


def get_or_create_user(
    db: Session,
    clerk_user_id: str,
    name: str,
    email: str,
    avatar: str = "U",
):
    user = (
        db.query(User)
        .filter(
            User.clerk_user_id == clerk_user_id
        )
        .first()
    )

    if user:
        return user

    user = User(
        clerk_user_id=clerk_user_id,
        name=name,
        email=email,
        avatar=avatar,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def generate_meeting_id(db: Session) -> str:
    while True:
        meeting_id = str(
            secrets.randbelow(900_000_000) + 100_000_000
        )

        existing = (
            db.query(Meeting)
            .filter(Meeting.meeting_id == meeting_id)
            .first()
        )

        if not existing:
            return meeting_id


def create_instant_meeting(
    db: Session,
    title: str,
    user_id: int,
):
    

    meeting_id = generate_meeting_id(db)

    meeting = Meeting(
        meeting_id=meeting_id,
        title=title,
        description="Instant meeting",
        host_id=user_id,
        scheduled_at=None,
        duration=60,
        invite_link=f"/meeting/{meeting_id}",
        status="instant",
    )

    db.add(meeting)
    db.commit()
    db.refresh(meeting)

    return meeting

def create_scheduled_meeting(
    db: Session,
    title: str,
    description: str | None,
    scheduled_at: datetime,
    duration: int,
    user_id: int,
):
    meeting_id = generate_meeting_id(db)

    meeting = Meeting(
        meeting_id=meeting_id,
        title=title,
        description=description,
        host_id=user_id,
        scheduled_at=scheduled_at,
        duration=duration,
        invite_link=f"/meeting/{meeting_id}",
        status="scheduled",
    )

    db.add(meeting)
    db.commit()
    db.refresh(meeting)

    return meeting


def get_meeting(
    db: Session,
    meeting_id: str,
):
    return (
        db.query(Meeting)
        .filter(Meeting.meeting_id == meeting_id)
        .first()
    )


def join_meeting(
    db: Session,
    meeting: Meeting,
    display_name: str,
):
    participant = Participant(
        meeting_id=meeting.id,
        display_name=display_name,
    )

    db.add(participant)
    db.commit()
    db.refresh(participant)

    return participant


def get_upcoming_meetings(db: Session):
    now = datetime.utcnow()

    return (
        db.query(Meeting)
        .filter(
            Meeting.status == "scheduled",
            Meeting.scheduled_at >= now,
        )
        .order_by(Meeting.scheduled_at.asc())
        .all()
    )


def get_recent_meetings(db: Session):
    return (
        db.query(Meeting)
        .order_by(Meeting.created_at.desc())
        .limit(10)
        .all()
    )