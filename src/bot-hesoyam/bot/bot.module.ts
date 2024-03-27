import { Module } from '@nestjs/common';

import { BotService } from './bot.service';
import { UserModule } from '../../bot-hesoyam/user/user.module';
import { RedisModule } from '../../redis/redis.module';
import { SubscriptionPlanModule } from '../subscriptionPlan/subscriptionPlan.module';
import { PromocodeModule } from '../../bot-hesoyam/promocode/promocode.module';
import { PaymentModule } from 'src/bot-hesoyam/payment/payment.module';
import { ChannelModule } from 'src/bot-hesoyam/chanel/channel.module';
import { PaymentMethodModule } from 'src/bot-hesoyam/paymentMethod/paymentMethod.module';
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
