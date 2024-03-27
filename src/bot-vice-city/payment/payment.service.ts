import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateDto, GetDto } from './dto';
import { GetPaymentsType, PaymentStatusEnum, errorHandler } from '../../helper';

import { Payment } from './payment.entity';
import { SubscriptionPlanService } from 'src/bot-vice-city/subscriptionPlan/subscriptionPlan.service';
import { addDays, addMonths, getDateWithoutHours } from 'src/helper/date';

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async update({ continueDays, ...dto }: CreateDto): Promise<Payment> {
    try {
      const plan = await this.findOne({
        id: dto.id,
      });

      return await this.paymentRepository.save({
        ...plan,
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
