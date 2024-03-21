import TelegramBot from 'node-telegram-bot-api';
import { PaymentStatusEnum, UserLanguageEnum } from 'src/helper';
import { PaymentService } from 'src/payment/payment.service';
import { User } from 'src/user/user.entity';

export const notifyUserAboutPlan = async (
  user: User,
  bot: TelegramBot,
  paymentService: PaymentService,
) => {
  const payment = await paymentService.findOne({
    user_id: user.id,
    statuses: [PaymentStatusEnum.Pending, PaymentStatusEnum.Success],
  });

  if (!payment) {
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
