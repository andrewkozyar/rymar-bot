import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateDto } from './dto';
import { errorHandler } from '../helper';

import { ConversionRate } from './conversionRate.entity';

@Injectable()
export class ConversionRateService {
  constructor(
    @InjectRepository(ConversionRate)
    private conversionRateRepository: Repository<ConversionRate>,
  ) {}

  async create(dto: CreateDto): Promise<ConversionRate> {
    try {
      const rates = await this.get();

      return await this.conversionRateRepository.save({
        ...rates,
        ...dto,
      });
    } catch (e) {
      errorHandler(
        `Failed to create conversionRate`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        e,
      );
    }
  }

  async get(): Promise<ConversionRate> {
    return await this.conversionRateRepository.createQueryBuilder().getOne();
  }
}
