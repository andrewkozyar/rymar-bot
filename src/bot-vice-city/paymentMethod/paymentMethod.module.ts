import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PaymentMethodService } from './paymentMethod.service';
import { PaymentMethod } from './paymentMethod.entity';

@Module({
  controllers: [],
  providers: [PaymentMethodService],
  imports: [TypeOrmModule.forFeature([PaymentMethod])],
  exports: [PaymentMethodService],
})
export class PaymentMethodModule {}
