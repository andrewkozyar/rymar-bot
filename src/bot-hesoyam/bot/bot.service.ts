import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import TelegramBot from 'node-telegram-bot-api';
import { telegramBot } from '../../configs/telegram-bot.config';
import { RedisService } from '../../redis/redis.service';
import { UserService } from '../../bot-hesoyam/user/user.service';
import { SubscriptionPlanService } from 'src/bot-hesoyam/subscriptionPlan/subscriptionPlan.service';
import { PromocodeService } from 'src/bot-hesoyam/promocode/promocode.service';
import { PaymentService } from 'src/bot-hesoyam/payment/payment.service';
import { ChannelService } from 'src/bot-hesoyam/chanel/channel.service';
import { actionChannelPost } from './actions/channel_post.action';
import { actionMessage } from './actions/message.action';
import { actionCallbackQuery } from './actions/callback_query.action';
import { PaymentMethodService } from 'src/bot-hesoyam/paymentMethod/paymentMethod.service';
import { ConversionRateService } from 'src/conversionRate/conversionRate.service';
import { LogService } from 'src/log/log.service';
import { BotEnum } from 'src/helper';

@Injectable()
export class BotService {
  private bot: TelegramBot;
  private botManager: TelegramBot;

  constructor(
    private readonly configService: ConfigService,
    private userService: UserService,
    private redisService: RedisService,
    private planService: SubscriptionPlanService,
    private promocodeService: PromocodeService,
    private paymentService: PaymentService,
    private channelService: ChannelService,
    private paymentMethodService: PaymentMethodService,
    private rateService: ConversionRateService,
    private logService: LogService,
  ) {
    this.bot = telegramBot(configService, 'TELEGRAM_BOT_HESOYAM_TOKEN');
    this.botManager = telegramBot(
      configService,
      'TELEGRAM_BOT_HESOYAM_MANAGER_TOKEN',
    );

    this.startBots();
  }

  async startBots() {
    if (this.bot) {
      actionChannelPost(
        this.bot,
        this.channelService,
        this.logService,
        BotEnum.HESOYAM,
      );

      actionMessage(
        this.bot,
        this.userService,
        this.redisService,
        this.planService,
        this.promocodeService,
        this.paymentService,
        this.channelService,
        this.paymentMethodService,
        this.rateService,
        this.logService,
        BotEnum.HESOYAM,
      );

      actionCallbackQuery(
        this.bot,
        this.userService,
        this.redisService,
        this.planService,
        this.promocodeService,
        this.paymentService,
        this.channelService,
        this.paymentMethodService,
        this.rateService,
        this.logService,
        BotEnum.HESOYAM,
      );
    }

    if (this.botManager) {
      actionChannelPost(
        this.botManager,
        this.channelService,
        this.logService,
        BotEnum.HESOYAM_MANAGER,
      );

      actionMessage(
        this.botManager,
        this.userService,
        this.redisService,
        this.planService,
        this.promocodeService,
        this.paymentService,
        this.channelService,
        this.paymentMethodService,
        this.rateService,
        this.logService,
        BotEnum.HESOYAM_MANAGER,
      );

      actionCallbackQuery(
        this.botManager,
        this.userService,
        this.redisService,
        this.planService,
        this.promocodeService,
        this.paymentService,
        this.channelService,
        this.paymentMethodService,
        this.rateService,
        this.logService,
        BotEnum.HESOYAM_MANAGER,
      );
    }
  }
}
