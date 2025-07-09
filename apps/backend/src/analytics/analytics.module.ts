import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AnalyticsController } from "./analytics.controller";
import { AnalyticsService } from "./analytics.service";
import { AnalyticsSnapshotEntity } from "./analytics-snapshot.entity";

@Module({
  imports: [TypeOrmModule.forFeature([AnalyticsSnapshotEntity])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
