import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import TelegramBot from 'node-telegram-bot-api';
import { telegramBot } from '../configs/telegram-bot.config';
import { RedisService } from '../redis/redis.service';
import { UserService } from '../user/user.service';
import {
  PayDataInterface,
  PaymentStatusEnum,
  UserLanguageEnum,
  errorHandler,
} from 'src/helper';
import { SubscriptionPlanService } from 'src/subscriptionPlan/subscriptionPlan.service';
import { PromocodeService } from 'src/promocode/promocode.service';
import { PaymentService } from 'src/payment/payment.service';
import { ChannelService } from 'src/chanel/channel.service';
import { User } from 'src/user/user.entity';
import { actionChannelPost } from './actions/channel_post.action';
import { actionMessage } from './actions/message.action';
import { actionCallbackQuery } from './actions/callback_query.action';
import { PaymentMethodService } from 'src/paymentMethod/paymentMethod.service';
import { ConversionRateService } from 'src/conversionRate/conversionRate.service';

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
    private paymentMethodService: PaymentMethodService,
    private rateService: ConversionRateService,
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
      this.paymentMethodService,
      this.rateService,
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
    );
  }

  async notifyUsers(users: User[], expiredDays: number) {
    return await Promise.all(
      users.map(async (user) => {
        const lastPayment = await this.paymentService.findOne({
          user_id: user.id,
          status: PaymentStatusEnum.Success,
        });

        const payData: PayDataInterface = {
          amount: lastPayment.subscription_plan.price,
          subscription_plan_id: lastPayment.subscription_plan_id,
          newPrice: lastPayment.price_usd,
          isContinue: true,
        };

        await this.redisService.add(
          `ContinueSubscription-${user.id}`,
          JSON.stringify(payData),
        );

        return this.bot.sendMessage(
          user.chat_id,
          user.language === UserLanguageEnum.EN
            ? `‼️ Your subscription expires in ${expiredDays} days!
You still have the option to renew your subscription at the old price.`
            : user.language === UserLanguageEnum.UA
              ? `‼️ Термін дії вашої підписки закінчується через ${expiredDays} днів!
У вас ще є можливість продовжити підписку за старою ціною.`
              : `‼️ Срок действия вашей подписки истекает через ${expiredDays} дней!
У вас еще есть возможность продлить подписку по старой цене.`,
          {
            reply_markup: {
              remove_keyboard: true,
              inline_keyboard: [
                [
                  {
                    text:
                      user.language === UserLanguageEnum.EN
                        ? 'Continue the subscription at the old price'
                        : user.language === UserLanguageEnum.UA
                          ? 'Продовжити підписку за старою ціною'
                          : 'Продолжить подписку по старой цене',
                    callback_data: 'ContinueSubscription',
                  },
                ],
              ],
            },
          },
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
            user.language === UserLanguageEnum.EN
              ? `‼️ Your subscription has expired! You have been removed from all channels.

If you could not solve the problem, or you think that an error has occurred, contact support via the "🤝 Support" button`
              : user.language === UserLanguageEnum.UA
                ? `‼️ Термін дії вашої підписки закінчився! Вас було видалено з усіх каналів.

Якщо ви не змогли вирішити проблему, або вважаєте що сталася помилка, зверніться за підтримкою по кнопці "🤝 Допомога`
                : `‼️ Срок действия вашей подписки истек! Вы были удалены со всех каналов.

Если вы не смогли решить проблему, или считаете произошедшую ошибку, обратитесь за поддержкой по кнопке "🤝 Помощь`,
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
