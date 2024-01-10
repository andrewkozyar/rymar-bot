import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateDto, UpdateDto, GetDto } from './dto';
import { GetPromocodesType, MessageType, errorHandler } from '../helper';

import { Promocode } from './promocode.entity';

@Injectable()
export class PromocodeService {
  constructor(
    @InjectRepository(Promocode)
    private promocodeRepository: Repository<Promocode>,
  ) {}

  async create(dto: CreateDto = {}): Promise<Promocode> {
    try {
      return await this.promocodeRepository.save(dto);
    } catch (e) {
      errorHandler(
        `Failed to create promocode`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        e,
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async update({ id, field, ...dto }: UpdateDto): Promise<Promocode> {
    try {
      const promocode = await this.promocodeRepository.findOneBy({
        id,
      });

      return this.promocodeRepository.save({
        ...promocode,
        ...dto,
      });
    } catch (e) {
      errorHandler(
        `Failed to update promocode`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        e,
      );
    }
  }

  async remove(id: string): Promise<MessageType> {
    try {
      await this.promocodeRepository.softDelete({ id });
      return { message: true };
    } catch (e) {
      errorHandler(
        `Failed to remove promocode`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        e,
      );
    }
  }

  async findOne({ id, name, is_published = null }: GetDto): Promise<Promocode> {
    const promocodeRep = await this.promocodeRepository
      .createQueryBuilder('promocode')
      .where('promocode.id = :id OR name = :name', {
        id,
        name,
      });

    if (is_published !== null) {
      promocodeRep.andWhere('promocode.is_published = :is_published', {
        is_published,
      });
    }

    const promocode = await promocodeRep.getOne();

    return promocode;
  }

  async find(
    is_published: boolean = null,
    offset: number = 0,
    limit: number = 20,
    searchKey?: string,
  ): Promise<GetPromocodesType> {
    try {
      const promocodeQuery =
        await this.promocodeRepository.createQueryBuilder('promocode');

      if (searchKey) {
        promocodeQuery.andWhere(
          `(LOWER(promocode.name) LIKE LOWER(:searchKey))`,
          {
            searchKey: `%${searchKey}%`,
          },
        );
      }

      if (is_published !== null) {
        promocodeQuery.andWhere(`promocode.is_published = :is_published`, {
          is_published,
        });
      }

      const [promocodes, total] = await promocodeQuery
        .orderBy('promocode.created_date', 'DESC')
        .skip(offset)
        .take(limit)
        .getManyAndCount();

      return {
        promocodes,
        total,
      };
    } catch (e) {
      errorHandler(
        `Failed to get promocodes`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        e,
      );
    }
  }
}
