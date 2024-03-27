import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PaymentMethodService } from './paymentMethod.service';
import { PaymentMethodHesoyam } from './paymentMethod.entity';

@Module({
  controllers: [],
  providers: [PaymentMethodService],
  imports: [TypeOrmModule.forFeature([PaymentMethodHesoyam])],
  exports: [PaymentMethodService],
})
export class PaymentMethodModule {}
