export interface ChatMessage {
  id: string;
  userId: string;
  message: string;
  platform: string;
  streamId?: string;
  processed: boolean;
  aiResponse?: string;
  createdAt: Date;
}

export interface ChatFilter {
  spam: boolean;
  inappropriate: boolean;
  gamingRelevant: boolean;
  priority: number;
}

export interface ChatResponse {
  messageId: string;
  response: string;
  responseType: "template" | "ai";
  gameContext?: string;
  cost?: number;
}
