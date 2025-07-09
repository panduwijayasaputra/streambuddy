"use client";
import React, { useState, useEffect } from "react";
import "./StreamBuddyOverlay.css";

interface StreamBuddyOverlayProps {
  streamId: string;
  buddyName?: string;
  avatarUrl?: string;
  theme?: "light" | "dark";
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

interface ChatMessage {
  id: string;
  message: string;
  timestamp: Date;
  type: "mention" | "response" | "qa";
}

export const StreamBuddyOverlay: React.FC<StreamBuddyOverlayProps> = ({
  streamId,
  buddyName = "StreamBuddy",
  avatarUrl = "/api/avatar/default",
  theme = "dark",
  position = "bottom-right",
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<ChatMessage | null>(
    null
  );

  useEffect(() => {
    // Connect to WebSocket for real-time chat and Q&A responses
    const ws = new WebSocket(`ws://localhost:3001/chat/${streamId}`);

    ws.onopen = () => {
      console.log("Connected to StreamBuddy WebSocket");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Handle different message types from backend
        if (
          data.type === "mention" ||
          data.type === "response" ||
          data.type === "qa"
        ) {
          const newMessage: ChatMessage = {
            id: Date.now().toString(),
            message: data.message,
            timestamp: new Date(),
            type: data.type,
          };

          setMessages((prev) => [...prev.slice(-2), newMessage]); // Keep last 3 messages
          setCurrentMessage(newMessage);
          setIsVisible(true);

          // Hide message after 5 seconds
          setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => setCurrentMessage(null), 500); // Clear after fade out
          }, 5000);
        }

        // Handle mention detection
        if (data.type === "mention_detected") {
          console.log("Mention detected:", data);
        }

        // Handle Q&A responses
        if (data.type === "qa_response") {
          const qaMessage: ChatMessage = {
            id: Date.now().toString(),
            message: data.response,
            timestamp: new Date(),
            type: "qa",
          };

          setMessages((prev) => [...prev.slice(-2), qaMessage]);
          setCurrentMessage(qaMessage);
          setIsVisible(true);

          setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => setCurrentMessage(null), 500);
          }, 5000);
        }

        // Handle chat responses
        if (data.type === "chat_response") {
          const responseMessage: ChatMessage = {
            id: Date.now().toString(),
            message: data.response,
            timestamp: new Date(),
            type: "response",
          };

          setMessages((prev) => [...prev.slice(-2), responseMessage]);
          setCurrentMessage(responseMessage);
          setIsVisible(true);

          setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => setCurrentMessage(null), 500);
          }, 5000);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      ws.close();
    };
  }, [streamId]);

  const getPositionClasses = () => {
    switch (position) {
      case "top-left":
        return "overlay-top-left";
      case "top-right":
        return "overlay-top-right";
      case "bottom-left":
        return "overlay-bottom-left";
      case "bottom-right":
      default:
        return "overlay-bottom-right";
    }
  };

  const getThemeClasses = () => {
    return theme === "light" ? "theme-light" : "theme-dark";
  };

  const getMessageTypeClass = (type: string) => {
    switch (type) {
      case "mention":
        return "message-mention";
      case "response":
        return "message-response";
      case "qa":
        return "message-qa";
      default:
        return "message-default";
    }
  };

  return (
    <div
      className={`stream-buddy-overlay ${getPositionClasses()} ${getThemeClasses()}`}
    >
      {/* Avatar */}
      <div className="buddy-avatar">
        <img src={avatarUrl} alt={buddyName} className="avatar-image" />
        <div className="avatar-status-indicator"></div>
      </div>

      {/* Chat Bubble */}
      {currentMessage && isVisible && (
        <div
          className={`chat-bubble ${getMessageTypeClass(currentMessage.type)}`}
        >
          <div className="bubble-header">
            <span className="buddy-name">{buddyName}</span>
            <span className="message-time">
              {currentMessage.timestamp.toLocaleTimeString()}
            </span>
          </div>
          <div className="bubble-content">{currentMessage.message}</div>
          <div className="bubble-arrow"></div>
        </div>
      )}

      {/* Message History (small preview) */}
      <div className="message-history">
        {messages.slice(-2).map((msg) => (
          <div
            key={msg.id}
            className={`history-item ${getMessageTypeClass(msg.type)}`}
          >
            <span className="history-time">
              {msg.timestamp.toLocaleTimeString()}
            </span>
            <span className="history-message">
              {msg.message.length > 30
                ? `${msg.message.substring(0, 30)}...`
                : msg.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
