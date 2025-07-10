import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DatabaseMonitoringService } from "./database-monitoring.service";
import { DatabaseMonitoringController } from "../controllers/database-monitoring.controller";

@Module({
  imports: [ConfigModule],
  controllers: [DatabaseMonitoringController],
  providers: [DatabaseMonitoringService],
  exports: [DatabaseMonitoringService],
})
export class DatabaseMonitoringModule {}
