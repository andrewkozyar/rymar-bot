import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import TelegramBot from 'node-telegram-bot-api';
import { telegramBot } from '../configs/telegram-bot.config';
import { RedisService } from '../redis/redis.service';
import { UserService } from '../user/user.service';
import { errorHandler } from 'src/helper';
import { SubscriptionPlanService } from 'src/subscriptionPlan/subscriptionPlan.service';
import { PromocodeService } from 'src/promocode/promocode.service';
import { PaymentService } from 'src/payment/payment.service';
import { ChannelService } from 'src/chanel/channel.service';
import { User } from 'src/user/user.entity';
import { actionChannelPost } from './actions/channel_post.action';
import { actionMessage } from './actions/message.action';
import { actionCallbackQuery } from './actions/callback_query.action';

@Injectable()
export class BotService {
  private bot: TelegramBot;

  constructor(
    private readonly configService: ConfigService,
    private userService: UserService,
    private redisService: RedisService,
    private planService: SubscriptionPlanService,
    private promocodeService: PromocodeService,
    private paymentService: PaymentService,
    private channelService: ChannelService,
  ) {
    this.bot = telegramBot(configService);

    this.startBot();
  }

  async startBot() {
    actionChannelPost(this.bot, this.channelService);

    actionMessage(
      this.bot,
      this.userService,
      this.redisService,
      this.planService,
      this.promocodeService,
      this.paymentService,
      this.channelService,
    );

    actionCallbackQuery(
      this.bot,
      this.userService,
      this.redisService,
      this.planService,
      this.promocodeService,
      this.paymentService,
      this.channelService,
    );
  }

  async notifyUsers(users: User[], expiredDays: number) {
    return await Promise.all(
      users.map((user) => {
        return this.bot.sendMessage(
          user.chat_id,
          `Your subscription expires in ${expiredDays} days!`,
        );
      }),
    );
  }

  async deleteExpiredUsers(users: User[]) {
    return await Promise.all(
      users.map(async (user) => {
        try {
          await this.channelService.deleteUserFromChannels(
            this.bot,
            user.chat_id,
          );

          return this.bot.sendMessage(
            user.chat_id,
            `Your subscription expired! You was kicked from channels.`,
          );
        } catch (e) {
          errorHandler(
            'Failed deleteExpiredUsers',
            HttpStatus.INTERNAL_SERVER_ERROR,
            e,
          );
        }
      }),
    );
  }
}
