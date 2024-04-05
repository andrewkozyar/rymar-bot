import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateUserDto, UpdateUserDto, GetUserDto } from './dto';
import {
  BotEnum,
  GetUsersHesoyamType,
  PaymentStatusEnum,
  errorHandler,
  trimEmail,
} from '../../helper';

import { UserHesoyam } from './user.entity';
import { PaymentService } from 'src/bot-hesoyam/payment/payment.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserHesoyam)
    private userRepository: Repository<UserHesoyam>,
    private paymentService: PaymentService,
  ) {}

  async create(dto: CreateUserDto): Promise<UserHesoyam> {
    try {
      return await this.userRepository.save({
        ...dto,
        chat_id: dto.chat_id.toString(),
      });
    } catch (e) {
      errorHandler(
        `Failed to create user`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        e,
      );
    }
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserHesoyam> {
    try {
      if (dto.email) {
        dto.email = trimEmail(dto.email);
      }

      const user = await this.userRepository.findOneBy({ id });

      return this.userRepository.save({
        ...user,
        ...dto,
      });
    } catch (e) {
      errorHandler(
        `Failed to update user`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        e,
      );
    }
  }

  async findOne({
    id,
    email,
    chat_id,
    name,
    bot,
  }: GetUserDto): Promise<UserHesoyam> {
    email = trimEmail(email);

    const user = await this.userRepository
      .createQueryBuilder('user')
      .where(
        '(user.id = :id OR email = :email OR chat_id = :chat_id OR name = :name)',
        {
          id,
          email,
          name,
          chat_id: chat_id?.toString(),
        },
      )
      .andWhere('user.bot = :bot', { bot })
      .getOne();

    return user;
  }

  async getUsers({
    orderBy = 'created_date',
    all,
    offset = 0,
    limit = 20,
    searchKey,
    expired_date,
    expiredDateBefore,
    names,
    notIn,
    bot,
  }: {
    orderBy?: 'name' | 'created_date';
    all?: boolean;
    offset?: number;
    limit?: number;
    searchKey?: string;
    expired_date?: Date;
    expiredDateBefore?: boolean;
    names?: string[];
    notIn?: string[];
    bot: BotEnum;
  }): Promise<GetUsersHesoyamType> {
    try {
      const userQuery = await this.userRepository
        .createQueryBuilder('user')
        .where('user.bot = :bot', { bot });

      if (searchKey) {
        userQuery.andWhere(
          `(LOWER(user.name) LIKE LOWER(:searchKey)
          OR LOWER(user.email) LIKE LOWER(:searchKey))`,
          {
            searchKey: `%${searchKey}%`,
          },
        );
      }

      if (names?.length) {
        userQuery.andWhere('user.name IN (:...names)', {
          names,
        });
      }

      if (expired_date) {
        const { payments } = await this.paymentService.getPayments({
          expired_date,
          statuses: [PaymentStatusEnum.Success],
          expiredDateBefore,
          bot,
        });

        if (!payments.length) {
          return {
            users: [],
            total: 0,
          };
        }

        userQuery.andWhere('user.id IN (:...ids)', {
          ids: payments.map((p) => p.user_id),
        });
      }

      if (notIn?.length) {
        userQuery.andWhere('user.id NOT IN (:...notIn)', {
          notIn,
        });
      }

      if (!all) {
        userQuery.skip(offset).take(limit);
      }

      if (orderBy === 'created_date') {
        userQuery.orderBy('user.created_date', 'DESC');
      } else if (orderBy === 'name') {
        userQuery.orderBy('user.name', 'ASC');
      }

      const [users, total] = await userQuery.getManyAndCount();

      return {
        users,
        total,
      };
    } catch (e) {
      errorHandler(`Failed to get users`, HttpStatus.INTERNAL_SERVER_ERROR, e);
    }
  }
}
