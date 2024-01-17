import TelegramBot from 'node-telegram-bot-api';
import {
  PayDataInterface,
  PaymentStatusEnum,
  UserLanguageEnum,
} from 'src/helper';
import { getDateWithoutHours, getDaysDifference } from 'src/helper/date';
import { Payment } from 'src/payment/payment.entity';
import { PaymentService } from 'src/payment/payment.service';
import { RedisService } from 'src/redis/redis.service';
import { User } from 'src/user/user.entity';

export const sendMySubscriptionKeyboard = async (
  id: number,
  bot: TelegramBot,
  user: User,
  paymentService: PaymentService,
  redisService: RedisService,
) => {
  const lastPayment = await paymentService.findOne({
    user_id: user.id,
    status: PaymentStatusEnum.Success,
  });

  const continueDays = getDaysDifference(new Date(), lastPayment.expired_date);

  const text = lastPayment
    ? getPlanInfo(user.language, lastPayment, continueDays)
    : user.language === UserLanguageEnum.EN
      ? 'You do not have an active subscription'
      : user.language === UserLanguageEnum.UA
        ? 'У вас немає активної підписки'
        : 'У вас нет активной подписки';

  const inline_keyboard = [];

  if (lastPayment) {
    const payData: PayDataInterface = {
      amount: lastPayment.subscription_plan.price,
      subscription_plan_id: lastPayment.subscription_plan_id,
      newPrice: lastPayment.price_usd,
      isContinue: true,
      promocode_id: null,
      continueDays,
    };

    await redisService.add(
      `ContinueSubscription-${user.id}`,
      JSON.stringify(payData),
    );

    inline_keyboard.push([
      {
        text:
          user.language === UserLanguageEnum.EN
            ? 'Continue the subscription at the old price'
            : user.language === UserLanguageEnum.UA
              ? 'Продовжити підписку за старою ціною'
              : 'Продолжить подписку по старой цене',
        callback_data: 'ContinueSubscription',
      },
    ]);
  }

  inline_keyboard.push(
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
  );

  await bot.sendMessage(id, text, {
    parse_mode: 'HTML',
    reply_markup: {
      remove_keyboard: true,
      inline_keyboard,
    },
  });
};

const getPlanInfo = (
  language: UserLanguageEnum,
  lastPayment: Payment,
  continueDays: number,
) => {
  switch (language) {
    case UserLanguageEnum.EN:
      return `📃 Your subscription plan is ${
        lastPayment.subscription_plan[`name${language}`]
      }

- <b>Start date</b>: ${lastPayment.created_date}
- <b>Expired date</b>: ${getDateWithoutHours(lastPayment.expired_date)}
- <b>Days left</b>: ${continueDays}
      
‼️ You have the option to renew your subscription at the old price`;

    case UserLanguageEnum.UA:
      return `📃 Ваша підписка: ${
        lastPayment.subscription_plan[`name${language}`]
      }

- <b>Дата початку</b>: ${lastPayment.created_date}
- <b>Дата закінчення</b>: ${getDateWithoutHours(lastPayment.expired_date)}
- <b>Залишилось днів</b>: ${continueDays}
      
‼️ У вас є можливість продовжити підписку за старою ціною`;

    case UserLanguageEnum.RU:
      return `📃 Ваша подписка: ${
        lastPayment.subscription_plan[`name${language}`]
      }

- <b>Дата начала</b>: ${lastPayment.created_date}
- <b>Дата окончания</b>: ${getDateWithoutHours(lastPayment.expired_date)}
- <b>Осталось дней</b>: ${continueDays}
      
‼️ У вас есть возможность продлить подписку по старой цене`;
  }
};
