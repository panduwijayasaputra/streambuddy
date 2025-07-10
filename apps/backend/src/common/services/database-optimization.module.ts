import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { DatabaseMonitorService } from "./database-monitor.service";
import { DatabaseOptimizationService } from "./database-optimization.service";

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([]), // Import entities as needed
  ],
  providers: [DatabaseMonitorService, DatabaseOptimizationService],
  exports: [DatabaseMonitorService, DatabaseOptimizationService],
})
export class DatabaseOptimizationModule {}
