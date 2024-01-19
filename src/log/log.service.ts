import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { errorHandler } from '../helper';

import { Log } from './log.entity';

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(Log)
    private LogRepository: Repository<Log>,
  ) {}

  async create(dto: {
    info: string;
    type: string;
    action: string;
  }): Promise<Log> {
    try {
      return await this.LogRepository.save(dto);
    } catch (e) {
      errorHandler(`Failed to create Log`, HttpStatus.INTERNAL_SERVER_ERROR, e);
    }
  }
}
