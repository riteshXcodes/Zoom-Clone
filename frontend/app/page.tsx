"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronDown,
  ExternalLink,
  CalendarDays,
  Plus,
  Video,
  Copy,
  Check,
  MoreHorizontal,
  Play,
  FileText,
  Sparkles,
  BookOpen,
  PenLine,
  ClipboardList,
  LayoutGrid,
  StickyNote,
  Presentation,
  MessageSquare,
  Settings,
} from "lucide-react";

type Meeting = {
  id: number;
  meeting_id: string;
  title: string;
  description: string | null;
  host_id: number;
  scheduled_at: string | null;
  duration: number;
  invite_link: string;
  status: string;
  created_at: string;
};

const API_URL = "https://zoom-clone-qd7w.onrender.com";

const sidebarItems = [
  { label: "AI", icon: Sparkles, external: true, new: true },
  { label: "Meetings", icon: Video },
  { label: "Recordings", icon: Play },
  { label: "Summaries", icon: FileText },
  { label: "Hub", icon: BookOpen, external: true, new: true },
  { label: "Whiteboards", icon: PenLine, external: true },
  { label: "Notes", icon: StickyNote },
  { label: "Clips", icon: ClipboardList, external: true },
  { label: "Canvas", icon: LayoutGrid, external: true },
  { label: "Paper", icon: FileText, external: true },
  { label: "Sheets", icon: ClipboardList, external: true },
  { label: "Slides", icon: Presentation, external: true },
];

export default function Home() {
  const router = useRouter();

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(true);
  const [creatingMeeting, setCreatingMeeting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchUpcomingMeetings();
  }, []);

  async function fetchUpcomingMeetings() {
    try {
      const response = await fetch(
        `${API_URL}/api/meetings/upcoming`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch meetings");
      }

      const data = await response.json();
      setMeetings(data);
    } catch (error) {
      console.error("Failed to fetch meetings:", error);
    } finally {
      setLoadingMeetings(false);
    }
  }

  async function createInstantMeeting() {
    if (creatingMeeting) return;

    setCreatingMeeting(true);

    try {
      const response = await fetch(
        `${API_URL}/api/meetings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: "Instant Meeting",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create meeting");
      }

      const meeting: Meeting = await response.json();

      router.push(`/meeting/${meeting.meeting_id}`);
    } catch (error) {
      console.error("Failed to create meeting:", error);
      alert("Unable to create meeting. Please try again.");
      setCreatingMeeting(false);
    }
  }

  async function copyMeetingId() {
    try {
      await navigator.clipboard.writeText("847 293 615");

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy meeting ID:", error);
    }
  }

  function formatMeetingDate(date: string | null) {
    if (!date) return "";

    const meetingDate = new Date(date);

    return meetingDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatMeetingTime(date: string | null) {
    if (!date) return "";

    const meetingDate = new Date(date);

    return meetingDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return (
    <div className="zoom-app">

      {/* TOP UTILITY BAR */}
      <div className="top-bar">
        <div className="top-bar-spacer" />

        <div className="top-links">
          <button className="top-link">
            <Search size={20} strokeWidth={2.2} />
            <span>Search</span>
          </button>

          <button className="top-link">
            Support
          </button>

          <button className="top-link">
            0008000503335
          </button>

          <div className="top-divider" />

          <button className="top-link">
            Contact Sales
          </button>

          <button className="top-link">
            Request a Demo
          </button>
        </div>
      </div>

      {/* MAIN NAVBAR */}
      <header className="main-navbar">

        <div className="zoom-logo">
          zoom
        </div>

        <nav className="nav-left">
          <button>Products</button>
          <button>Solutions</button>
          <button>Resources</button>
          <button>Plans & Pricing</button>
        </nav>

        <nav className="nav-right">
          <button onClick={() => router.push("/schedule")}>
            Schedule
          </button>

          <button onClick={() => router.push("/join")}>
            Join
          </button>

          <button
            className="nav-with-icon"
            onClick={createInstantMeeting}
          >
            Host
            <ChevronDown size={16} />
          </button>

          <button className="nav-with-icon">
            Web App
            <ChevronDown size={16} />
          </button>

          <button className="profile-avatar-small">
            R
          </button>
        </nav>
      </header>

      {/* MAIN AREA */}
      <div className="main-layout">

        {/* SIDEBAR */}
        <aside className="sidebar">

          <button className="sidebar-home active">
            Home
          </button>

          <div className="sidebar-heading">
            My Products
          </div>

          <div className="sidebar-list">
            {sidebarItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  className="sidebar-item"
                  key={item.label}
                  onClick={() => {
                    if (item.label === "Meetings") {
                      router.push("/meetings");
                    }
                  }}
                >
                  <div className="sidebar-item-left">
                    <Icon size={19} strokeWidth={1.8} />
                    <span>{item.label}</span>

                    {item.new && (
                      <span className="new-badge">
                        New
                      </span>
                    )}
                  </div>

                  {item.external && (
                    <ExternalLink
                      size={17}
                      strokeWidth={1.8}
                    />
                  )}
                </button>
              );
            })}
          </div>

        </aside>

        {/* CONTENT */}
        <main className="dashboard-content">

          <div className="dashboard-grid">

            {/* LEFT COLUMN */}
            <section className="dashboard-left">

              {/* PROFILE CARD */}
              <div className="profile-card">

                <div className="profile-info">

                  <div className="large-avatar">
                    R
                  </div>

                  <div>
                    <h1>Ritesh anand</h1>

                    <p>
                      Plan:{" "}
                      <strong>
                        Workplace Basic
                      </strong>
                    </p>
                  </div>

                </div>

                <button className="manage-plan">
                  Manage Plan
                </button>

                <button className="view-plan">
                  View Plan Details
                </button>

              </div>

              {/* PROMOTIONAL CARD */}
              <div className="promo-card">

                <div className="promo-title">
                  <div className="mini-zoom-icon">
                    zoom
                  </div>

                  <span>
                    Workplace Pro
                  </span>
                </div>

                <h2>
                  Upgrade and save!
                </h2>

                <p>
                  Unlock more powerful collaboration
                  features for your team.
                </p>

                <button className="promo-button">
                  Explore Workplace Pro
                </button>

              </div>

            </section>

            {/* RIGHT COLUMN */}
            <section className="dashboard-right">

              {/* QUICK ACTION CARD */}
              <div className="quick-actions-card">

                <div className="quick-actions">

                  <button
                    className="quick-action"
                    onClick={() => router.push("/schedule")}
                  >
                    <div className="quick-icon blue">
                      <CalendarDays size={27} />
                    </div>

                    <span>
                      Schedule
                    </span>
                  </button>

                  <button
                    className="quick-action"
                    onClick={() => router.push("/join")}
                  >
                    <div className="quick-icon blue">
                      <Plus size={29} />
                    </div>

                    <span>
                      Join
                    </span>
                  </button>

                  <button
                    className="quick-action"
                    onClick={createInstantMeeting}
                    disabled={creatingMeeting}
                  >
                    <div className="quick-icon orange">
                      <Video size={27} />
                    </div>

                    <span>
                      {creatingMeeting
                        ? "Starting..."
                        : "Host"}
                    </span>
                  </button>

                </div>

                <div className="pmid-section">

                  <h3>
                    Personal Meeting ID
                  </h3>

                  <div className="pmid-value">
                    <span>
                      487 615 6094
                    </span>

                    <button
                      className="copy-button"
                      onClick={copyMeetingId}
                      title="Copy meeting ID"
                    >
                      {copied ? (
                        <Check size={18} />
                      ) : (
                        <Copy size={18} />
                      )}
                    </button>
                  </div>

                </div>

              </div>

              {/* MEETINGS CARD */}
              <div className="meetings-card">

                <div className="meetings-header">

                  <h2>
                    Meetings
                  </h2>

                  <button
                    onClick={() =>
                      router.push("/meetings")
                    }
                  >
                    Visit Meetings
                  </button>

                </div>

                {loadingMeetings ? (
                  <div className="empty-meeting">
                    Loading meetings...
                  </div>
                ) : meetings.length === 0 ? (
                  <div className="empty-meeting">
                    No Upcoming Meetings
                  </div>
                ) : (
                  <div className="meeting-list">

                    {meetings.slice(0, 3).map(
                      (meeting) => (
                        <div
                          className="dashboard-meeting"
                          key={meeting.id}
                        >
                          <div className="meeting-info">
                            <strong>
                              {meeting.title}
                            </strong>

                            <span>
                              {formatMeetingDate(
                                meeting.scheduled_at
                              )}{" "}
                              ·{" "}
                              {formatMeetingTime(
                                meeting.scheduled_at
                              )}
                            </span>
                          </div>

                          <button
                            onClick={() =>
                              router.push(
                                `/meeting/${meeting.meeting_id}`
                              )
                            }
                          >
                            Join
                          </button>
                        </div>
                      )
                    )}

                  </div>
                )}

                <button className="test-button">
                  Test Audio and Video
                </button>

              </div>

            </section>

          </div>

        </main>
      </div>

      {/* FLOATING HELP BUTTON */}
      <button className="help-button">
        <MessageSquare size={23} />
      </button>

    </div>
  );
}