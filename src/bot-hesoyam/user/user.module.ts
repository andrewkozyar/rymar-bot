import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserService } from './user.service';
import { UserHesoyam } from './user.entity';
import { PaymentModule } from 'src/bot-hesoyam/payment/payment.module';

@Module({
  controllers: [],
  providers: [UserService],
  imports: [TypeOrmModule.forFeature([UserHesoyam]), PaymentModule],
  exports: [UserService],
})
export class UserModule {}
