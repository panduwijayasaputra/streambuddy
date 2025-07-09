import "@testing-library/jest-dom";
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { StreamBuddyOverlay } from "./StreamBuddyOverlay";

// Mock WebSocket
const mockWebSocket = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  send: jest.fn(),
  close: jest.fn(),
  readyState: 1,
};

global.WebSocket = jest.fn(() => mockWebSocket as any);

describe("StreamBuddyOverlay", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.WebSocket as jest.Mock).mockImplementation(() => mockWebSocket);
  });

  it("renders with default props", () => {
    render(<StreamBuddyOverlay streamId="test-stream" />);

    expect(screen.getByAltText("StreamBuddy")).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      "/api/avatar/default"
    );
  });

  it("renders with custom buddy name", () => {
    render(
      <StreamBuddyOverlay streamId="test-stream" buddyName="CustomBuddy" />
    );

    expect(screen.getByAltText("CustomBuddy")).toBeInTheDocument();
  });

  it("renders with custom avatar URL", () => {
    render(
      <StreamBuddyOverlay
        streamId="test-stream"
        avatarUrl="https://example.com/avatar.jpg"
      />
    );

    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      "https://example.com/avatar.jpg"
    );
  });

  it("applies correct theme classes", () => {
    const { rerender } = render(
      <StreamBuddyOverlay streamId="test-stream" theme="light" />
    );

    const overlay = screen.getByRole("img").closest(".stream-buddy-overlay");
    expect(overlay).toHaveClass("theme-light");

    rerender(<StreamBuddyOverlay streamId="test-stream" theme="dark" />);
    expect(overlay).toHaveClass("theme-dark");
  });

  it("applies correct position classes", () => {
    const { rerender } = render(
      <StreamBuddyOverlay streamId="test-stream" position="top-left" />
    );

    const overlay = screen.getByRole("img").closest(".stream-buddy-overlay");
    expect(overlay).toHaveClass("overlay-top-left");

    rerender(
      <StreamBuddyOverlay streamId="test-stream" position="bottom-right" />
    );
    expect(overlay).toHaveClass("overlay-bottom-right");
  });

  it("connects to WebSocket with correct URL", () => {
    render(<StreamBuddyOverlay streamId="test-stream" />);

    expect(global.WebSocket).toHaveBeenCalledWith(
      "ws://localhost:3001/chat/test-stream"
    );
  });

  it("displays chat bubble when message is received", async () => {
    render(<StreamBuddyOverlay streamId="test-stream" />);

    // Simulate WebSocket message
    const mockMessage = {
      type: "mention",
      message: "Hello @StreamBuddy!",
    };

    // Trigger the onmessage handler
    const wsInstance = (global.WebSocket as jest.Mock).mock.results[0].value;
    wsInstance.onmessage({ data: JSON.stringify(mockMessage) });

    await waitFor(() => {
      expect(screen.getByText("Hello @StreamBuddy!")).toBeInTheDocument();
    });
  });

  it("applies correct message type classes", async () => {
    render(<StreamBuddyOverlay streamId="test-stream" />);

    const wsInstance = (global.WebSocket as jest.Mock).mock.results[0].value;

    // Test mention message
    wsInstance.onmessage({
      data: JSON.stringify({ type: "mention", message: "Mention test" }),
    });

    await waitFor(() => {
      const bubble = screen.getByText("Mention test").closest(".chat-bubble");
      expect(bubble).toHaveClass("message-mention");
    });

    // Test response message
    wsInstance.onmessage({
      data: JSON.stringify({ type: "response", message: "Response test" }),
    });

    await waitFor(() => {
      const bubble = screen.getByText("Response test").closest(".chat-bubble");
      expect(bubble).toHaveClass("message-response");
    });

    // Test QA message
    wsInstance.onmessage({
      data: JSON.stringify({ type: "qa", message: "QA test" }),
    });

    await waitFor(() => {
      const bubble = screen.getByText("QA test").closest(".chat-bubble");
      expect(bubble).toHaveClass("message-qa");
    });
  });

  it("displays message history", async () => {
    render(<StreamBuddyOverlay streamId="test-stream" />);

    const wsInstance = (global.WebSocket as jest.Mock).mock.results[0].value;

    // Send multiple messages
    wsInstance.onmessage({
      data: JSON.stringify({ type: "mention", message: "First message" }),
    });

    wsInstance.onmessage({
      data: JSON.stringify({ type: "response", message: "Second message" }),
    });

    await waitFor(() => {
      expect(screen.getByText("First message")).toBeInTheDocument();
      expect(screen.getByText("Second message")).toBeInTheDocument();
    });
  });

  it("handles WebSocket errors gracefully", () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(<StreamBuddyOverlay streamId="test-stream" />);

    const wsInstance = (global.WebSocket as jest.Mock).mock.results[0].value;
    wsInstance.onerror(new Error("WebSocket error"));

    expect(consoleSpy).toHaveBeenCalledWith(
      "WebSocket error:",
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it("cleans up WebSocket connection on unmount", () => {
    const { unmount } = render(<StreamBuddyOverlay streamId="test-stream" />);

    unmount();

    expect(mockWebSocket.close).toHaveBeenCalled();
  });

  it("shows timestamp in chat bubble", async () => {
    render(<StreamBuddyOverlay streamId="test-stream" />);

    const wsInstance = (global.WebSocket as jest.Mock).mock.results[0].value;
    wsInstance.onmessage({
      data: JSON.stringify({ type: "mention", message: "Test message" }),
    });

    await waitFor(() => {
      const timeElement = screen.getByText(/\d{1,2}:\d{2}:\d{2}/);
      expect(timeElement).toBeInTheDocument();
    });
  });

  it("truncates long messages in history", async () => {
    render(<StreamBuddyOverlay streamId="test-stream" />);

    const wsInstance = (global.WebSocket as jest.Mock).mock.results[0].value;
    wsInstance.onmessage({
      data: JSON.stringify({
        type: "mention",
        message:
          "This is a very long message that should be truncated in the history view",
      }),
    });

    await waitFor(() => {
      expect(
        screen.getByText("This is a very long message that should...")
      ).toBeInTheDocument();
    });
  });
});
