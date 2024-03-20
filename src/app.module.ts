import { Module } from '@nestjs/common';
import { RedisModule } from './redis/redis.module';
import { BotModule } from './bot/bot.module';
import { UserModule } from './user/user.module';
import { SubscriptionPlanModule } from './subscriptionPlan/subscriptionPlan.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entities } from './db/entities';
import { ConfigModule } from '@nestjs/config';
import { PromocodeModule } from './promocode/promocode.module';
import { PaymentModule } from './payment/payment.module';
import { ChannelModule } from './chanel/channel.module';
import { PaymentMethod } from './paymentMethod/paymentMethod.entity';
import { CronModule } from './cron/cron.module';
import { ConversionRateModule } from './conversionRate/conversionRate.module';
import { LogModule } from './log/log.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    RedisModule,
    CronModule,
    ConversionRateModule,
    BotModule,
    UserModule,
    PromocodeModule,
    SubscriptionPlanModule,
    PaymentModule,
    ChannelModule,
    PaymentMethod,
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
