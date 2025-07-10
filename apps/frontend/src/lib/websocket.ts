import config from "./env";

// WebSocket event types
export interface WebSocketMessage {
  type: string;
  data?: any;
  timestamp?: number;
}

export interface ChatMessage {
  id: string;
  platform: "twitch" | "youtube" | "discord";
  username: string;
  message: string;
  timestamp: number;
  userId?: string;
  badges?: string[];
  emotes?: Record<string, string[]>;
}

export interface StreamEvent {
  type: "follow" | "subscription" | "donation" | "raid" | "host";
  platform: "twitch" | "youtube" | "discord";
  data: any;
  timestamp: number;
}

export interface AiResponse {
  id: string;
  originalMessage: string;
  response: string;
  confidence: number;
  timestamp: number;
}

// WebSocket connection states
export type ConnectionState =
  | "connecting"
  | "connected"
  | "disconnected"
  | "reconnecting";

// WebSocket client class
export class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageQueue: WebSocketMessage[] = [];
  private eventListeners: Map<string, Set<(data: any) => void>> = new Map();
  private connectionState: ConnectionState = "disconnected";

  constructor() {
    this.connect();
  }

  // Connect to WebSocket server
  private connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.connectionState = "connecting";

    try {
      this.ws = new WebSocket(config.wsUrl);
      this.setupEventHandlers();
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      this.handleReconnect();
    }
  }

  // Setup WebSocket event handlers
  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log("WebSocket connected");
      this.connectionState = "connected";
      this.reconnectAttempts = 0;
      this.flushMessageQueue();
      this.emit("connected", {});
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    this.ws.onclose = (event) => {
      console.log("WebSocket disconnected:", event.code, event.reason);
      this.connectionState = "disconnected";
      this.emit("disconnected", { code: event.code, reason: event.reason });

      if (!event.wasClean) {
        this.handleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      this.emit("error", error);
    };
  }

  // Handle incoming messages
  private handleMessage(message: WebSocketMessage): void {
    const { type, data } = message;

    // Emit the message to all listeners
    this.emit(type, data);

    // Handle specific message types
    switch (type) {
      case "chat_message":
        this.emit("chat", data as ChatMessage);
        break;
      case "stream_event":
        this.emit("stream_event", data as StreamEvent);
        break;
      case "ai_response":
        this.emit("ai_response", data as AiResponse);
        break;
      case "ping":
        this.send({ type: "pong", timestamp: Date.now() });
        break;
      default:
        // Unknown message type, just emit it
        break;
    }
  }

  // Send message to server
  send(message: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Queue message for later if not connected
      this.messageQueue.push(message);
    }
  }

  // Flush queued messages
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }
  }

  // Handle reconnection
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached");
      this.emit("max_reconnect_attempts", {});
      return;
    }

    this.connectionState = "reconnecting";
    this.reconnectAttempts++;

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      console.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );
      this.connect();
    }, delay);
  }

  // Event listener management
  on(event: string, callback: (data: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  off(event: string, callback: (data: any) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  // Emit event to all listeners
  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(
            `Error in WebSocket event listener for ${event}:`,
            error
          );
        }
      });
    }
  }

  // Get current connection state
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  // Disconnect WebSocket
  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, "Client disconnect");
      this.ws = null;
    }
    this.connectionState = "disconnected";
  }

  // Subscribe to chat messages
  subscribeToChat(platform: "twitch" | "youtube" | "discord"): void {
    this.send({
      type: "subscribe_chat",
      data: { platform },
    });
  }

  // Unsubscribe from chat messages
  unsubscribeFromChat(platform: "twitch" | "youtube" | "discord"): void {
    this.send({
      type: "unsubscribe_chat",
      data: { platform },
    });
  }

  // Enable AI responses
  enableAiResponses(): void {
    this.send({
      type: "enable_ai_responses",
      data: { enabled: true },
    });
  }

  // Disable AI responses
  disableAiResponses(): void {
    this.send({
      type: "enable_ai_responses",
      data: { enabled: false },
    });
  }
}

// Create and export WebSocket client instance
export const wsClient = new WebSocketClient();

// Export convenience methods
export const ws = {
  on: (event: string, callback: (data: any) => void) =>
    wsClient.on(event, callback),
  off: (event: string, callback: (data: any) => void) =>
    wsClient.off(event, callback),
  send: (message: WebSocketMessage) => wsClient.send(message),
  getConnectionState: () => wsClient.getConnectionState(),
  disconnect: () => wsClient.disconnect(),
  subscribeToChat: (platform: "twitch" | "youtube" | "discord") =>
    wsClient.subscribeToChat(platform),
  unsubscribeFromChat: (platform: "twitch" | "youtube" | "discord") =>
    wsClient.unsubscribeFromChat(platform),
  enableAiResponses: () => wsClient.enableAiResponses(),
  disableAiResponses: () => wsClient.disableAiResponses(),
};

export default ws;
