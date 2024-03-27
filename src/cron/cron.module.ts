import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { UserModule } from '../bot-vice-city/user/user.module';
import { BotModule } from 'src/bot-vice-city/bot/bot.module';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { ConversionRateModule } from 'src/conversionRate/conversionRate.module';
import { LogModule } from 'src/log/log.module';
import { PaymentModule } from 'src/bot-vice-city/payment/payment.module';

@Module({
  imports: [
    UserModule,
    BotModule,
    HttpModule,
    ConversionRateModule,
    ScheduleModule.forRoot(),
    LogModule,
    PaymentModule,
  ],
  providers: [CronService],
  controllers: [],
  exports: [CronService],
})
export class CronModule {}
