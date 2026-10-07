"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Link as LinkIcon,
  User,
  Video,
} from "lucide-react";

const API_URL = "https://zoom-clone-qd7w.onrender.com";

export default function JoinPage() {
  const router = useRouter();

  const [meetingId, setMeetingId] = useState("");
  const [displayName, setDisplayName] = useState("Ritesh Anand");
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    const cleanedMeetingId = meetingId
      .replace(/\s/g, "")
      .trim();

    if (!cleanedMeetingId) {
      setError("Please enter a meeting ID.");
      return;
    }

    if (!displayName.trim()) {
      setError("Please enter your display name.");
      return;
    }

    setJoining(true);

    try {
      const meetingResponse = await fetch(
        `${API_URL}/api/meetings/${cleanedMeetingId}`
      );

      if (!meetingResponse.ok) {
        setError("Meeting not found. Please check the meeting ID.");
        return;
      }

      await meetingResponse.json();

      const joinResponse = await fetch(
        `${API_URL}/api/meetings/${cleanedMeetingId}/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            display_name: displayName.trim(),
          }),
        }
      );

      if (!joinResponse.ok) {
        const data = await joinResponse.json();

        throw new Error(
          data.detail || "Unable to join meeting."
        );
      }

      router.push(
        `/meeting/${cleanedMeetingId}?name=${encodeURIComponent(
          displayName.trim()
        )}`
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to join meeting."
      );
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="form-page">

      <div className="form-page-header">

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

      </div>

      <main className="join-page-content">

        <div className="join-card">

          <div className="join-icon">
            <Video size={34} />
          </div>

          <h1>
            Join a Meeting
          </h1>

          <p className="join-description">
            Enter the meeting ID or personal link
            provided by the host.
          </p>

          <form onSubmit={handleSubmit}>

            <div className="form-field">
              <label htmlFor="meetingId">
                Meeting ID
              </label>

              <div className="input-wrapper">
                <LinkIcon size={19} />

                <input
                  id="meetingId"
                  type="text"
                  placeholder="e.g. 847293615"
                  value={meetingId}
                  onChange={(event) =>
                    setMeetingId(event.target.value)
                  }
                />
              </div>

              <span className="input-hint">
                Enter the 9-digit meeting ID.
              </span>
            </div>

            <div className="form-field">
              <label htmlFor="displayName">
                Your Name
              </label>

              <div className="input-wrapper">
                <User size={19} />

                <input
                  id="displayName"
                  type="text"
                  placeholder="Enter your name"
                  value={displayName}
                  onChange={(event) =>
                    setDisplayName(event.target.value)
                  }
                  maxLength={100}
                />
              </div>
            </div>

            {error && (
              <div className="form-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="primary-button join-button"
              disabled={joining}
            >
              {joining
                ? "Joining..."
                : "Join Meeting"}
            </button>

          </form>

          <div className="join-note">
            By joining, you agree to use this meeting
            responsibly.
          </div>

        </div>

      </main>
    </div>
  );
}