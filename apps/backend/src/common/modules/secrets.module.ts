import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { SecretsManagerService } from "../services/secrets-manager.service";
import { SecretsValidationService } from "../services/secrets-validation.service";

@Module({
  imports: [ConfigModule],
  providers: [SecretsManagerService, SecretsValidationService],
  exports: [SecretsManagerService, SecretsValidationService],
})
export class SecretsModule {}
