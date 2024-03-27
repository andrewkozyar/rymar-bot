import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SubscriptionPlanService } from './subscriptionPlan.service';
import { SubscriptionPlanHesoyam } from './subscriptionPlan.entity';

@Module({
  controllers: [],
  providers: [SubscriptionPlanService],
  imports: [TypeOrmModule.forFeature([SubscriptionPlanHesoyam])],
  exports: [SubscriptionPlanService],
})
export class SubscriptionPlanModule {}
