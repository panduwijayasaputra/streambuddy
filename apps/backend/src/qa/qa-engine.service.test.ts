import { QAEngineService } from "./qa-engine.service";

describe("QAEngineService", () => {
  let service: QAEngineService;

  beforeEach(() => {
    service = new QAEngineService();
  });

  it("matches Mobile Legends build template and extracts hero", () => {
    const result = service.getTemplateResponse(
      "mobile_legends",
      "build Lancelot"
    );
    expect(result).toContain("Build paling GG buat Lancelot");
    expect(result).toContain("Gas pol");
  });

  it("matches Mobile Legends counter template and extracts hero", () => {
    const result = service.getTemplateResponse(
      "mobile_legends",
      "counter Gusion"
    );
    expect(result).toContain("Waduh, Gusion?");
    expect(result).toContain("auto win");
  });

  it("matches Mobile Legends meta hero template", () => {
    const result = service.getTemplateResponse("mobile_legends", "meta hero");
    expect(result).toContain("Meta hero MLBB versi StreamBuddy");
    expect(result).toContain("ga di-report");
  });

  it("matches Free Fire senjata terbaik template", () => {
    const result = service.getTemplateResponse("free_fire", "senjata terbaik");
    expect(result).toContain("Senjata paling sakit di FF");
    expect(result).toContain("auto booyah");
  });

  it("matches Valorant agent mudah template", () => {
    const result = service.getTemplateResponse("valorant", "agent mudah");
    expect(result).toContain("Baru main Valorant?");
    expect(result).toContain("ga ribet");
  });

  it("answers stream duration with context", () => {
    const now = new Date();
    const start = new Date(now.getTime() - 2 * 3600000 - 15 * 60000); // 2h 15m ago
    const result = service.getTemplateResponse(
      "mobile_legends",
      "sudah berapa lama streamingnya?",
      { streamStart: start }
    );
    expect(result).toMatch(/2 jam 15 menit/);
    expect(result).toContain("ga kerasa ya");
  });

  it("answers current game with context", () => {
    const result = service.getTemplateResponse(
      "mobile_legends",
      "lagi main game apa?",
      { currentGame: "Mobile Legends" }
    );
    expect(result).toContain("push rank di Mobile Legends");
    expect(result).toContain("join kuy");
  });

  it("answers viewer count with context", () => {
    const result = service.getTemplateResponse(
      "mobile_legends",
      "berapa penonton sekarang?",
      { viewerCount: 1234 }
    );
    expect(result).toContain("Viewers sekarang: 1234 orang");
    expect(result).toContain("rame banget");
  });

  it("returns fallback for missing context", () => {
    const duration = service.getTemplateResponse(
      "mobile_legends",
      "sudah berapa lama streamingnya?"
    );
    expect(duration).toContain("Belum tau nih, streamer mulai jam berapa");
    const game = service.getTemplateResponse(
      "mobile_legends",
      "lagi main game apa?"
    );
    expect(game).toContain("Belum tau nih, streamer lagi main apa");
    const viewers = service.getTemplateResponse(
      "mobile_legends",
      "berapa penonton sekarang?"
    );
    expect(viewers).toContain("Belum tau jumlah viewers-nya");
  });

  it("returns null for unmatched questions", () => {
    const result = service.getTemplateResponse(
      "mobile_legends",
      "siapa streamer favoritmu?"
    );
    expect(result).toBeNull();
  });
});
