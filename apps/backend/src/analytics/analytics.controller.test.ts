import { Test, TestingModule } from "@nestjs/testing";
import { AnalyticsController } from "./analytics.controller";
import { AnalyticsService } from "./analytics.service";
import { BadRequestException } from "@nestjs/common";

describe("AnalyticsController", () => {
  let controller: AnalyticsController;
  let service: AnalyticsService;

  const mockService = {
    getSnapshot: jest.fn(),
    getTrends: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [{ provide: AnalyticsService, useValue: mockService }],
    }).compile();
    controller = module.get<AnalyticsController>(AnalyticsController);
    service = module.get<AnalyticsService>(AnalyticsService);
    jest.clearAllMocks();
  });

  describe("getSnapshot", () => {
    it("should call service with valid params", async () => {
      mockService.getSnapshot.mockResolvedValue({ totalMessages: 1 });
      const result = await controller.getSnapshot("abc123", "1h");
      expect(service.getSnapshot).toHaveBeenCalledWith("abc123", "1h");
      expect(result).toEqual({ totalMessages: 1 });
    });
    it("should throw BadRequest for invalid streamId", async () => {
      await expect(controller.getSnapshot("", "1h")).rejects.toThrow(
        BadRequestException
      );
      await expect(controller.getSnapshot("a", "1h")).rejects.toThrow(
        BadRequestException
      );
    });
    it("should throw BadRequest for invalid interval", async () => {
      await expect(controller.getSnapshot("abc123", "bad")).rejects.toThrow(
        BadRequestException
      );
      await expect(controller.getSnapshot("abc123", "1d")).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe("getTrends", () => {
    it("should call service with valid params", async () => {
      mockService.getTrends.mockResolvedValue([{ timestamp: "now" }]);
      const result = await controller.getTrends("abc123", "24h");
      expect(service.getTrends).toHaveBeenCalledWith("abc123", "24h");
      expect(result).toEqual([{ timestamp: "now" }]);
    });
    it("should throw BadRequest for invalid streamId", async () => {
      await expect(controller.getTrends("", "24h")).rejects.toThrow(
        BadRequestException
      );
      await expect(controller.getTrends("a", "24h")).rejects.toThrow(
        BadRequestException
      );
    });
    it("should throw BadRequest for invalid range", async () => {
      await expect(controller.getTrends("abc123", "bad")).rejects.toThrow(
        BadRequestException
      );
      await expect(controller.getTrends("abc123", "1d")).rejects.toThrow(
        BadRequestException
      );
    });
  });
});
