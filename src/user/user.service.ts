import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateUserDto, UpdateUserDto, GetUserDto } from './dto';
import {
  GetUsersType,
  PaymentStatusEnum,
  errorHandler,
  trimEmail,
} from '../helper';

import { User } from './user.entity';
import { PaymentService } from 'src/payment/payment.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private paymentService: PaymentService,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
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

  async update(id: string, dto: UpdateUserDto): Promise<User> {
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

  async findOne({ id, email, chat_id, name }: GetUserDto): Promise<User> {
    email = trimEmail(email);

    const user = await this.userRepository
      .createQueryBuilder('user')
      .where(
        'user.id = :id OR email = :email OR chat_id = :chat_id OR name = :name',
        {
          id,
          email,
          name,
          chat_id: chat_id?.toString(),
        },
      )
      .getOne();

    return user;
  }

  async getUsers({
    offset = 0,
    limit = 20,
    searchKey,
    expired_date,
    names,
  }: {
    offset?: number;
    limit?: number;
    searchKey?: string;
    expired_date?: Date;
    names?: string[];
  }): Promise<GetUsersType> {
    try {
      const userQuery = await this.userRepository.createQueryBuilder('user');

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
          status: PaymentStatusEnum.Success,
        });

        userQuery.andWhere('user.id IN (:...ids)', {
          ids: payments.map((p) => p.user_id),
        });
      }

      const [users, total] = await userQuery
        .orderBy('user.created_date', 'DESC')
        .skip(offset)
        .take(limit)
        .getManyAndCount();

      return {
        users,
        total,
      };
    } catch (e) {
      errorHandler(`Failed to get users`, HttpStatus.INTERNAL_SERVER_ERROR, e);
    }
  }

  async getOneByEmail(email: string, exc_token?: string): Promise<User> {
    return this.userRepository
      .createQueryBuilder('active_user')
      .addSelect('active_user.password')
      .where(
        'active_user.email = :email OR active_user.exc_token = :exc_token',
        { email: trimEmail(email), exc_token },
      )
      .getOne();
  }
}
