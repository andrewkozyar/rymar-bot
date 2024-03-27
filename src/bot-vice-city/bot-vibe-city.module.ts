import { Module } from '@nestjs/common';
import { BotModule } from './bot/bot.module';
import { UserModule } from './user/user.module';
import { SubscriptionPlanModule } from './subscriptionPlan/subscriptionPlan.module';
import { PromocodeModule } from './promocode/promocode.module';
import { PaymentModule } from './payment/payment.module';
import { ChannelModule } from './chanel/channel.module';
import { PaymentMethodModule } from './paymentMethod/paymentMethod.module';

@Module({
  imports: [
    BotModule,
    UserModule,
    PromocodeModule,
    SubscriptionPlanModule,
    PaymentModule,
    ChannelModule,
    PaymentMethodModule,
  ],
  controllers: [],
  providers: [],
})
export class BotVibeCityModule {}
