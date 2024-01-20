import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import TelegramBot from 'node-telegram-bot-api';

import { CreateDto, GetDto } from './dto';
import { MessageType, UserLanguageEnum, errorHandler } from '../helper';

import { Channel } from './channel.entity';
import { User } from 'src/user/user.entity';
import { LogService } from 'src/log/log.service';

@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(Channel)
    private channelRepository: Repository<Channel>,
    private logService: LogService,
  ) {}
  async create({ chat_id, ...dto }: CreateDto): Promise<Channel> {
    try {
      const channel = await this.findOne({ chat_id });

      if (!channel || channel.name !== dto.name) {
        return await this.channelRepository.save({
          ...dto,
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

  async remove(id: string): Promise<MessageType> {
    try {
      await this.channelRepository.delete({ id });
      return { message: true };
    } catch (e) {
      errorHandler(
        `Failed to remove channel`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        e,
      );
    }
  }

  async findOne({ id, name, chat_id }: GetDto): Promise<Channel> {
    const channel = await this.channelRepository
      .createQueryBuilder('channel')
      .where('channel.id = :id OR name = :name OR chat_id = :chat_id', {
        id,
        name,
        chat_id: chat_id.toString(),
      })
      .getOne();

    return channel;
  }

  async find(searchKey?: string): Promise<Channel[]> {
    try {
      const channelQuery = this.channelRepository.createQueryBuilder('channel');

      if (searchKey) {
        channelQuery.andWhere(`(LOWER(channel.name) LIKE LOWER(:searchKey))`, {
          searchKey: `%${searchKey}%`,
        });
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

  async deleteUserFromChannels(bot: TelegramBot, user: User) {
    try {
      const channels = await this.find();

      if (channels.length) {
        await Promise.all(
          channels.map((c) => {
            bot
              .restrictChatMember(Number(c.chat_id), Number(user.chat_id))
              .catch((e) =>
                this.logService.create({
                  action: `restrictChatMember userId: ${user.id}, chatId: ${c.chat_id}`,
                  info: JSON.stringify(e),
                  type: 'error',
                }),
              );
          }),
        );
      }
    } catch (e) {
      errorHandler(
        `Failed to delete user from channels`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        e,
      );
    }
  }

  async sendChannelsLinks(bot: TelegramBot, user: User) {
    try {
      const channels = await this.find();

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
                      ? 'Channel'
                      : 'Канал'
                    : user.language === UserLanguageEnum.EN
                      ? 'Group'
                      : 'Чат'
                } ${channel.name}.
  
  ${link.invite_link}`,
              );
            } catch (e) {
              await this.remove(channel.id);
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
