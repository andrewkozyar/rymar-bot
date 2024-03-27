import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserService } from './user.service';
import { User } from './user.entity';
import { PaymentModule } from 'src/bot-vice-city/payment/payment.module';

@Module({
  controllers: [],
  providers: [UserService],
  imports: [TypeOrmModule.forFeature([User]), PaymentModule],
  exports: [UserService],
})
export class UserModule {}
