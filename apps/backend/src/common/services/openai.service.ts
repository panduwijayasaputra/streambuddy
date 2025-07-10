import { Injectable, Logger, HttpException, HttpStatus } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CacheService } from "./cache.service";
import OpenAI from "openai";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  cacheKey?: string;
  cacheTTL?: number;
}

@Injectable()
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name);
  private openai: OpenAI;
  private readonly config: any;

  constructor(
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService
  ) {
    this.config = {
      apiKey: this.configService.get("OPENAI_API_KEY"),
      organization: this.configService.get("OPENAI_ORG_ID"),
      maxRetries: parseInt(this.configService.get("OPENAI_MAX_RETRIES", "3")),
      timeout: parseInt(this.configService.get("OPENAI_TIMEOUT", "30000")),
      model: this.configService.get("OPENAI_MODEL", "gpt-4"),
      temperature: parseFloat(
        this.configService.get("OPENAI_TEMPERATURE", "0.7")
      ),
      maxTokens: parseInt(this.configService.get("OPENAI_MAX_TOKENS", "1000")),
    };

    if (!this.config.apiKey) {
      this.logger.warn("OpenAI API key not configured");
      return;
    }

    this.openai = new OpenAI({
      apiKey: this.config.apiKey,
      organization: this.config.organization,
      maxRetries: this.config.maxRetries,
      timeout: this.config.timeout,
    });
  }

  async chatCompletion(
    messages: ChatMessage[],
    options: ChatCompletionOptions = {}
  ): Promise<string> {
    if (!this.openai) {
      throw new HttpException(
        "OpenAI service not configured",
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    const {
      model = this.config.model,
      temperature = this.config.temperature,
      maxTokens = this.config.maxTokens,
      stream = false,
      cacheKey,
      cacheTTL = 3600, // 1 hour default
    } = options;

    // Check cache first if cacheKey is provided
    if (cacheKey) {
      const cached = await this.cacheService.get<string>(cacheKey);
      if (cached) {
        this.logger.debug(`Cache hit for key: ${cacheKey}`);
        return cached;
      }
    }

    try {
      this.logger.debug(`Sending request to OpenAI with model: ${model}`);

      const completion = await this.openai.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: false,
      });

      const response = completion.choices[0]?.message?.content;

      if (!response) {
        throw new HttpException(
          "No response from OpenAI",
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      // Cache the response if cacheKey is provided
      if (cacheKey) {
        await this.cacheService.set(cacheKey, response, cacheTTL);
        this.logger.debug(`Cached response for key: ${cacheKey}`);
      }

      return response;
    } catch (error) {
      this.logger.error(`OpenAI API error: ${error.message}`, error.stack);

      if (error.status === 429) {
        throw new HttpException(
          "Rate limit exceeded. Please try again later.",
          HttpStatus.TOO_MANY_REQUESTS
        );
      }

      if (error.status === 401) {
        throw new HttpException("Invalid API key", HttpStatus.UNAUTHORIZED);
      }

      if (error.status === 400) {
        throw new HttpException(
          `Bad request: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      throw new HttpException(
        "OpenAI service temporarily unavailable",
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  async streamChatCompletion(
    messages: ChatMessage[],
    options: ChatCompletionOptions = {}
  ): Promise<AsyncGenerator<string, void, unknown>> {
    if (!this.openai) {
      throw new HttpException(
        "OpenAI service not configured",
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    const {
      model = this.config.model,
      temperature = this.config.temperature,
      maxTokens = this.config.maxTokens,
    } = options;

    try {
      this.logger.debug(
        `Starting streaming request to OpenAI with model: ${model}`
      );

      const stream = await this.openai.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: true,
      });

      return this.processStream(stream);
    } catch (error) {
      this.logger.error(
        `OpenAI streaming error: ${error.message}`,
        error.stack
      );
      throw new HttpException(
        "OpenAI service temporarily unavailable",
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  private async *processStream(
    stream: any
  ): AsyncGenerator<string, void, unknown> {
    try {
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
    } catch (error) {
      this.logger.error(`Stream processing error: ${error.message}`);
      throw error;
    }
  }

  async generateEmbeddings(text: string): Promise<number[]> {
    if (!this.openai) {
      throw new HttpException(
        "OpenAI service not configured",
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    try {
      const response = await this.openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      this.logger.error(
        `Embedding generation error: ${error.message}`,
        error.stack
      );
      throw new HttpException(
        "Failed to generate embeddings",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async moderateContent(text: string): Promise<{
    flagged: boolean;
    categories: any;
    categoryScores: any;
  }> {
    if (!this.openai) {
      throw new HttpException(
        "OpenAI service not configured",
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    try {
      const response = await this.openai.moderations.create({
        input: text,
      });

      const result = response.results[0];
      return {
        flagged: result.flagged,
        categories: result.categories,
        categoryScores: result.category_scores,
      };
    } catch (error) {
      this.logger.error(
        `Content moderation error: ${error.message}`,
        error.stack
      );
      throw new HttpException(
        "Failed to moderate content",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getModels(): Promise<any[]> {
    if (!this.openai) {
      throw new HttpException(
        "OpenAI service not configured",
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    try {
      const response = await this.openai.models.list();
      return response.data;
    } catch (error) {
      this.logger.error(`Models fetch error: ${error.message}`, error.stack);
      throw new HttpException(
        "Failed to fetch models",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  isConfigured(): boolean {
    return !!this.openai && !!this.config.apiKey;
  }

  getConfig() {
    return {
      ...this.config,
      apiKey: this.config.apiKey ? "[REDACTED]" : undefined,
    };
  }
}
