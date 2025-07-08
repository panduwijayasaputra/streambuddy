import { QAEngineService } from "./qa-engine.service";
import dotenv from "dotenv";
dotenv.config();

describe("QAEngineService OpenAI fallback", () => {
  let service: QAEngineService;

  beforeEach(() => {
    service = new QAEngineService();
  });

  it("returns an OpenAI response for unmatched questions", async () => {
    const question = "Apa pendapatmu tentang streamer X?";
    const response = await service.getResponse("mobile_legends", question);
    expect(typeof response).toBe("string");
    expect(response.length).toBeGreaterThan(0);
    // Optionally, print the response for manual inspection
    console.log("OpenAI fallback response:", response);
  });
});
