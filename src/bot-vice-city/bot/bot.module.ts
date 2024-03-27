import { Module } from '@nestjs/common';

import { BotService } from './bot.service';
import { UserModule } from '../user/user.module';
import { RedisModule } from '../../redis/redis.module';
import { SubscriptionPlanModule } from '../subscriptionPlan/subscriptionPlan.module';
import { PromocodeModule } from '../promocode/promocode.module';
import { PaymentModule } from 'src/bot-vice-city/payment/payment.module';
import { ChannelModule } from 'src/bot-vice-city/chanel/channel.module';
import { PaymentMethodModule } from 'src/bot-vice-city/paymentMethod/paymentMethod.module';
import { ConversionRateModule } from 'src/conversionRate/conversionRate.module';
import { LogModule } from 'src/log/log.module';

@Module({
  imports: [
    UserModule,
    RedisModule,
    SubscriptionPlanModule,
    PromocodeModule,
    PaymentModule,
    ChannelModule,
    PaymentMethodModule,
    ConversionRateModule,
    LogModule,
  ],
  providers: [BotService],
  controllers: [],
  exports: [BotService],
})
export class BotModule {}
