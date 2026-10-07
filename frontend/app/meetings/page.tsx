"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Copy,
  Plus,
  Video,
} from "lucide-react";

type Meeting = {
  id: number;
  meeting_id: string;
  title: string;
  description: string | null;
  scheduled_at: string | null;
  duration: number;
  invite_link: string;
  status: string;
  created_at: string;
};

const API_URL = "https://zoom-clone-qd7w.onrender.com";

export default function MeetingsPage() {
  const router = useRouter();

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState("");

  useEffect(() => {
    loadMeetings();
  }, []);

  async function loadMeetings() {
    try {
      const response = await fetch(
        `${API_URL}/api/meetings/recent`
      );

      if (!response.ok) {
        throw new Error("Failed to load meetings.");
      }

      const data = await response.json();

      setMeetings(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(date: string | null) {
    if (!date) return "Instant meeting";

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  }

  function formatTime(date: string | null) {
    if (!date) return "";

    return new Date(date).toLocaleTimeString(
      "en-US",
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );
  }

  async function copyInvite(meeting: Meeting) {
    const link = `${window.location.origin}/meeting/${meeting.meeting_id}`;

    await navigator.clipboard.writeText(link);

    setCopiedId(meeting.meeting_id);

    setTimeout(() => {
      setCopiedId("");
    }, 2000);
  }

  return (
    <div className="meetings-page">

      <header className="meetings-page-header">

        <button
          className="back-button"
          onClick={() => router.push("/")}
        >
          <ArrowLeft size={20} />
          Back to Home
        </button>

        <div className="form-brand">
          <span>zoom</span>
        </div>

        <button
          className="new-meeting-button"
          onClick={() => router.push("/schedule")}
        >
          <Plus size={19} />
          Schedule Meeting
        </button>

      </header>

      <main className="meetings-page-content">

        <div className="meetings-title-area">

          <div>
            <h1>Meetings</h1>

            <p>
              View and manage your meetings.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={() => router.push("/schedule")}
          >
            <CalendarDays size={18} />
            Schedule
          </button>

        </div>

        {loading ? (
          <div className="page-loading">
            Loading meetings...
          </div>
        ) : meetings.length === 0 ? (
          <div className="no-meetings">

            <div className="no-meetings-icon">
              <Video size={32} />
            </div>

            <h2>
              No meetings yet
            </h2>

            <p>
              Schedule your first meeting to get started.
            </p>

            <button
              className="primary-button"
              onClick={() => router.push("/schedule")}
            >
              Schedule Meeting
            </button>

          </div>
        ) : (
          <div className="meetings-list-page">

            {meetings.map((meeting) => (
              <div
                className="meeting-row"
                key={meeting.id}
              >

                <div className="meeting-row-icon">
                  <Video size={22} />
                </div>

                <div className="meeting-row-info">

                  <h3>
                    {meeting.title}
                  </h3>

                  <div className="meeting-row-meta">

                    <span>
                      <CalendarDays size={15} />
                      {formatDate(
                        meeting.scheduled_at
                      )}
                    </span>

                    {meeting.scheduled_at && (
                      <span>
                        <Clock3 size={15} />
                        {formatTime(
                          meeting.scheduled_at
                        )}
                      </span>
                    )}

                    <span>
                      {meeting.duration} min
                    </span>

                  </div>

                  <span className="meeting-id">
                    Meeting ID:{" "}
                    {meeting.meeting_id}
                  </span>

                </div>

                <div className="meeting-row-actions">

                  <button
                    className="copy-invite-button"
                    onClick={() =>
                      copyInvite(meeting)
                    }
                  >
                    <Copy size={17} />

                    {copiedId === meeting.meeting_id
                      ? "Copied"
                      : "Copy Invite"}
                  </button>

                  <button
                    className="join-small-button"
                    onClick={() =>
                      router.push(
                        `/meeting/${meeting.meeting_id}`
                      )
                    }
                  >
                    Join
                  </button>

                </div>

              </div>
            ))}

          </div>
        )}

      </main>
    </div>
  );
}