import { Module } from '@nestjs/common';
import { RedisModule } from './redis/redis.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entities } from './db/entities';
import { ConfigModule } from '@nestjs/config';
import { CronModule } from './cron/cron.module';
import { ConversionRateModule } from './conversionRate/conversionRate.module';
import { LogModule } from './log/log.module';
import { BotHesoyamModule } from './bot-hesoyam/bot-hesoyam.module';
import { BotVibeCityModule } from './bot-vice-city/bot-vibe-city.module';

@Module({
  imports: [
    BotHesoyamModule,
    BotVibeCityModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    RedisModule,
    CronModule,
    ConversionRateModule,
    LogModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: parseInt(<string>process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities,
      migrations: [],
      synchronize: true,
      autoLoadEntities: true,
      logNotifications: true,
      logging: 'all',
      ssl: process.env.DATABASE_URL
        ? {
            rejectUnauthorized: false,
          }
        : false,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
