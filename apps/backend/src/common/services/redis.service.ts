import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.redisClient = new Redis({
      host: this.configService.get("REDIS_HOST", "localhost"),
      port: this.configService.get("REDIS_PORT", 6379),
      password: this.configService.get("REDIS_PASSWORD", ""),
      db: this.configService.get("REDIS_DB", 0),
      lazyConnect: true,
      keepAlive: 30000,
      connectTimeout: 10000,
      commandTimeout: 5000,
      maxRetriesPerRequest: null,
    });

    this.redisClient.on("error", (error) => {
      console.error("Redis connection error:", error);
    });

    this.redisClient.on("connect", () => {
      console.log("✅ Redis connected successfully");
    });
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      await this.redisClient.quit();
    }
  }

  getClient(): Redis {
    return this.redisClient;
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redisClient.setex(key, ttl, value);
    } else {
      await this.redisClient.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return await this.redisClient.get(key);
  }

  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.redisClient.exists(key);
    return result === 1;
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.redisClient.expire(key, seconds);
  }

  async ttl(key: string): Promise<number> {
    return await this.redisClient.ttl(key);
  }

  async setHash(key: string, field: string, value: string): Promise<void> {
    await this.redisClient.hset(key, field, value);
  }

  async getHash(key: string, field: string): Promise<string | null> {
    return await this.redisClient.hget(key, field);
  }

  async getAllHash(key: string): Promise<Record<string, string>> {
    return await this.redisClient.hgetall(key);
  }

  async delHash(key: string, field: string): Promise<void> {
    await this.redisClient.hdel(key, field);
  }

  async pushList(key: string, value: string): Promise<void> {
    await this.redisClient.lpush(key, value);
  }

  async popList(key: string): Promise<string | null> {
    return await this.redisClient.rpop(key);
  }

  async getListRange(
    key: string,
    start: number,
    stop: number
  ): Promise<string[]> {
    return await this.redisClient.lrange(key, start, stop);
  }

  async addToSet(key: string, member: string): Promise<void> {
    await this.redisClient.sadd(key, member);
  }

  async removeFromSet(key: string, member: string): Promise<void> {
    await this.redisClient.srem(key, member);
  }

  async isSetMember(key: string, member: string): Promise<boolean> {
    const result = await this.redisClient.sismember(key, member);
    return result === 1;
  }

  async getSetMembers(key: string): Promise<string[]> {
    return await this.redisClient.smembers(key);
  }

  async increment(key: string, amount: number = 1): Promise<number> {
    return await this.redisClient.incrby(key, amount);
  }

  async decrement(key: string, amount: number = 1): Promise<number> {
    return await this.redisClient.decrby(key, amount);
  }

  async ping(): Promise<string> {
    return await this.redisClient.ping();
  }

  async flushDb(): Promise<void> {
    await this.redisClient.flushdb();
  }

  async getKeys(pattern: string): Promise<string[]> {
    return await this.redisClient.keys(pattern);
  }
}
