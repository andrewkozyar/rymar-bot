import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateDto, GetDto } from './dto';
import { GetPaymentsType, errorHandler } from '../helper';

import { Payment } from './payment.entity';
import { SubscriptionPlanService } from 'src/subscriptionPlan/subscriptionPlan.service';
import { addMonths } from 'src/helper/date';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    private planService: SubscriptionPlanService,
  ) {}

  async create(dto: CreateDto): Promise<Payment> {
    try {
      const plan = await this.planService.findOne({
        id: dto.subscription_plan_id,
      });

      const expired_date = addMonths(new Date(), plan.months_count);

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

  async findOne({ id, user_id }: GetDto): Promise<Payment> {
    const payment = await this.paymentRepository
      .createQueryBuilder('payment')
      .where('payment.id = :id OR user_id = :user_id', {
        id,
        user_id,
      })
      .leftJoinAndSelect('payment.subscription_plan', 'subscription_plan')
      .leftJoinAndSelect('payment.promocode', 'promocode')
      .orderBy('payment.created_date', 'DESC')
      .getOne();

    return payment;
  }

  async getPayments({
    user_id,
    expired_date,
  }: {
    user_id?: string;
    expired_date?: Date;
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
          .andWhere(`payment.expired_date = :expired_date`, {
            expired_date,
          });
      }

      const [payments, total] = await paymentQuery
        .leftJoinAndSelect('payment.subscription_plan', 'subscription_plan')
        .leftJoinAndSelect('payment.promocode', 'promocode')
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
