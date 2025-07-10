import { Module } from "@nestjs/common";
import { DatabasePerformanceMonitoringService } from "../services/database-performance-monitoring.service";
import { DatabasePerformanceController } from "../controllers/database-performance.controller";

@Module({
  providers: [DatabasePerformanceMonitoringService],
  controllers: [DatabasePerformanceController],
  exports: [DatabasePerformanceMonitoringService],
})
export class DatabasePerformanceModule {}
