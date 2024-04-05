import TelegramBot from 'node-telegram-bot-api';
import {
  BotEnum,
  LaterTypeEnum,
  PaymentStatusEnum,
  UserLanguageEnum,
} from 'src/helper';
import { sendEmail } from 'src/helper/mailer';
import { LogService } from 'src/log/log.service';
import { PaymentService } from 'src/bot-hesoyam/payment/payment.service';
import { UserHesoyam } from 'src/bot-hesoyam/user/user.entity';

export const notifyUserAboutPlan = async (
  user: UserHesoyam,
  bot: TelegramBot,
  paymentService: PaymentService,
  logService: LogService,
  botType: BotEnum,
) => {
  const payment = await paymentService.findOne({
    user_id: user.id,
    statuses: [PaymentStatusEnum.Pending, PaymentStatusEnum.Success],
    bot: botType,
  });

  if (!payment) {
    await sendEmail(
      user.email,
      LaterTypeEnum.ContinueBuyingPlan,
      user.language,
      logService,
      BotEnum.HESOYAM,
    );

    await bot.sendMessage(
      user.chat_id,
      user.language === UserLanguageEnum.UA
        ? 'Ви цікавились планами підписок. Бажаєте продовжити покупку? 🛒'
        : 'Вы интересовались планами подписок. Хотите продолжить покупку? 🛒',
      {
        parse_mode: 'HTML',
        reply_markup: {
          remove_keyboard: true,
          inline_keyboard: [
            [
              {
                text:
                  user.language === UserLanguageEnum.UA
                    ? '🗒️ Плани підписок'
                    : '🗒️ Планы подписок',
                callback_data: 'SendSubscriptionPlanKeyboard',
              },
            ],
          ],
        },
      },
    );
  }
};
