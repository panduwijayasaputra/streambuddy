import { ChatService, ChatMessage } from "./chat.service";
import { ChatMessageEntity } from "./chat-message.entity";
import { MentionService } from "../mention/mention.service";
import { QAEngineService } from "../qa/qa-engine.service";

const mockRepo = {
  create: jest.fn((data) => data),
  save: jest.fn(),
};

const mockMentionService = {
  isMentioned: jest.fn((msg) => /@streambuddy|@buddy/i.test(msg)),
};

const mockQAEngine = {
  getResponse: jest.fn(async () => "AI response"),
};

describe("ChatService", () => {
  let service: ChatService;

  beforeEach(() => {
    jest.clearAllMocks();
    // @ts-ignore
    service = new ChatService(mockRepo, mockMentionService, mockQAEngine);
  });

  it("ignores empty messages", async () => {
    const msg: ChatMessage = {
      userId: "1",
      message: "",
      platform: "youtube",
      timestamp: new Date(),
    };
    await service.handleWebSocketMessage(msg);
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it("ignores repeated messages from the same user", async () => {
    const msg: ChatMessage = {
      userId: "1",
      message: "@StreamBuddy hi",
      platform: "youtube",
      timestamp: new Date(),
    };
    await service.handleWebSocketMessage(msg);
    await service.handleWebSocketMessage(msg);
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });

  it("ignores messages not mentioning StreamBuddy", async () => {
    const msg: ChatMessage = {
      userId: "1",
      message: "hello",
      platform: "youtube",
      timestamp: new Date(),
    };
    await service.handleWebSocketMessage(msg);
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it("processes messages mentioning @StreamBuddy", async () => {
    const msg: ChatMessage = {
      userId: "1",
      message: "@StreamBuddy help",
      platform: "youtube",
      timestamp: new Date(),
    };
    await service.handleWebSocketMessage(msg);
    expect(mockRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "1",
        message: "@StreamBuddy help",
        platform: "youtube",
      })
    );
  });

  it("processes messages mentioning @buddy", async () => {
    const msg: ChatMessage = {
      userId: "2",
      message: "hi @buddy",
      platform: "twitch",
      timestamp: new Date(),
    };
    await service.handleWebSocketMessage(msg);
    expect(mockRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "2",
        message: "hi @buddy",
        platform: "twitch",
      })
    );
  });
});
