"use client";

import {
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";

import { useAuth } from "@clerk/nextjs";

import {
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Users,
  MessageSquare,
  MonitorUp,
  MoreHorizontal,
  PhoneOff,
  X,
  Send,
  ChevronUp,
  Info,
  Copy,
} from "lucide-react";

const API_URL = "https://zoom-clone-qd7w.onrender.com";
const WS_URL = "wss://zoom-clone-qd7w.onrender.com";

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

type Participant = {
  id: string;
  name: string;
  is_host?: boolean;
  mic_on?: boolean;
  camera_on?: boolean;
};

type RemoteParticipant = {
  id: string;
  name: string;
  stream: MediaStream;
};

type ChatMessage = {
  id: number;
  name: string;
  message: string;
  mine: boolean;
};

function MeetingRoomContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { getToken } = useAuth();

  const meetingId = String(
    params.meetingId
  );

  const nameFromUrl =
    searchParams.get("name");

  const [displayName, setDisplayName] =
    useState(
      nameFromUrl || "Ritesh Anand"
    );

  const [meeting, setMeeting] =
    useState<Meeting | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [connected, setConnected] =
    useState(false);

  const [micOn, setMicOn] =
    useState(true);

  const [cameraOn, setCameraOn] =
    useState(true);

  const [screenSharing, setScreenSharing] =
    useState(false);

  const [showParticipants, setShowParticipants] =
    useState(false);

  const [showChat, setShowChat] =
    useState(false);

  const [showMeetingInfo, setShowMeetingInfo] =
    useState(false);

  const [copied, setCopied] =
    useState(false);

  const [chatMessage, setChatMessage] =
    useState("");

  const [participants, setParticipants] =
    useState<Participant[]>([]);

  const [isHost, setIsHost] =
  useState(false);

  const [remoteParticipants, setRemoteParticipants] =
    useState<RemoteParticipant[]>([]);

  const [messages, setMessages] =
    useState<ChatMessage[]>([
      {
        id: 1,
        name: "System",
        message:
          "Welcome to the meeting.",
        mine: false,
      },
    ]);

  const videoRef =
    useRef<HTMLVideoElement | null>(null);

  const localStreamRef =
    useRef<MediaStream | null>(null);

  const screenStreamRef =
    useRef<MediaStream | null>(null);

  const websocketRef =
    useRef<WebSocket | null>(null);

  const peerConnectionsRef =
    useRef<
      Record<string, RTCPeerConnection>
    >({});

  const pendingCandidatesRef =
    useRef<
      Record<
        string,
        RTCIceCandidateInit[]
      >
    >({});

  const remoteParticipantsRef =
    useRef<
      Record<
        string,
        RemoteParticipant
      >
    >({});

  const participantsRef =
    useRef<Participant[]>([]);

  const sessionIdRef =
    useRef(0);

  const sentChatMessageIdsRef =
    useRef<Set<string>>(new Set());

  useEffect(() => {
    if (
      !loading &&
      videoRef.current &&
      localStreamRef.current
    ) {
      videoRef.current.srcObject =
        localStreamRef.current;

      videoRef.current
        .play()
        .catch(() => {});
    }
  }, [loading]);

  /*
   * Load meeting.
   */

  useEffect(() => {
    const sessionId =
      sessionIdRef.current + 1;

    sessionIdRef.current =
      sessionId;

    let cancelled = false;

    const isActive = () =>
      !cancelled &&
      sessionIdRef.current ===
        sessionId;

    loadMeeting(isActive);

    return () => {
      cancelled = true;

      if (
        sessionIdRef.current ===
        sessionId
      ) {
        cleanupMeeting();
      }
    };
  }, [meetingId]);

  async function loadMeeting(
    isActive: () => boolean
  ) {
    try {
      setLoading(true);
      setError("");

      const token = await getToken();

      if (!token) {
        setError("Authentication required.");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/meetings/${meetingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!isActive()) {
        return;
      }

      if (!response.ok) {
        setError("Meeting not found.");
        return;
      }

      const data: Meeting =
        await response.json();

      setMeeting(data);

      const mediaStarted =
        await startLocalMedia(
          isActive
        );

      if (
        !mediaStarted ||
        !isActive()
      ) {
        return;
      }

      connectWebSocket(
        sessionIdRef.current
      );
    } catch (err) {
      console.error(err);

      if (isActive()) {
        setError(
          "Unable to connect to the meeting."
        );
      }
    } finally {
      if (isActive()) {
        setLoading(false);
      }
    }
  }

  /*
   * Camera + microphone.
   */

  async function startLocalMedia(
    isActive?: () => boolean
  ) {
    try {
      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            video: true,
            audio: true,
          }
        );

      if (
        isActive &&
        !isActive()
      ) {
        stream
          .getTracks()
          .forEach((track) =>
            track.stop()
          );

        return false;
      }

      localStreamRef.current =
        stream;

      const videoTrack =
        stream.getVideoTracks()[0];

      const audioTrack =
        stream.getAudioTracks()[0];

      setCameraOn(
        Boolean(videoTrack)
      );

      setMicOn(
        Boolean(audioTrack)
      );

      if (videoRef.current) {
        videoRef.current.srcObject =
          stream;
      }

      return true;
    } catch (err) {
      console.error(
        "Camera/microphone error:",
        err
      );

      setCameraOn(false);
      setMicOn(false);

      /*
       * Camera permission should not
       * prevent joining the meeting.
       */
      return true;
    }
  }

  /*
   * WebSocket signaling.
   */

  async function connectWebSocket(
  sessionId: number
) {
  try {
    const token = await getToken();

    if (!token) {
      setError(
        "Authentication required."
      );
      return;
    }

    const socketUrl =
      `${WS_URL}/ws/meeting/` +
      `${meetingId}?token=` +
      encodeURIComponent(token) +
      `&name=` +
      encodeURIComponent(
        displayName
      );

    const socket =
      new WebSocket(socketUrl);

    websocketRef.current =
      socket;

    socket.onopen = () => {
      if (
        sessionIdRef.current !==
        sessionId
      ) {
        socket.close();
        return;
      }

      console.log(
        "WebSocket connected"
      );

      setConnected(true);
    };

    socket.onclose = () => {
      if (
        sessionIdRef.current !==
        sessionId
      ) {
        return;
      }

      console.log(
        "WebSocket disconnected"
      );

      setConnected(false);
    };

    socket.onerror = (event) => {
      if (
        sessionIdRef.current !==
        sessionId
      ) {
        return;
      }

      console.error(
        "WebSocket error:",
        event
      );
    };

    socket.onmessage = async (
      event
    ) => {
      if (
        sessionIdRef.current !==
        sessionId
      ) {
        return;
      }

      try {
        const message =
          JSON.parse(event.data);

        await handleSignalingMessage(
          message
        );
      } catch (err) {
        console.error(
          "Signaling message error:",
          err
        );
      }
    };
  } catch (error) {
    console.error(
      "WebSocket authentication error:",
      error
    );

    setError(
      "Unable to authenticate with the meeting."
    );
  }
}

  /*
   * Signaling message handler.
   */

  async function handleSignalingMessage(
    message: any
  ) {
    switch (message.type) {
      case "participants": {
        const nextParticipants =
            message.participants || [];

        participantsRef.current =
            nextParticipants;

        setParticipants(
            nextParticipants
        );

        setIsHost(
            Boolean(message.is_host)
        );

        /*
         * Existing participants will
         * receive our connection through
         * their user-joined event.
         *
         * We don't create offers here.
         */

        break;
      }

      case "user-joined": {
        const participant =
            message.participant;

        participantsRef.current = [
            ...participantsRef.current.filter(
            (item) =>
                item.id !== participant.id
            ),
            participant,
        ];

        setParticipants(
            participantsRef.current
        );

        /*
        * Existing user creates
        * the offer.
        */

        await createOffer(
            participant.id,
            participant.name
        );

        break;
        }

      case "offer":
        await handleOffer(
          message
        );
        break;

      case "answer":
        await handleAnswer(
          message
        );
        break;

      case "ice-candidate":
        await handleIceCandidate(
          message
        );
        break;

      case "user-left":
        removeRemoteParticipant(
          message.participant_id
        );
        break;
      
      case "media-state": {
        participantsRef.current =
            participantsRef.current.map((participant) =>
            participant.id === message.participant_id
                ? {
                    ...participant,
                    mic_on: message.mic_on,
                    camera_on: message.camera_on,
                }
                : participant
            );

        setParticipants(
            participantsRef.current
        );

        break;
        }

          case "host-mute": {
            const stream =
            localStreamRef.current;

            if (!stream) {
            break;
            }

            const audioTracks =
            stream.getAudioTracks();

            audioTracks.forEach((track) => {
            track.enabled = false;
            });

            setMicOn(false);

            break;
        }

      case "host-mute-status": {
        const participantId =
          message.participant_id;

        participantsRef.current =
          participantsRef.current.map(
            (participant) =>
              participant.id === participantId
                ? {
                    ...participant,
                    mic_on: false,
                  }
                : participant
          );

        setParticipants(
          participantsRef.current
        );

        break;
      }

      case "host-changed": {
        setIsHost(
          Boolean(message.is_host)
        );

        break;
      }

      case "host-remove": {
        alert(
            "You have been removed from the meeting by the host."
        );

        sessionIdRef.current += 1;

        cleanupMeeting();

        router.push("/");

        break;
        }

      case "chat": {
        const clientMessageId =
          message.clientMessageId;

        const mine =
          typeof clientMessageId ===
            "string" &&
          sentChatMessageIdsRef.current.has(
            clientMessageId
          );

        if (mine) {
          sentChatMessageIdsRef.current.delete(
            clientMessageId
          );
        }

        setMessages((current) => [
          ...current,
          {
            id:
              Date.now() +
              Math.random(),
            name: message.name,
            message: message.message,
            mine,
          },
        ]);

        break;
      }

      default:
        break;
    }
  }

  /*
   * Create peer connection.
   */

  function createPeerConnection(
    remoteId: string,
    remoteName: string
  ) {
    const existing =
      peerConnectionsRef.current[
        remoteId
      ];

    if (existing) {
      return existing;
    }

    const peer =
      new RTCPeerConnection({
        iceServers: [
          {
            urls:
              "stun:stun.l.google.com:19302",
          },
          {
            urls:
              "stun:stun1.l.google.com:19302",
          },
        ],
      });

    peerConnectionsRef.current[
      remoteId
    ] = peer;

    pendingCandidatesRef.current[
      remoteId
    ] = [];

    /*
     * Add local camera + microphone.
     */

    if (localStreamRef.current) {
      localStreamRef.current
        .getTracks()
        .forEach((track) => {
          peer.addTrack(
            track,
            localStreamRef.current!
          );
        });
    }

    /*
     * ICE candidates.
     */

    peer.onicecandidate = (
      event
    ) => {
      if (!event.candidate) {
        return;
      }

      sendSignal({
        type: "ice-candidate",
        to: remoteId,
        candidate:
          event.candidate.toJSON(),
      });
    };

    /*
     * Remote camera/microphone.
     *
     * IMPORTANT:
     * Always update the existing
     * participant instead of pushing
     * another tile.
     */

    peer.ontrack = (event) => {
      const stream =
        event.streams[0];

      if (!stream) {
        return;
      }

      remoteParticipantsRef.current[
        remoteId
      ] = {
        id: remoteId,
        name: remoteName,
        stream,
      };

      setRemoteParticipants(
        Object.values(
          remoteParticipantsRef.current
        )
      );
    };

    peer.onconnectionstatechange =
      () => {
        const state =
          peer.connectionState;

        console.log(
          `Peer ${remoteId}:`,
          state
        );

        if (
          state === "failed" ||
          state === "closed" ||
          state === "disconnected"
        ) {
          removeRemoteParticipant(
            remoteId
          );

          peer.close();

          delete peerConnectionsRef.current[
            remoteId
          ];
        }
      };

    return peer;
  }

  /*
   * Existing participant creates offer.
   */

  async function createOffer(
    remoteId: string,
    remoteName: string
  ) {
    try {
      const peer =
        createPeerConnection(
          remoteId,
          remoteName
        );

      const offer =
        await peer.createOffer();

      await peer.setLocalDescription(
        offer
      );

      sendSignal({
        type: "offer",
        to: remoteId,
        offer,
      });
    } catch (err) {
      console.error(
        "Offer error:",
        err
      );
    }
  }

  /*
   * New participant receives offer.
   */

  async function handleOffer(
    message: any
  ) {
    try {
      const remoteId =
        message.from;

      const participant =
        participantsRef.current.find(
          (item) =>
            item.id === remoteId
        );

      const remoteName =
        participant?.name ||
        "Guest";

      const peer =
        createPeerConnection(
          remoteId,
          remoteName
        );

      await peer.setRemoteDescription(
        new RTCSessionDescription(
          message.offer
        )
      );

      await flushPendingCandidates(
        remoteId
      );

      const answer =
        await peer.createAnswer();

      await peer.setLocalDescription(
        answer
      );

      sendSignal({
        type: "answer",
        to: remoteId,
        answer,
      });
    } catch (err) {
      console.error(
        "Offer handling error:",
        err
      );
    }
  }

  /*
   * Existing participant receives answer.
   */

  async function handleAnswer(
    message: any
  ) {
    try {
      const peer =
        peerConnectionsRef.current[
          message.from
        ];

      if (!peer) {
        return;
      }

      await peer.setRemoteDescription(
        new RTCSessionDescription(
          message.answer
        )
      );

      await flushPendingCandidates(
        message.from
      );
    } catch (err) {
      console.error(
        "Answer handling error:",
        err
      );
    }
  }

  /*
   * ICE candidate.
   */

  async function handleIceCandidate(
    message: any
  ) {
    const remoteId =
      message.from;

    const peer =
      peerConnectionsRef.current[
        remoteId
      ];

    if (
      !peer ||
      !peer.remoteDescription
    ) {
      if (
        !pendingCandidatesRef.current[
          remoteId
        ]
      ) {
        pendingCandidatesRef.current[
          remoteId
        ] = [];
      }

      pendingCandidatesRef.current[
        remoteId
      ].push(
        message.candidate
      );

      return;
    }

    try {
      await peer.addIceCandidate(
        new RTCIceCandidate(
          message.candidate
        )
      );
    } catch (err) {
      console.error(
        "ICE candidate error:",
        err
      );
    }
  }

  async function flushPendingCandidates(
    remoteId: string
  ) {
    const peer =
      peerConnectionsRef.current[
        remoteId
      ];

    const candidates =
      pendingCandidatesRef.current[
        remoteId
      ] || [];

    if (!peer) {
      return;
    }

    for (
      const candidate of candidates
    ) {
      try {
        await peer.addIceCandidate(
          new RTCIceCandidate(
            candidate
          )
        );
      } catch (err) {
        console.error(
          "Queued ICE error:",
          err
        );
      }
    }

    pendingCandidatesRef.current[
      remoteId
    ] = [];
  }

  /*
   * Send signaling data.
   */

  function sendSignal(
    message: any
  ) {
    const socket =
      websocketRef.current;

    if (
      !socket ||
      socket.readyState !==
        WebSocket.OPEN
    ) {
      return;
    }

    socket.send(
      JSON.stringify(message)
    );
  }

  function muteParticipant(
    participantId: string
    ) {
    if (!isHost) {
        return;
    }

    sendSignal({
        type: "host-mute",
        to: participantId,
    });
    }

  function removeParticipant(
        participantId: string
        ) {
        if (!isHost) {
            return;
        }

        sendSignal({
            type: "host-remove",
            to: participantId,
        });
        }

        /*
        * Remove remote participant.
        */

  function removeRemoteParticipant(
    remoteId: string
  ) {
    const peer =
      peerConnectionsRef.current[
        remoteId
      ];

    if (peer) {
      peer.ontrack = null;
      peer.onicecandidate = null;
      peer.onconnectionstatechange =
        null;

      peer.close();
    }

    delete peerConnectionsRef.current[
      remoteId
    ];

    delete pendingCandidatesRef.current[
      remoteId
    ];

    delete remoteParticipantsRef.current[
      remoteId
    ];

    setRemoteParticipants(
      Object.values(
        remoteParticipantsRef.current
      )
    );

    participantsRef.current =
      participantsRef.current.filter(
        (item) =>
          item.id !== remoteId
      );

    setParticipants(
      participantsRef.current
    );
  }

  /*
   * Microphone.
   */

//   function toggleMicrophone() {
//     const stream =
//       localStreamRef.current;

//     if (!stream) {
//       return;
//     }

//     const tracks =
//       stream.getAudioTracks();

//     tracks.forEach((track) => {
//       track.enabled =
//         !track.enabled;
//     });

//     setMicOn(
//       tracks.some(
//         (track) => track.enabled
//       )
//     );
//   }

  function toggleMicrophone() {
    const stream = localStreamRef.current;

    if (!stream) {
        return;
    }

    const nextMicState = !micOn;

    stream.getAudioTracks().forEach((track) => {
        track.enabled = nextMicState;
    });

    setMicOn(nextMicState);

    sendSignal({
        type: "media-state",
        mic_on: nextMicState,
        camera_on: cameraOn,
    });
    }

  /*
   * Camera.
   */

//   function toggleCamera() {
//     const stream =
//       localStreamRef.current;

//     if (!stream) {
//       return;
//     }

//     const tracks =
//       stream.getVideoTracks();

//     tracks.forEach((track) => {
//       track.enabled =
//         !track.enabled;
//     });

//     setCameraOn(
//       tracks.some(
//         (track) => track.enabled
//       )
//     );
//   }

  function toggleCamera() {
    const stream = localStreamRef.current;

    if (!stream) {
        return;
    }

    const nextCameraState = !cameraOn;

    stream.getVideoTracks().forEach((track) => {
        track.enabled = nextCameraState;
    });

    setCameraOn(nextCameraState);

    sendSignal({
        type: "media-state",
        mic_on: micOn,
        camera_on: nextCameraState,
    });
    }

  /*
   * Screen sharing.
   */

  async function toggleScreenShare() {
    if (screenSharing) {
      stopScreenShare();
      return;
    }

    try {
      const stream =
        await navigator.mediaDevices.getDisplayMedia(
          {
            video: true,
            audio: false,
          }
        );

      screenStreamRef.current =
        stream;

      const screenTrack =
        stream.getVideoTracks()[0];

      /*
       * Replace camera track in
       * every peer connection.
       */

      const peerConnections =
        Object.values(
          peerConnectionsRef.current
        );

      for (
        const peer of peerConnections
      ) {
        const sender =
          peer
            .getSenders()
            .find(
              (item) =>
                item.track?.kind ===
                "video"
            );

        if (sender) {
          await sender.replaceTrack(
            screenTrack
          );
        }
      }

      if (videoRef.current) {
        videoRef.current.srcObject =
          stream;
      }

      setScreenSharing(true);

      screenTrack.onended = () => {
        stopScreenShare();
      };
    } catch (err) {
      console.error(
        "Screen share error:",
        err
      );
    }
  }

  async function stopScreenShare() {
    const cameraTrack =
      localStreamRef.current
        ?.getVideoTracks()[0];

    const peerConnections =
      Object.values(
        peerConnectionsRef.current
      );

    for (
      const peer of peerConnections
    ) {
      const sender =
        peer
          .getSenders()
          .find(
            (item) =>
              item.track?.kind ===
              "video"
          );

      if (sender && cameraTrack) {
        await sender.replaceTrack(
          cameraTrack
        );
      }
    }

    if (screenStreamRef.current) {
      screenStreamRef.current
        .getTracks()
        .forEach((track) =>
          track.stop()
        );

      screenStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject =
        localStreamRef.current;
    }

    setScreenSharing(false);
  }

  /*
   * Chat.
   */

  function sendChatMessage() {
    const message =
      chatMessage.trim();

    if (!message) {
      return;
    }

    const clientMessageId =
      `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`;

    sentChatMessageIdsRef.current.add(
      clientMessageId
    );

    sendSignal({
      type: "chat",
      message,
      clientMessageId,
    });

    setChatMessage("");
  }

  /*
   * Copy invitation.
   */

  async function copyMeetingLink() {
    const link =
      `${window.location.origin}/meeting/${meetingId}`;

    await navigator.clipboard.writeText(
      link
    );

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  /*
   * Cleanup.
   */

  function cleanupMeeting() {
    if (
      websocketRef.current
    ) {
      websocketRef.current.close();
      websocketRef.current = null;
    }

    Object.values(
      peerConnectionsRef.current
    ).forEach((peer) => {
      peer.ontrack = null;
      peer.onicecandidate = null;
      peer.onconnectionstatechange =
        null;

      peer.close();
    });

    peerConnectionsRef.current = {};

    pendingCandidatesRef.current = {};

    remoteParticipantsRef.current = {};

    participantsRef.current = [];

    setRemoteParticipants([]);
    setParticipants([]);
    setConnected(false);

    if (
      localStreamRef.current
    ) {
      localStreamRef.current
        .getTracks()
        .forEach((track) =>
          track.stop()
        );

      localStreamRef.current = null;
    }

    if (
      screenStreamRef.current
    ) {
      screenStreamRef.current
        .getTracks()
        .forEach((track) =>
          track.stop()
        );

      screenStreamRef.current = null;
    }
  }

  function leaveMeeting() {
    sessionIdRef.current += 1;

    cleanupMeeting();

    router.push("/");
  }

  if (loading) {
    return (
      <div className="meeting-loading">
        <div className="meeting-loading-logo">
          zoom
        </div>

        <div>
          Joining meeting...
        </div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="meeting-error-page">
        <div className="meeting-error-card">
          <div className="meeting-error-icon">
            <Info size={30} />
          </div>

          <h1>
            Meeting unavailable
          </h1>

          <p>
            {error ||
              "This meeting could not be found."}
          </p>

          <button
            className="meeting-back-home"
            onClick={() =>
              router.push("/")
            }
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="meeting-room">

      {/* TOP BAR */}

      <header className="meeting-topbar">

        <div className="meeting-top-left">

          <div className="meeting-zoom-logo">
            zoom
          </div>

          <div className="meeting-title">
            {meeting.title}
          </div>

          <button
            className="meeting-info-button"
            onClick={() =>
              setShowMeetingInfo(
                !showMeetingInfo
              )
            }
          >
            <Info size={17} />
          </button>

        </div>

        <div className="meeting-top-right">

          <div className="connection-status">
            <span
              className={
                connected
                  ? "connection-dot connected"
                  : "connection-dot"
              }
            />

            {connected
              ? "Connected"
              : "Connecting..."}
          </div>

          <button
            className="top-meeting-button"
            onClick={() => {
              setShowParticipants(
                !showParticipants
              );

              setShowChat(false);
            }}
          >
            <Users size={17} />

            Participants
          </button>

          <button
            className="top-meeting-button"
            onClick={
              copyMeetingLink
            }
          >
            <Copy size={16} />

            {copied
              ? "Copied"
              : "Invite"}
          </button>

        </div>

      </header>

      {/* BODY */}

      <main className="meeting-main">

        <section className="video-area">

          <div
            className={`video-grid ${
              remoteParticipants.length +
                1 >
              2
                ? "many-participants"
                : ""
            }`}
          >

            {/* LOCAL */}

            <div
              className={`video-tile ${
                cameraOn
                  ? ""
                  : "camera-off"
              }`}
            >

              {cameraOn ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="local-video"
                />
              ) : (
                <div className="avatar-video">

                  <div className="large-meeting-avatar">
                    {displayName
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                </div>
              )}

              <div className="participant-name">

                <span>
                  {displayName}
                  {" "}(
                  You
                  )
                </span>

                {!micOn && (
                  <MicOff size={16} />
                )}

              </div>

            </div>

            {/* REMOTE USERS */}

            {remoteParticipants.map(
                (participant) => {
                    const status =
                    participants.find(
                        (item) =>
                        item.id === participant.id
                    );

                    return (
                    <RemoteVideo
                        key={participant.id}
                        participant={participant}
                        micOn={
                        status?.mic_on !== false
                        }
                        cameraOn={
                        status?.camera_on !== false
                        }
                    />
                    );
                }
                )}

            {/* WAITING TILE */}

            {remoteParticipants.length ===
              0 && (
              <div className="video-tile participant-placeholder">

                <div className="avatar-video">

                  <div className="large-meeting-avatar secondary">
                    G
                  </div>

                </div>

                <div className="participant-name">
                  Waiting for others...
                </div>

              </div>
            )}

          </div>

        </section>

        {/* PARTICIPANTS */}

        {showParticipants && (
          <aside className="meeting-side-panel">

            <div className="side-panel-header">

              <h2>
                Participants
              </h2>

              <button
                onClick={() =>
                  setShowParticipants(
                    false
                  )
                }
              >
                <X size={19} />
              </button>

            </div>

            <div className="participant-count">
              {participants.length +
                1}{" "}
              Participants
            </div>

            <div className="participant-list">

              <div className="participant-row">

                <div className="participant-avatar">
                  {displayName
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="participant-row-info">

                  <strong>
                    {displayName}
                  </strong>

                  <span>
                    You
                  </span>

                </div>

                {micOn ? (
                  <Mic size={17} />
                ) : (
                  <MicOff size={17} />
                )}

              </div>

              {participants.map(
                (participant) => (
                  <div
                    className="participant-row"
                    key={
                      participant.id
                    }
                  >

                    <div className="participant-avatar">
                      {participant.name
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="participant-row-info">

                      <strong>
                        {participant.name}
                        {participant.is_host && (
                            <span className="host-badge">
                            Host
                            </span>
                        )}
                        </strong>

                        <span>
                        {participant.is_host
                            ? "Host"
                            : "Participant"}
                        </span>

                    </div>

                    <div className="participant-actions">

                        <Mic size={17} />

                        {isHost && !participant.is_host && (
                            <>
                            <button
                                className="participant-action-button"
                                onClick={() =>
                                muteParticipant(
                                    participant.id
                                )
                                }
                                title="Mute participant"
                            >
                                <MicOff size={15} />
                            </button>

                            <button
                                className="participant-action-button remove"
                                onClick={() =>
                                removeParticipant(
                                    participant.id
                                )
                                }
                                title="Remove participant"
                            >
                                <X size={15} />
                            </button>
                            </>
                        )}

                        </div>

                  </div>
                )
              )}

            </div>

          </aside>
        )}

        {/* CHAT */}

        {showChat && (
          <aside className="meeting-side-panel">

            <div className="side-panel-header">

              <h2>
                Chat
              </h2>

              <button
                onClick={() =>
                  setShowChat(false)
                }
              >
                <X size={19} />
              </button>

            </div>

            <div className="chat-messages">

              {messages.map(
                (message) => (
                  <div
                    key={
                      message.id
                    }
                    className={`chat-message ${
                      message.mine
                        ? "mine"
                        : ""
                    }`}
                  >

                    <span className="chat-name">
                      {message.name}
                    </span>

                    <div className="chat-bubble">
                      {message.message}
                    </div>

                  </div>
                )
              )}

            </div>

            <div className="chat-input-area">

              <input
                type="text"
                placeholder="Type a message..."
                value={
                  chatMessage
                }
                onChange={(event) =>
                  setChatMessage(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key ===
                    "Enter"
                  ) {
                    sendChatMessage();
                  }
                }}
              />

              <button
                onClick={
                  sendChatMessage
                }
              >
                <Send size={17} />
              </button>

            </div>

          </aside>
        )}

      </main>

      {/* CONTROLS */}

      <footer className="meeting-controls">

        <div className="control-group">

          <div className="meeting-control-wrapper">

            <button
              className={`meeting-control ${
                !micOn
                  ? "control-off"
                  : ""
              }`}
              onClick={
                toggleMicrophone
              }
            >
              {micOn ? (
                <Mic size={22} />
              ) : (
                <MicOff size={22} />
              )}

              <span>
                {micOn
                  ? "Mute"
                  : "Unmute"}
              </span>
            </button>

            <button className="control-chevron">
              <ChevronUp size={14} />
            </button>

          </div>

          <div className="meeting-control-wrapper">

            <button
              className={`meeting-control ${
                !cameraOn
                  ? "control-off"
                  : ""
              }`}
              onClick={
                toggleCamera
              }
            >
              {cameraOn ? (
                <Video size={22} />
              ) : (
                <VideoOff size={22} />
              )}

              <span>
                {cameraOn
                  ? "Stop Video"
                  : "Start Video"}
              </span>
            </button>

            <button className="control-chevron">
              <ChevronUp size={14} />
            </button>

          </div>

        </div>

        <div className="control-group center-controls">

          <button
            className={`meeting-control ${
              showParticipants
                ? "control-active"
                : ""
            }`}
            onClick={() => {
              setShowParticipants(
                !showParticipants
              );

              setShowChat(false);
            }}
          >
            <Users size={22} />

            <span>
              Participants
            </span>
          </button>

          <button
            className={`meeting-control ${
              showChat
                ? "control-active"
                : ""
            }`}
            onClick={() => {
              setShowChat(!showChat);

              setShowParticipants(
                false
              );
            }}
          >
            <MessageSquare size={22} />

            <span>
              Chat
            </span>
          </button>

          <button
            className={`meeting-control ${
              screenSharing
                ? "control-active"
                : ""
            }`}
            onClick={
              toggleScreenShare
            }
          >
            <MonitorUp size={22} />

            <span>
              {screenSharing
                ? "Stop Share"
                : "Share Screen"}
            </span>
          </button>

          <button className="meeting-control">
            <MoreHorizontal size={22} />

            <span>
              More
            </span>
          </button>

        </div>

        <div className="control-group right-controls">

          <button
            className="leave-button"
            onClick={
              leaveMeeting
            }
          >
            <PhoneOff size={21} />

            <span>
              Leave
            </span>
          </button>

        </div>

      </footer>

      {/* INFO */}

      {showMeetingInfo && (
        <div className="meeting-info-popup">

          <div className="info-popup-header">

            <h3>
              Meeting Information
            </h3>

            <button
              onClick={() =>
                setShowMeetingInfo(
                  false
                )
              }
            >
              <X size={18} />
            </button>

          </div>

          <div className="info-popup-row">
            <span>
              Meeting ID
            </span>

            <strong>
              {meeting.meeting_id}
            </strong>
          </div>

          <div className="info-popup-row">
            <span>
              Participants
            </span>

            <strong>
              {participants.length +
                1}
            </strong>
          </div>

          <div className="info-popup-row">
            <span>
              Duration
            </span>

            <strong>
              {meeting.duration} minutes
            </strong>
          </div>

          <button
            className="copy-link-popup"
            onClick={
              copyMeetingLink
            }
          >
            <Copy size={17} />

            {copied
              ? "Copied"
              : "Copy Invitation"}
          </button>

        </div>
      )}

    </div>
  );
}

/*
 * Remote video component.
 */

// function RemoteVideo({
//   participant,
// }: {
//   participant: RemoteParticipant;
// }) {
//   const videoRef =
//     useRef<HTMLVideoElement | null>(
//       null
//     );

function RemoteVideo({
  participant,
  micOn,
  cameraOn,
}: {
  participant: RemoteParticipant;
  micOn: boolean;
  cameraOn: boolean;
}) {
  const videoRef =
    useRef<HTMLVideoElement | null>(
      null
    );

  useEffect(() => {
    if (!videoRef.current) {
      return;
    }

    videoRef.current.srcObject =
      participant.stream;
  }, [participant.stream]);

  return (
    <div
      className={`video-tile ${
        cameraOn
          ? ""
          : "camera-off"
      }`}
    >
      {cameraOn ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="remote-video"
        />
      ) : (
        <div className="avatar-video">
          <div className="large-meeting-avatar secondary">
            {participant.name
              .charAt(0)
              .toUpperCase()}
          </div>
        </div>
      )}

      <div className="participant-name">
        <span>
          {participant.name}
        </span>

        {!micOn && (
          <MicOff size={16} />
        )}
      </div>
    </div>
  );
}

export default function MeetingRoomPage() {
  return (
    <Suspense
      fallback={
        <div className="meeting-loading">
          <div className="meeting-loading-logo">
            zoom
          </div>

          <div>
            Joining meeting...
          </div>
        </div>
      }
    >
      <MeetingRoomContent />
    </Suspense>
  );
}