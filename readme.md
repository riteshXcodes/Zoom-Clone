# Zoom Clone - Video Conferencing Platform

A full-stack video conferencing web application inspired by Zoom.  
The application provides core meeting workflows including creating, joining, scheduling, and managing online meetings with real-time audio/video communication.

---

## Features

### Core Features

#### 1. Landing Dashboard

- Zoom-inspired dashboard interface
- New Meeting
- Join Meeting
- Schedule Meeting
- Upcoming Meetings section
- Recent Meetings section
- Default logged-in user

#### 2. Instant Meeting Creation

- Create a meeting instantly
- Automatically generate a unique Meeting ID
- Automatically generate a shareable meeting link
- Redirect directly to the meeting room after creation

#### 3. Join Meeting

- Join using Meeting ID
- Join using meeting link
- Enter display name before joining
- Validate meeting existence before joining

#### 4. Schedule Meetings

- Create scheduled meetings
- Meeting title
- Meeting description
- Date and time picker
- Meeting duration
- Automatically generated meeting link
- Store scheduled meetings in the database
- Display scheduled meetings in Upcoming Meetings

#### 5. Meeting Room

- Real-time video communication
- Real-time audio communication
- Multiple participants
- Camera on/off
- Microphone on/off
- Screen sharing
- Participant list
- Real-time chat
- Meeting information
- Leave meeting functionality

---

## Bonus Features

### Host Controls

The application includes host-management functionality:

- Host identification
- Host badge
- Mute individual participants
- Remove participants
- Automatic host transfer when the current host leaves

### Responsive Design

The interface is designed to provide a clean experience across different screen sizes, including:

- Desktop
- Tablet
- Mobile

### Real-Time Participant Management

- Participant join notifications
- Participant leave handling
- Real-time microphone state
- Real-time camera state
- Host state synchronization

---

# Tech Stack

## Frontend

- Next.js
- React
- TypeScript
- CSS
- Lucide React

## Backend

- Python
- FastAPI
- SQLAlchemy
- WebSockets
- Uvicorn

## Database

- SQLite
- SQLAlchemy ORM

## Real-Time Communication

- WebRTC
- WebSockets

---

# Database Design

The application uses **SQLite** with **SQLAlchemy ORM**.

The database is designed around three main entities:

```text
User
  |
  | 1
  |
  | N
Meeting
  |
  | 1
  |
  | N
Participant
```

## User

Stores information about application users.

| Field | Description |
|---|---|
| id | Unique user identifier |
| name | User display name |

## Meeting

Stores information about meetings.

| Field | Description |
|---|---|
| id | Unique database identifier |
| meeting_id | Unique meeting identifier |
| title | Meeting title |
| description | Meeting description |
| scheduled_at | Scheduled date and time |
| duration | Meeting duration |
| host_id | User who created/hosts the meeting |

## Participant

Stores participants associated with meetings.

| Field | Description |
|---|---|
| id | Unique participant identifier |
| meeting_id | Associated meeting |
| user_id | Associated user |
| is_host | Indicates whether the participant is the host |

### Relationships

- One **User** can create multiple meetings.
- One **Meeting** can have multiple participants.
- A **Participant** belongs to a specific meeting.
- A meeting has one host at a time.
- Host responsibility can be transferred when the current host leaves.

---

# Project Structure

```text
zoom-clone/
│
├── backend/
│   ├── routers/
│   ├── venv/
│   ├── crud.py
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   └── schemas.py
│
├── frontend/
│   ├── app/
│   ├── public/
│   ├── package.json
│   ├── package-lock.json
│   ├── next.config.ts
│   └── tsconfig.json
│
└── README.md
```

---

# Requirements

Before running the project, make sure the following are installed:

- Node.js
- npm
- Python 3.x
- Git
- Modern web browser such as Chrome, Edge, or Firefox

Check the installed versions:

```bash
node --version
npm --version
python --version
git --version
```

---

# Setup Instructions

## 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd zoom-clone
```

---

# Backend Setup

Open a terminal and navigate to the backend:

```bash
cd backend
```

### Create Virtual Environment

```bash
python -m venv venv
```

### Activate Virtual Environment

Windows:

```bash
venv\Scripts\activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Start Backend

```bash
uvicorn main:app --reload
```

The backend will run at:

```text
http://127.0.0.1:8000
```

FastAPI documentation:

```text
http://127.0.0.1:8000/docs
```

---

# Frontend Setup

Open a **new terminal** while keeping the backend running.

Navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will run at:

```text
http://localhost:3000
```

Open this URL in your browser.

---

# Running the Application

Two terminals are required.

### Terminal 1 - Backend

```bash
cd backend
venv\Scripts\activate
uvicorn main:app --reload
```

### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

Then open:

```text
http://localhost:3000
```

---

# Production Build

To create a production build of the frontend:

```bash
cd frontend
npm run build
```

To start the production frontend:

```bash
npm start
```

---

# Meeting Workflow

The application follows this workflow:

```text
                    Dashboard
                        |
          +-------------+-------------+
          |             |             |
          v             v             v
     New Meeting    Join Meeting   Schedule
          |             |          Meeting
          |             |             |
          v             v             v
          +-------------+-------------+
                        |
                        v
                  Meeting Room
                        |
       +----------------+----------------+
       |                |                |
       v                v                v
     Audio            Video          Screen Share
       |                |                |
       +----------------+----------------+
                        |
                        v
                 Participants
                        |
                 +------+------+
                 |             |
               Chat      Host Controls
```

---

# Real-Time Communication

The application uses:

### WebRTC

WebRTC is used for:

- Audio communication
- Video communication
- Screen sharing
- Receiving remote participant streams

### WebSockets

WebSockets are used for:

- WebRTC signaling
- Participant join/leave events
- Chat messages
- Camera state synchronization
- Microphone state synchronization
- Host controls
- Host transfer

---

# Host Management

The first participant entering a meeting becomes the host.

The host can:

- See which participants are present
- Mute participants
- Remove participants
- Manage the meeting

If the current host leaves while other participants remain, host responsibility is transferred to another participant.

---

# Assumptions

- A default user is assumed to be logged in.
- Authentication is not required for the core functionality.
- SQLite is used as the database as specified in the assignment.
- Camera and microphone permissions are required for audio/video functionality.
- WebRTC is used for real-time media communication.
- WebSockets are used for real-time signaling and meeting events.
- The application is designed primarily for modern browsers.
- Advanced Zoom features outside the assignment scope are not implemented.

---

# Testing

The following functionality has been tested:

- Dashboard
- Instant meeting creation
- Meeting ID generation
- Meeting link generation
- Join meeting
- Meeting validation
- Display name
- Meeting scheduling
- Upcoming meetings
- Audio/video communication
- Multiple participants
- Microphone controls
- Camera controls
- Screen sharing
- Participant list
- Chat
- Host identification
- Host mute
- Participant removal
- Host transfer
- Leaving a meeting
- Backend startup
- Frontend production build

---

# Assignment Requirements Coverage

| Assignment Requirement | Status |
|---|---|
| Landing Dashboard | Implemented |
| New Meeting | Implemented |
| Join Meeting | Implemented |
| Schedule Meeting | Implemented |
| Upcoming Meetings | Implemented |
| Recent Meetings | Implemented |
| Unique Meeting ID | Implemented |
| Shareable Invite Link | Implemented |
| Join using Meeting ID | Implemented |
| Join using Invite Link | Implemented |
| Display Name | Implemented |
| Meeting Validation | Implemented |
| Title / Description | Implemented |
| Date & Time | Implemented |
| Duration | Implemented |
| Database Storage | Implemented |
| Audio / Video | Implemented |
| Participant Management | Implemented |

---

# Bonus Features

| Bonus Feature | Status |
|---|---|
| Responsive Design | Implemented |
| Host Controls | Implemented |
| Mute Participant | Implemented |
| Remove Participant | Implemented |
| Host Transfer | Implemented |

---

# Design Approach

The UI follows a Zoom-inspired design approach with:

- Dark meeting interface
- Video grid
- Bottom meeting controls
- Participant sidebar
- Chat sidebar
- Meeting information panel
- Host indicators
- Clean dashboard
- Meeting scheduling interface
- Responsive layout

---

# Author

Developed as part of the SDE Fullstack Assignment.

---
