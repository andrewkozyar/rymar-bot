import TelegramBot from 'node-telegram-bot-api';
import { PaymentStatusEnum, UserLanguageEnum } from 'src/helper';
import { Payment } from 'src/payment/payment.entity';
import { PaymentService } from 'src/payment/payment.service';
import { User } from 'src/user/user.entity';

export const sendMySubscriptionKeyboard = async (
  id: number,
  bot: TelegramBot,
  user: User,
  paymentService: PaymentService,
) => {
  const lastPayment = await paymentService.findOne({
    user_id: user.id,
    status: PaymentStatusEnum.Success,
  });

  const text = lastPayment
    ? getPlanInfo(user.language, lastPayment)
    : user.language === UserLanguageEnum.EN
      ? 'You do not have an active subscription'
      : user.language === UserLanguageEnum.UA
        ? 'У вас немає активної підписки'
        : 'У вас нет активной подписки';

  await bot.sendMessage(id, text, {
    reply_markup: {
      remove_keyboard: true,
      inline_keyboard: [
        [
          {
            text: `💵 ${
              user.language === UserLanguageEnum.EN
                ? 'List of transactions'
                : user.language === UserLanguageEnum.UA
                  ? 'Список транзакцій'
                  : 'Список транзакций'
            }`,
            callback_data: 'ListOfTransactions',
          },
        ],
        [
          {
            text:
              user.language === UserLanguageEnum.EN
                ? '🗒️ Subscription plans'
                : user.language === UserLanguageEnum.UA
                  ? '🗒️ Плани підписок'
                  : '🗒️ Планы подписок',
            callback_data: 'SendSubscriptionPlanKeyboard',
          },
        ],
      ],
    },
  });
};

const getPlanInfo = (language: UserLanguageEnum, lastPayment: Payment) => {
  switch (language) {
    case UserLanguageEnum.EN:
      return `📃 Your subscription plan is ${
        lastPayment.subscription_plan[`name${language}`]
      }

- Start date: ${lastPayment.created_date}
- Expired date: ${lastPayment.expired_date}`;

    case UserLanguageEnum.UA:
      return `📃 Ваша підписка: ${
        lastPayment.subscription_plan[`name${language}`]
      }

- Дата початку: ${lastPayment.created_date}
- Дата закінчення: ${lastPayment.expired_date}`;

    case UserLanguageEnum.RU:
      return `📃 Ваша подписка: ${
        lastPayment.subscription_plan[`name${language}`]
      }

- Дата начала: ${lastPayment.created_date}
- Дата окончания: ${lastPayment.expired_date}`;
  }
};
