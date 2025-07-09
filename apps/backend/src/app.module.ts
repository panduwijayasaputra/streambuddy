import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AnalyticsModule } from "./analytics/analytics.module";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432", 10),
      username: process.env.DB_USER || "postgres",
      password: process.env.DB_PASS || "postgres",
      database: process.env.DB_NAME || "streambuddy",
      autoLoadEntities: true,
      synchronize: true, // Set to false in production
    }),
    AnalyticsModule,
  ],
})
export class AppModule {}
