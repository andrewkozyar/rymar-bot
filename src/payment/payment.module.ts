import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PaymentService } from './payment.service';
import { Payment } from './payment.entity';
import { SubscriptionPlanModule } from 'src/subscriptionPlan/subscriptionPlan.module';

@Module({
  controllers: [],
  providers: [PaymentService],
  imports: [TypeOrmModule.forFeature([Payment]), SubscriptionPlanModule],
  exports: [PaymentService],
})
export class PaymentModule {}
