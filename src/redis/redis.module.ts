import { Global, Module } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '../config/config.service';
import { REDIS_CLIENT, RedisService } from './redis.service';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (configService: ConfigService) => {
        return new Redis({
          host: configService.redisHost,
          port: configService.redisPort,
          username: configService.redisUsername,
          password: configService.redisPassword || undefined,
          maxRetriesPerRequest: 2,
          enableReadyCheck: true,
        });
      },
      inject: [ConfigService],
    },
    RedisService,
  ],
  exports: [REDIS_CLIENT, RedisService],
})
export class RedisModule {}
