import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PaymentService } from './payment.service';
import { PaymentHesoyam } from './payment.entity';
import { SubscriptionPlanModule } from 'src/bot-hesoyam/subscriptionPlan/subscriptionPlan.module';

@Module({
  controllers: [],
  providers: [PaymentService],
  imports: [TypeOrmModule.forFeature([PaymentHesoyam]), SubscriptionPlanModule],
  exports: [PaymentService],
})
export class PaymentModule {}
