import { Module } from '@nestjs/common';
import { RedisModule as NestJsRedisModule } from '@liaoliaots/nestjs-redis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisConfig } from '../configs/redis.config';
import { RedisService } from './redis.service';

@Module({
  imports: [
    NestJsRedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: redisConfig,
      inject: [ConfigService],
    }),
  ],
  exports: [RedisService],
  providers: [RedisService],
})
export class RedisModule {}
