import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SubscriptionPlanService } from './subscriptionPlan.service';
import { SubscriptionPlan } from './subscriptionPlan.entity';

@Module({
  controllers: [],
  providers: [SubscriptionPlanService],
  imports: [TypeOrmModule.forFeature([SubscriptionPlan])],
  exports: [SubscriptionPlanService],
})
export class SubscriptionPlanModule {}
