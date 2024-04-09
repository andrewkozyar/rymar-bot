import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateDto, GetDto } from './dto';
import {
  BotEnum,
  GetPaymentsHesoyamType,
  PaymentStatusEnum,
  errorHandler,
} from '../../helper';

import { PaymentHesoyam } from './payment.entity';
import { exportPaymentInfoToGoogleSheet } from 'src/helper/google-sheet';
import TelegramBot from 'node-telegram-bot-api';
import { UserHesoyam } from '../user/user.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(PaymentHesoyam)
    private paymentRepository: Repository<PaymentHesoyam>,
  ) {}

  async create(dto: CreateDto): Promise<PaymentHesoyam> {
    try {
      return await this.paymentRepository.save({
        ...dto,
      });
    } catch (e) {
      errorHandler(
        `Failed to create payment`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        e,
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async update(
    dto: CreateDto,
    bot?: TelegramBot,
    updatedBy?: UserHesoyam,
  ): Promise<PaymentHesoyam> {
    try {
      const payment = await this.findOne({
        id: dto.id,
        bot: dto.bot,
      });

      if (
        payment.status !== PaymentStatusEnum.Success &&
        dto.status === PaymentStatusEnum.Success
      ) {
        const image = await bot.getFileLink(payment.file_id);
        await exportPaymentInfoToGoogleSheet(dto.bot, [
          [
            payment.amount,
            payment.currency,
            payment.price_usd,
            payment.promocode?.name,
            payment.user.name,
            payment.user.email,
            payment.payment_method.name,
            payment.subscription_plan.nameRU,
            updatedBy.name,
            `=IMAGE("${image}")`,
          ],
        ]);
      }

      return await this.paymentRepository.save({
        ...payment,
        ...dto,
      });
    } catch (e) {
      errorHandler(
        `Failed to update payment`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        e,
      );
    }
  }

  async findOne({
    id,
    user_id,
    statuses,
    bot,
  }: GetDto): Promise<PaymentHesoyam> {
    const paymentQuery = await this.paymentRepository
      .createQueryBuilder('payment')
      .where('(payment.id = :id OR user_id = :user_id)', {
        id,
        user_id,
      })
      .andWhere('payment.bot = :bot', { bot })
      .withDeleted()
      .leftJoinAndSelect('payment.subscription_plan', 'subscription_plan')
      .leftJoinAndSelect('payment.promocode', 'promocode')
      .leftJoinAndSelect('payment.user', 'user')
      .leftJoinAndSelect('payment.payment_method', 'payment_method')
      .orderBy('payment.created_date', 'DESC')
      .withDeleted();

    if (statuses?.length) {
      paymentQuery.andWhere('payment.status IN (:...statuses)', { statuses });
    }

    return paymentQuery.getOne();
  }

  async getPayments({
    user_id,
    expired_date,
    statuses,
    expiredDateBefore,
    bot,
  }: {
    user_id?: string;
    expired_date?: Date;
    statuses?: PaymentStatusEnum[];
    expiredDateBefore?: boolean;
    bot: BotEnum;
  }): Promise<GetPaymentsHesoyamType> {
    try {
      const paymentQuery = await this.paymentRepository
        .createQueryBuilder('payment')
        .where('payment.bot = :bot', { bot });

      if (user_id) {
        paymentQuery.andWhere(`payment.user_id = :user_id`, {
          user_id,
        });
      }

      if (expired_date) {
        paymentQuery.andWhere(
          `payment.expired_date ${
            expiredDateBefore ? '<=' : '='
          } :expired_date`,
          {
            expired_date,
          },
        );
      }

      if (statuses?.length) {
        paymentQuery.andWhere('payment.status IN (:...statuses)', { statuses });
      }

      const [payments, total] = await paymentQuery
        .withDeleted()
        .leftJoinAndSelect('payment.subscription_plan', 'subscription_plan')
        .leftJoinAndSelect('payment.promocode', 'promocode')
        .leftJoinAndSelect('payment.payment_method', 'payment_method')
        .leftJoinAndSelect('payment.updated_by', 'updated_by')
        .orderBy('payment.created_date', 'DESC')
        .getManyAndCount();

      return {
        payments,
        total,
      };
    } catch (e) {
      errorHandler(
        `Failed to get payments`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        e,
      );
    }
  }
}
