import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateDto, UpdateDto, GetDto } from './dto';
import { MessageType, errorHandler } from '../helper';

import { PaymentMethod } from './paymentMethod.entity';

@Injectable()
export class PaymentMethodService {
  constructor(
    @InjectRepository(PaymentMethod)
    private paymentMethodRepository: Repository<PaymentMethod>,
  ) {}

  async create(dto: CreateDto = {}): Promise<PaymentMethod> {
    try {
      return await this.paymentMethodRepository.save(dto);
    } catch (e) {
      errorHandler(
        `Failed to create paymentMethod`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        e,
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async update({ id, field, ...dto }: UpdateDto): Promise<PaymentMethod> {
    try {
      const paymentMethod = await this.paymentMethodRepository.findOneBy({
        id,
      });

      return this.paymentMethodRepository.save({
        ...paymentMethod,
        ...dto,
      });
    } catch (e) {
      errorHandler(
        `Failed to update paymentMethod`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        e,
      );
    }
  }

  async remove(id: string): Promise<MessageType> {
    try {
      await this.paymentMethodRepository.softDelete({ id });
      return { message: true };
    } catch (e) {
      errorHandler(
        `Failed to remove paymentMethod`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        e,
      );
    }
  }

  async findOne({
    id,
    name,
    is_published = null,
  }: GetDto): Promise<PaymentMethod> {
    const paymentMethodRep = await this.paymentMethodRepository
      .createQueryBuilder('paymentMethod')
      .where('paymentMethod.id = :id OR name = :name', {
        id,
        name,
      });

    if (is_published !== null) {
      paymentMethodRep.andWhere('paymentMethod.is_published = :is_published', {
        is_published,
      });
    }

    const paymentMethod = await paymentMethodRep.getOne();

    return paymentMethod;
  }

  async find(
    is_published: boolean = null,
    offset: number = 0,
    limit: number = 20,
    searchKey?: string,
  ): Promise<PaymentMethod[]> {
    try {
      const paymentMethodQuery =
        await this.paymentMethodRepository.createQueryBuilder('paymentMethod');

      if (searchKey) {
        paymentMethodQuery.andWhere(
          `(LOWER(paymentMethod.name) LIKE LOWER(:searchKey))`,
          {
            searchKey: `%${searchKey}%`,
          },
        );
      }

      if (is_published !== null) {
        paymentMethodQuery.andWhere(
          `paymentMethod.is_published = :is_published`,
          {
            is_published,
          },
        );
      }

      const paymentMethods = await paymentMethodQuery
        .orderBy('paymentMethod.created_date', 'DESC')
        .skip(offset)
        .take(limit)
        .getMany();

      return paymentMethods;
    } catch (e) {
      errorHandler(
        `Failed to get paymentMethods`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        e,
      );
    }
  }
}
