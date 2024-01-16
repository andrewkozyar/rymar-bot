import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConversionRateService } from './conversionRate.service';
import { ConversionRate } from './conversionRate.entity';

@Module({
  controllers: [],
  providers: [ConversionRateService],
  imports: [TypeOrmModule.forFeature([ConversionRate])],
  exports: [ConversionRateService],
})
export class ConversionRateModule {}
