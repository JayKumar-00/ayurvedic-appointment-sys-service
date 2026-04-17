import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import type Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) {}

  async set(key: string, value: unknown, ttl?: number): Promise<'OK' | null> {
    const payload = JSON.stringify(value);

    if (ttl && ttl > 0) {
      return this.redisClient.set(key, payload, 'EX', ttl);
    }

    return this.redisClient.set(key, payload);
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    const value = await this.redisClient.get(key);

    if (value === null) {
      return null;
    }

    return JSON.parse(value) as T;
  }

  del(key: string): Promise<number> {
    return this.redisClient.del(key);
  }

  async onModuleDestroy(): Promise<void> {
    await this.redisClient.quit();
  }
}
