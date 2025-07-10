import { Injectable } from "@nestjs/common";
import { RedisService } from "./redis.service";

@Injectable()
export class CacheService {
  constructor(private readonly redisService: RedisService) {}

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serializedValue =
      typeof value === "string" ? value : JSON.stringify(value);
    await this.redisService.set(key, serializedValue, ttl);
  }

  async get<T = any>(key: string): Promise<T | null> {
    const value = await this.redisService.get(key);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }

  async delete(key: string): Promise<void> {
    await this.redisService.del(key);
  }

  async exists(key: string): Promise<boolean> {
    return await this.redisService.exists(key);
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.redisService.expire(key, seconds);
  }

  async ttl(key: string): Promise<number> {
    return await this.redisService.ttl(key);
  }

  async setHash(key: string, field: string, value: any): Promise<void> {
    const serializedValue =
      typeof value === "string" ? value : JSON.stringify(value);
    await this.redisService.setHash(key, field, serializedValue);
  }

  async getHash<T = any>(key: string, field: string): Promise<T | null> {
    const value = await this.redisService.getHash(key, field);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }

  async getAllHash<T = any>(key: string): Promise<Record<string, T>> {
    const hash = await this.redisService.getAllHash(key);
    const result: Record<string, T> = {};

    for (const [field, value] of Object.entries(hash)) {
      try {
        result[field] = JSON.parse(value) as T;
      } catch {
        result[field] = value as T;
      }
    }

    return result;
  }

  async deleteHash(key: string, field: string): Promise<void> {
    await this.redisService.delHash(key, field);
  }

  async increment(key: string, amount: number = 1): Promise<number> {
    return await this.redisService.increment(key, amount);
  }

  async decrement(key: string, amount: number = 1): Promise<number> {
    return await this.redisService.decrement(key, amount);
  }

  async getOrSet<T = any>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, ttl);
    return value;
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.redisService.getKeys(pattern);
    if (keys.length > 0) {
      await Promise.all(keys.map((key) => this.redisService.del(key)));
    }
  }

  async flushAll(): Promise<void> {
    await this.redisService.flushDb();
  }

  // Cache decorator helper
  async withCache<T = any>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    return this.getOrSet(key, factory, ttl);
  }
}
