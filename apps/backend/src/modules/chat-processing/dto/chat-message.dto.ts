import { IsString, IsNotEmpty, IsOptional, IsEnum } from "class-validator";

export class CreateChatMessageDto {
  @IsString()
  @IsNotEmpty()
  streamSessionId: string;

  @IsString()
  @IsNotEmpty()
  platform: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  @IsString()
  gameContext?: string;

  @IsOptional()
  metadata?: {
    gameContext?: string;
    priority?: number;
    isSpam?: boolean;
    isInappropriate?: boolean;
    language?: string;
    confidence?: number;
  };
}

export class UpdateChatMessageDto {
  @IsOptional()
  @IsString()
  response?: string;

  @IsOptional()
  @IsEnum(["pending", "processed", "filtered", "responded", "error"])
  status?: string;

  @IsOptional()
  metadata?: {
    gameContext?: string;
    priority?: number;
    isSpam?: boolean;
    isInappropriate?: boolean;
    language?: string;
    confidence?: number;
  };
}

export class ChatMessageResponseDto {
  id: string;
  streamSessionId: string;
  platform: string;
  userId: string;
  username: string;
  message: string;
  response?: string;
  status: string;
  metadata?: any;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
