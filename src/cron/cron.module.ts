import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { UserModule } from '../user/user.module';
import { BotModule } from 'src/bot/bot.module';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { ConversionRateModule } from 'src/conversionRate/conversionRate.module';
import { LogModule } from 'src/log/log.module';
import { PaymentModule } from 'src/payment/payment.module';

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
