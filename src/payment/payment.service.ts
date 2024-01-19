import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateDto, GetDto } from './dto';
import { GetPaymentsType, PaymentStatusEnum, errorHandler } from '../helper';

import { Payment } from './payment.entity';
import { SubscriptionPlanService } from 'src/subscriptionPlan/subscriptionPlan.service';
import { addDays, addMonths } from 'src/helper/date';

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

      const expired_date = addDays(
        addMonths(new Date(), plan.months_count),
        continueDays,
      );

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

  async findOne({ id, user_id, status }: GetDto): Promise<Payment> {
    const paymentQuery = await this.paymentRepository
      .createQueryBuilder('payment')
      .where('payment.id = :id OR user_id = :user_id', {
        id,
        user_id,
      })
      .leftJoinAndSelect('payment.subscription_plan', 'subscription_plan')
      .withDeleted()
      .leftJoinAndSelect('payment.promocode', 'promocode')
      .withDeleted()
      .orderBy('payment.created_date', 'DESC')
      .withDeleted();

    if (status) {
      paymentQuery.andWhere('payment.status = :status', { status });
    }

    return paymentQuery.getOne();
  }

  async getPayments({
    user_id,
    expired_date,
    status,
  }: {
    user_id?: string;
    expired_date?: Date;
    status?: PaymentStatusEnum;
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
        paymentQuery
          .distinctOn(['payment.user_id'])
          .andWhere(`payment.expired_date <= :expired_date`, {
            expired_date,
          });
      }

      if (status) {
        paymentQuery.andWhere('payment.status = :status', { status });
      }

      const [payments, total] = await paymentQuery
        .leftJoinAndSelect('payment.subscription_plan', 'subscription_plan')
        .withDeleted()
        .leftJoinAndSelect('payment.promocode', 'promocode')
        .withDeleted()
        .leftJoinAndSelect('payment.payment_method', 'payment_method')
        .withDeleted()
        .leftJoinAndSelect('payment.updated_by', 'updated_by')
        .withDeleted()
        .orderBy('payment.created_date', 'DESC')
        .withDeleted()
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
