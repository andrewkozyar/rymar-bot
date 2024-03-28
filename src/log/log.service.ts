import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BotEnum, LogTypeEnum, errorHandler } from '../helper';

import { Log } from './log.entity';
import { addDays, getDateWithoutHours } from 'src/helper/date';

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(Log)
    private LogRepository: Repository<Log>,
  ) {}

  async create(dto: {
    info: string;
    type: LogTypeEnum;
    bot: BotEnum;
    action?: string;
    user_id?: string;
  }): Promise<Log> {
    try {
      if (dto.type === LogTypeEnum.USER) {
        const log = await this.getOne(dto.user_id);

        if (log) {
          return await this.LogRepository.save({
            ...log,
            info: [log.info, dto.info].join(' => '),
          });
        }
      }
      return await this.LogRepository.save({
        ...dto,
        user_id: dto.bot === BotEnum.VIBE_CITY ? dto.user_id : null,
        user_hesoyam_id: dto.bot === BotEnum.HESOYAM ? dto.user_id : null,
      });
    } catch (e) {
      errorHandler(`Failed to create Log`, HttpStatus.INTERNAL_SERVER_ERROR, e);
    }
  }

  async get(user_id: string): Promise<Log[]> {
    try {
      return await this.LogRepository.createQueryBuilder('log')
        .andWhere('log.user_id = :user_id OR log.user_hesoyam_id = :user_id', {
          user_id,
        })
        .orderBy('log.created_date', 'DESC')
        .getMany();
    } catch (e) {
      errorHandler(`Failed to get Logs`, HttpStatus.INTERNAL_SERVER_ERROR, e);
    }
  }

  async getOne(user_id: string): Promise<Log> {
    try {
      return await this.LogRepository.createQueryBuilder('log')
        .where('log.created_date BETWEEN :startDare AND :endDate', {
          startDare: getDateWithoutHours(new Date()),
          endDate: addDays(getDateWithoutHours(new Date()), 1),
        })
        .andWhere('log.user_id = :user_id OR log.user_hesoyam_id = :user_id', {
          user_id,
        })
        .getOne();
    } catch (e) {
      errorHandler(`Failed to get Log`, HttpStatus.INTERNAL_SERVER_ERROR, e);
    }
  }
}
