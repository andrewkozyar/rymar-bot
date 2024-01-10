import { ConfigService } from '@nestjs/config';
import { RedisModuleOptions } from '@liaoliaots/nestjs-redis';

export const redisConfig = async (
  configService: ConfigService,
): Promise<RedisModuleOptions> => {
  return {
    config: {
      url: configService.get<string>('REDIS_HOST'),
    },
  };
};
