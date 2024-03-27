import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PromocodeService } from './promocode.service';
import { Promocode } from './promocode.entity';

@Module({
  controllers: [],
  providers: [PromocodeService],
  imports: [TypeOrmModule.forFeature([Promocode])],
  exports: [PromocodeService],
})
export class PromocodeModule {}
