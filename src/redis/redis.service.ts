import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { RedisKey } from 'ioredis/built/utils/RedisCommander';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async get(key: RedisKey) {
    const result: string = await this.redis.get(key);

    return result;
  }
  async add(key: RedisKey, value: string | Buffer | number, ttl: number = 300) {
    return await this.redis.set(key, value, 'EX', ttl);
  }

  async delete(key: RedisKey) {
    await this.redis.del(key);
  }

  async clearData(userId: string) {
    await Promise.all([
      this.delete(`BuySubscriptionPlan-${userId}`),
      this.delete(`ChangeEmail-${userId}`),
      this.delete(`Promocode-${userId}`),
      this.delete(`AdminUserTransactions-${userId}`),
      this.delete(`EditSubscriptionPlanAdmin-${userId}`),
      this.delete(`EditPromocodeAdmin-${userId}`),
      this.delete(`EditPaymentMethodAdmin-${userId}`),
    ]);
  }
}
