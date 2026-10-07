from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    avatar = Column(String(10), default="R")
    created_at = Column(DateTime, default=datetime.utcnow)

    meetings = relationship("Meeting", back_populates="host")


class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)

    meeting_id = Column(
        String(20),
        unique=True,
        nullable=False,
        index=True,
    )

    title = Column(String(200), nullable=False)

    description = Column(Text, nullable=True)

    host_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    scheduled_at = Column(DateTime, nullable=True)

    duration = Column(Integer, nullable=False, default=60)

    invite_link = Column(String(300), nullable=False)

    status = Column(
        String(30),
        nullable=False,
        default="scheduled",
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

    host = relationship(
        "User",
        back_populates="meetings",
    )

    participants = relationship(
        "Participant",
        back_populates="meeting",
        cascade="all, delete-orphan",
    )


class Participant(Base):
    __tablename__ = "participants"

    id = Column(Integer, primary_key=True, index=True)

    meeting_id = Column(
        Integer,
        ForeignKey("meetings.id"),
        nullable=False,
    )

    display_name = Column(
        String(100),
        nullable=False,
    )

    joined_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

    left_at = Column(
        DateTime,
        nullable=True,
    )

    meeting = relationship(
        "Meeting",
        back_populates="participants",
    )