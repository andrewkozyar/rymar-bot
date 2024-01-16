import { Module } from '@nestjs/common';

import { BotService } from './bot.service';
import { UserModule } from '../user/user.module';
import { RedisModule } from '../redis/redis.module';
import { SubscriptionPlanModule } from '../subscriptionPlan/subscriptionPlan.module';
import { PromocodeModule } from '../promocode/promocode.module';
import { PaymentModule } from 'src/payment/payment.module';
import { ChannelModule } from 'src/chanel/channel.module';
import { PaymentMethodModule } from 'src/paymentMethod/paymentMethod.module';
import { ConversionRateModule } from 'src/conversionRate/conversionRate.module';

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
  ],
  providers: [BotService],
  controllers: [],
  exports: [BotService],
})
export class BotModule {}
