"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  FileText,
  Link as LinkIcon,
  Video,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

export default function SchedulePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("60");

  const [today, setToday] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
  setToday(new Date().toISOString().split("T")[0]);
}, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!title.trim()) {
      setError("Please enter a meeting title.");
      return;
    }

    if (!date || !time) {
      setError("Please select a date and time.");
      return;
    }

    setSaving(true);

    try {
      const scheduledAt = `${date}T${time}:00`;

      const response = await fetch(
        `${API_URL}/api/meetings/schedule`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim() || null,
            scheduled_at: scheduledAt,
            duration: Number(duration),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to schedule meeting."
        );
      }

      router.push("/meetings");
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to schedule meeting."
      );
    } finally {
      setSaving(false);
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

      <main className="form-page-content">

        <div className="form-card">

          <div className="form-heading">
            <div className="form-heading-icon blue-icon">
              <CalendarDays size={27} />
            </div>

            <div>
              <h1>Schedule Meeting</h1>
              <p>
                Schedule a meeting and invite participants.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="form-field">
              <label htmlFor="title">
                Meeting Topic
              </label>

              <div className="input-wrapper">
                <Video size={19} />
                <input
                  id="title"
                  type="text"
                  placeholder="e.g. Project Discussion"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  maxLength={200}
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="description">
                Description
              </label>

              <div className="textarea-wrapper">
                <FileText size={19} />
                <textarea
                  id="description"
                  placeholder="Add a description for your meeting..."
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  rows={4}
                />
              </div>
            </div>

            <div className="form-two-column">

              <div className="form-field">
                <label htmlFor="date">
                  Date
                </label>

                <div className="input-wrapper">
                  <CalendarDays size={19} />

                  <input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(event) =>
                      setDate(event.target.value)
                    }
                    min={today}
                  />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="time">
                  Time
                </label>

                <div className="input-wrapper">
                  <Clock3 size={19} />

                  <input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(event) =>
                      setTime(event.target.value)
                    }
                  />
                </div>
              </div>

            </div>

            <div className="form-field">

              <label htmlFor="duration">
                Duration
              </label>

              <div className="input-wrapper">
                <Clock3 size={19} />

                <select
                  id="duration"
                  value={duration}
                  onChange={(event) =>
                    setDuration(event.target.value)
                  }
                >
                  <option value="15">
                    15 minutes
                  </option>

                  <option value="30">
                    30 minutes
                  </option>

                  <option value="45">
                    45 minutes
                  </option>

                  <option value="60">
                    1 hour
                  </option>

                  <option value="90">
                    1 hour 30 minutes
                  </option>

                  <option value="120">
                    2 hours
                  </option>
                </select>
              </div>

            </div>

            {error && (
              <div className="form-error">
                {error}
              </div>
            )}

            <div className="schedule-info">
              <LinkIcon size={19} />

              <span>
                A unique meeting ID and invite link
                will be generated automatically.
              </span>
            </div>

            <div className="form-actions">

              <button
                type="button"
                className="secondary-button"
                onClick={() => router.push("/")}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving
                  ? "Scheduling..."
                  : "Schedule Meeting"}
              </button>

            </div>

          </form>

        </div>

      </main>
    </div>
  );
}