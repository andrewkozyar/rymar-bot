import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import TelegramBot from 'node-telegram-bot-api';

import { CreateDto, GetDto } from './dto';
import { BotEnum, UserLanguageEnum, errorHandler } from '../../helper';

import { ChannelHesoyam } from './channel.entity';
import { User } from 'src/bot-vice-city/user/user.entity';
import { LogService } from 'src/log/log.service';

@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(ChannelHesoyam)
    private channelRepository: Repository<ChannelHesoyam>,
    private logService: LogService,
  ) {}
  async create({ chat_id, ...dto }: CreateDto): Promise<ChannelHesoyam> {
    try {
      const channel = await this.findOne({ chat_id, bot: dto.bot });

      if (!channel || channel.name !== dto.name) {
        return await this.channelRepository.save({
          ...dto,
          is_for_subscription: !channel || channel.is_for_subscription,
          id: channel?.id,
          chat_id: chat_id.toString(),
        });
      }

      return channel;
    } catch (e) {
      errorHandler(
        `Failed to create channel`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        e,
      );
    }
  }

  async findOne({ id, name, chat_id, bot }: GetDto): Promise<ChannelHesoyam> {
    const channel = await this.channelRepository
      .createQueryBuilder('channel')
      .where('(channel.id = :id OR name = :name OR chat_id = :chat_id)', {
        id,
        name,
        chat_id: chat_id.toString(),
      })
      .andWhere('channel.bot = :bot', { bot })
      .getOne();

    return channel;
  }

  async find(
    is_for_subscription: boolean,
    bot: BotEnum,
    searchKey?: string,
  ): Promise<ChannelHesoyam[]> {
    try {
      const channelQuery = this.channelRepository
        .createQueryBuilder('channel')
        .where('channel.bot = :bot', { bot });

      if (searchKey) {
        channelQuery.andWhere(`(LOWER(channel.name) LIKE LOWER(:searchKey))`, {
          searchKey: `%${searchKey}%`,
        });
      }

      if (is_for_subscription) {
        channelQuery.andWhere(
          `channel.is_for_subscription = :is_for_subscription`,
          {
            is_for_subscription,
          },
        );
      }

      const channels = await channelQuery.getMany();

      return channels;
    } catch (e) {
      errorHandler(
        `Failed to get channels`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        e,
      );
    }
  }

  async sendChannelsLinks(
    bot: TelegramBot,
    user: User,
    channels: ChannelHesoyam[],
  ) {
    try {
      if (channels.length) {
        await Promise.all(
          channels.map(async (channel) => {
            try {
              const link = await bot.createChatInviteLink(
                Number(channel.chat_id),
                {
                  member_limit: 1,
                  expire_date: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
                },
              );

              await bot.sendMessage(
                user.chat_id,
                `${
                  channel.type === 'channel'
                    ? user.language === UserLanguageEnum.EN
                      ? 'ChannelHesoyam'
                      : 'Канал'
                    : user.language === UserLanguageEnum.EN
                      ? 'Group'
                      : 'Чат'
                } ${channel.name}.
  
  ${link.invite_link}`,
              );
            } catch (e) {
              errorHandler(
                `Failed to sendChannelsLinks`,
                HttpStatus.INTERNAL_SERVER_ERROR,
                e,
              );
            }
          }),
        );
      }
    } catch (e) {
      errorHandler(
        `Failed to sendChannelsLinks`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        e,
      );
    }
  }
}
