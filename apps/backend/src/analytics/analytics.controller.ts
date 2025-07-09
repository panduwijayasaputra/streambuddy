import {
  Controller,
  Get,
  Param,
  Query,
  BadRequestException,
} from "@nestjs/common";
import { AnalyticsService } from "./analytics.service";
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from "@nestjs/swagger";

@ApiTags("Analytics")
@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // GET /analytics/:streamId/snapshot?interval=1h
  @Get(":streamId/snapshot")
  @ApiOperation({ summary: "Get aggregated analytics snapshot for a stream" })
  @ApiParam({
    name: "streamId",
    type: String,
    description: "Stream identifier",
  })
  @ApiQuery({
    name: "interval",
    required: false,
    type: String,
    description: "Interval (e.g., 1h, 30m)",
  })
  @ApiResponse({ status: 200, description: "Aggregated analytics snapshot" })
  @ApiResponse({ status: 400, description: "Invalid input" })
  async getSnapshot(
    @Param("streamId") streamId: string,
    @Query("interval") interval: string
  ) {
    if (!streamId || typeof streamId !== "string" || streamId.length < 2) {
      throw new BadRequestException("Invalid streamId");
    }
    if (interval && !/^\d+(h|m)$/.test(interval)) {
      throw new BadRequestException(
        "Invalid interval format. Use e.g. '1h' or '30m'."
      );
    }
    return this.analyticsService.getSnapshot(streamId, interval);
  }

  // GET /analytics/:streamId/trends?range=24h
  @Get(":streamId/trends")
  @ApiOperation({ summary: "Get time-series analytics trends for a stream" })
  @ApiParam({
    name: "streamId",
    type: String,
    description: "Stream identifier",
  })
  @ApiQuery({
    name: "range",
    required: false,
    type: String,
    description: "Range (e.g., 24h, 60m)",
  })
  @ApiResponse({ status: 200, description: "Time-series analytics data" })
  @ApiResponse({ status: 400, description: "Invalid input" })
  async getTrends(
    @Param("streamId") streamId: string,
    @Query("range") range: string
  ) {
    if (!streamId || typeof streamId !== "string" || streamId.length < 2) {
      throw new BadRequestException("Invalid streamId");
    }
    if (range && !/^\d+(h|m)$/.test(range)) {
      throw new BadRequestException(
        "Invalid range format. Use e.g. '24h' or '60m'."
      );
    }
    return this.analyticsService.getTrends(streamId, range);
  }
}
