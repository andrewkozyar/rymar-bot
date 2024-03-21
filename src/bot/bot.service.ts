import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import TelegramBot from 'node-telegram-bot-api';
import { telegramBot } from '../configs/telegram-bot.config';
import { RedisService } from '../redis/redis.service';
import { UserService } from '../user/user.service';
import { LaterTypeEnum, LogTypeEnum, UserLanguageEnum } from 'src/helper';
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
import { LogService } from 'src/log/log.service';
import { admins } from './keyboards/account.keyboards';
import { sendEmail } from 'src/helper/mailer';

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
    private logService: LogService,
  ) {
    this.bot = telegramBot(configService);

    this.startBot();
  }

  async startBot() {
    actionChannelPost(this.bot, this.channelService, this.logService);

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
    );
  }

  async notifyUsers(users: User[], expiredDays: number) {
    return await Promise.all(
      users.map(async (user) => {
        await sendEmail(
          user.email,
          LaterTypeEnum.EndPlanIn,
          user.language,
          this.logService,
          {
            days: expiredDays,
          },
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
                    callback_data: 'ContinueSubscription;notification',
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
          await this.channelService.deleteUserFromChannels(this.bot, user);

          const managers = await this.userService.getUsers({
            names: admins,
          });

          await Promise.all(
            managers.users.map(async (manager) => {
              return this.bot.sendMessage(
                manager.chat_id,
                manager.language === UserLanguageEnum.EN
                  ? `‼️ Users @${user.name} subscription has expired! He have been removed from all channels.`
                  : manager.language === UserLanguageEnum.UA
                    ? `‼️ Термін дії підписки користувача @${user.name} закінчився! Його було видалено з усіх каналів.`
                    : `‼️ Срок действия подписки пользователя @${user.name} истек! Он был удален со всех каналов`,
              );
            }),
          );

          await sendEmail(
            user.email,
            LaterTypeEnum.EndPlan,
            user.language,
            this.logService,
          );

          return await this.bot.sendMessage(
            user.chat_id,
            user.language === UserLanguageEnum.EN
              ? `‼️ Your subscription has expired! You have been removed from all channels.

If you think that an error has occurred, contact support via the "🤝 Support" button`
              : user.language === UserLanguageEnum.UA
                ? `‼️ Термін дії вашої підписки закінчився! Вас було видалено з усіх каналів.

Якщо ви вважаєте що сталася помилка, зверніться за підтримкою по кнопці "🤝 Допомога"`
                : `‼️ Срок действия вашей подписки истек! Вы были удалены со всех каналов.

Если вы считаете что произошла ошибка, обратитесь за поддержкой по кнопке "🤝 Помощь"`,
          );
        } catch (e) {
          this.logService.create({
            action: 'deleteExpiredUsers',
            info: JSON.stringify(e),
            type: LogTypeEnum.ERROR,
          });
        }
      }),
    );
  }
}
