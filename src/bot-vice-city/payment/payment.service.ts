import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateDto, GetDto } from './dto';
import {
  BotEnum,
  GetPaymentsType,
  PaymentStatusEnum,
  errorHandler,
} from '../../helper';

import { Payment } from './payment.entity';
import { SubscriptionPlanService } from 'src/bot-vice-city/subscriptionPlan/subscriptionPlan.service';
import { addDays, addMonths, getDateWithoutHours } from 'src/helper/date';
import TelegramBot from 'node-telegram-bot-api';
import { User } from '../user/user.entity';
import { exportPaymentInfoToGoogleSheet } from 'src/helper/google-sheet';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    private planService: SubscriptionPlanService,
  ) {}

  async create({ continueDays, ...dto }: CreateDto): Promise<Payment> {
    try {
      const plan = await this.planService.findOne({
        id: dto.subscription_plan_id,
      });

      let expired_date = addMonths(
        getDateWithoutHours(new Date()),
        plan.months_count,
      );

      if (continueDays) {
        expired_date = addDays(expired_date, continueDays);
      }

      return await this.paymentRepository.save({
        ...dto,
        expired_date,
      });
    } catch (e) {
      errorHandler(
        `Failed to create payment`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        e,
      );
    }
  }

  async update(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    { continueDays, ...dto }: CreateDto,
    bot?: TelegramBot,
    updatedBy?: User,
  ): Promise<Payment> {
    try {
      const payment = await this.findOne({
        id: dto.id,
      });

      if (
        payment.status !== PaymentStatusEnum.Success &&
        dto.status === PaymentStatusEnum.Success
      ) {
        const image = await bot.getFileLink(payment.file_id);
        await exportPaymentInfoToGoogleSheet(BotEnum.VICE_CITY, [
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

  async findOne({ id, user_id, statuses }: GetDto): Promise<Payment> {
    const paymentQuery = await this.paymentRepository
      .createQueryBuilder('payment')
      .where('payment.id = :id OR user_id = :user_id', {
        id,
        user_id,
      })
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
  }: {
    user_id?: string;
    expired_date?: Date;
    statuses?: PaymentStatusEnum[];
    expiredDateBefore?: boolean;
  }): Promise<GetPaymentsType> {
    try {
      const paymentQuery =
        await this.paymentRepository.createQueryBuilder('payment');

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

  async changeExpiredStatuses() {
    const { payments } = await this.getPayments({
      expired_date: new Date(),
      statuses: [PaymentStatusEnum.Success],
      expiredDateBefore: true,
    });

    await this.paymentRepository.save(
      payments.map((p) => ({
        ...p,
        status: PaymentStatusEnum.End,
      })),
    );
  }
}
