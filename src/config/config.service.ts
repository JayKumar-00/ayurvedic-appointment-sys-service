import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  get mongoUri(): string {
    return (
      process.env.MONGO_URI ??
      'mongodb://127.0.0.1:27017/ayurvedic-appointment'
    );
  }

  get port(): number {
    return parseInt(process.env.PORT ?? '3030', 10);
  }

  get jwtAccessSecret(): string {
    const secret = process.env.JWT_ACCESS_KEY;
    if (!secret) {
      throw new Error('JWT_ACCESS_KEY environment variable is not defined');
    }
    return secret;
  }

  get jwtRefreshSecret(): string {
    const secret = process.env.JWT_REFRESH_KEY;
    if (!secret) {
      throw new Error('JWT_REFRESH_KEY environment variable is not defined');
    }
    return secret;
  }

  get redisHost(): string {
    return process.env.REDIS_HOST ?? 'localhost';
  }

  get redisPort(): number {
    return parseInt(process.env.REDIS_PORT ?? '6379', 10);
  }

  get redisUsername(): string {
    return process.env.REDIS_USERNAME ?? 'default';
  }

  get redisPassword(): string {
    return process.env.REDIS_PASSWORD ?? '';
  }
}
