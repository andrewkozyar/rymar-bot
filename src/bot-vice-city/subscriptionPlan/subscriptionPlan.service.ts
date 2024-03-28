import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateDto, UpdateDto, GetDto } from './dto';
import {
  GetSubscriptionPlansType,
  MessageType,
  errorHandler,
} from '../../helper';

import { SubscriptionPlan } from './subscriptionPlan.entity';

@Injectable()
export class SubscriptionPlanService {
  constructor(
    @InjectRepository(SubscriptionPlan)
    private subscriptionPlanRepository: Repository<SubscriptionPlan>,
  ) {}

  async create(dto: CreateDto = {}): Promise<SubscriptionPlan> {
    try {
      const plan = await this.subscriptionPlanRepository.save(dto);

      return await this.findOne({ id: plan.id });
    } catch (e) {
      errorHandler(
        `Failed to create subscriptionPlan`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        e,
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async update({ id, field, ...dto }: UpdateDto): Promise<SubscriptionPlan> {
    try {
      const subscriptionPlan = await this.subscriptionPlanRepository.findOneBy({
        id,
      });

      await this.subscriptionPlanRepository.save({
        ...subscriptionPlan,
        ...dto,
      });

      return await this.findOne({ id: subscriptionPlan.id });
    } catch (e) {
      errorHandler(
        `Failed to update subscriptionPlan`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        e,
      );
    }
  }

  async updateChannel({
    id,
    channelId,
    add,
  }: {
    id: string;
    channelId: string;
    add: boolean;
  }) {
    try {
      const subscriptionPlan = await this.findOne({
        id,
      });

      await this.subscriptionPlanRepository.save({
        ...subscriptionPlan,
        channels: add
          ? [...subscriptionPlan.channels, { id: channelId }]
          : subscriptionPlan.channels.filter((ch) => ch.id !== channelId),
      });

      return true;
    } catch (e) {
      errorHandler(
        `Failed to update subscriptionPlan`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        e,
      );
    }
  }

  async remove(id: string): Promise<MessageType> {
    try {
      await this.subscriptionPlanRepository.softDelete({ id });
      return { message: true };
    } catch (e) {
      errorHandler(
        `Failed to remove subscriptionPlan`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        e,
      );
    }
  }

  async findOne({ id, withDeleted }: GetDto): Promise<SubscriptionPlan> {
    const subscriptionPlan = await this.subscriptionPlanRepository
      .createQueryBuilder('subscriptionPlan')
      .leftJoinAndSelect('subscriptionPlan.channels', 'channels')
      .where('subscriptionPlan.id = :id', {
        id,
      });

    if (withDeleted) {
      subscriptionPlan.withDeleted();
    }

    return subscriptionPlan.getOne();
  }

  async getPlans(
    is_published: boolean = null,
    offset: number = 0,
    limit: number = 20,
    searchKey?: string,
  ): Promise<GetSubscriptionPlansType> {
    try {
      const subscriptionPlanQuery =
        await this.subscriptionPlanRepository.createQueryBuilder(
          'subscriptionPlan',
        );

      if (searchKey) {
        subscriptionPlanQuery.andWhere(
          `(LOWER(subscriptionPlan.name) LIKE LOWER(:searchKey))`,
          {
            searchKey: `%${searchKey}%`,
          },
        );
      }

      if (is_published !== null) {
        subscriptionPlanQuery.andWhere(
          `subscriptionPlan.is_published = :is_published`,
          {
            is_published,
          },
        );
      }

      const [subscriptionPlans, total] = await subscriptionPlanQuery
        .orderBy('subscriptionPlan.position', 'ASC')
        .skip(offset)
        .take(limit)
        .getManyAndCount();

      return {
        subscriptionPlans,
        total,
      };
    } catch (e) {
      errorHandler(
        `Failed to get subscriptionPlans`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        e,
      );
    }
  }
}
