// Validation utilities for chat messages and responses
import type { ChatMessage, ChatResponse } from "../types/chat";

// Placeholder validation functions
export const validateChatMessage = (data: any): ChatMessage => {
  return data as ChatMessage;
};

export const validateChatResponse = (data: any): ChatResponse => {
  return data as ChatResponse;
};

// Validation schemas (placeholder for zod)
export const chatMessageSchema = {
  validate: (data: any): ChatMessage => data as ChatMessage,
  parse: (data: any): ChatMessage => data as ChatMessage,
};

export const chatResponseSchema = {
  validate: (data: any): ChatResponse => data as ChatResponse,
  parse: (data: any): ChatResponse => data as ChatResponse,
};
