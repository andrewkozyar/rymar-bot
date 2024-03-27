import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PromocodeService } from './promocode.service';
import { PromocodeHesoyam } from './promocode.entity';

@Module({
  controllers: [],
  providers: [PromocodeService],
  imports: [TypeOrmModule.forFeature([PromocodeHesoyam])],
  exports: [PromocodeService],
})
export class PromocodeModule {}
