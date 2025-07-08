import { ChatService, ChatMessage } from "./chat.service";
import { MentionService } from "../mention/mention.service";
import { QAEngineService } from "../qa/qa-engine.service";

const mockRepo = {
  create: jest.fn((data) => data),
  save: jest.fn(async (data) => data),
};

const mockQAEngine = {
  getResponse: jest.fn(async (_game, _question) => "Mocked AI response"),
};

describe("ChatService integration", () => {
  let service: ChatService;
  let mention: MentionService;

  beforeEach(() => {
    jest.clearAllMocks();
    mention = new MentionService();
    // @ts-ignore
    service = new ChatService(mockRepo, mention, mockQAEngine);
  });

  it("processes a relevant chat message and saves AI response", async () => {
    const msg: ChatMessage = {
      userId: "user1",
      message: "Hi @StreamBuddy, build Lancelot",
      platform: "youtube",
      timestamp: new Date(),
      game: "mobile_legends",
    };
    await service.handleWebSocketMessage(msg);
    expect(mockQAEngine.getResponse).toHaveBeenCalledWith(
      "mobile_legends",
      msg.message
    );
    expect(mockRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user1",
        message: msg.message,
        aiResponse: "Mocked AI response",
        processed: true,
      })
    );
  });

  it("ignores messages not mentioning StreamBuddy", async () => {
    const msg: ChatMessage = {
      userId: "user2",
      message: "Hello world",
      platform: "youtube",
      timestamp: new Date(),
      game: "mobile_legends",
    };
    await service.handleWebSocketMessage(msg);
    expect(mockQAEngine.getResponse).not.toHaveBeenCalled();
    expect(mockRepo.save).not.toHaveBeenCalled();
  });
});
