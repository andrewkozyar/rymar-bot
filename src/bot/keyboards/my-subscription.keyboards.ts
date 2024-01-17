import TelegramBot from 'node-telegram-bot-api';
import {
  PayDataInterface,
  PaymentStatusEnum,
  UserLanguageEnum,
} from 'src/helper';
import { getDaysDifference } from 'src/helper/date';
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

  const text = lastPayment
    ? getPlanInfo(user.language, lastPayment)
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

const getPlanInfo = (language: UserLanguageEnum, lastPayment: Payment) => {
  switch (language) {
    case UserLanguageEnum.EN:
      return `📃 Your subscription plan is ${
        lastPayment.subscription_plan[`name${language}`]
      }

- <b>Start date</b>: ${lastPayment.created_date}
- <b>Expired date</b>: ${lastPayment.expired_date}
- <b>Days left</b>: ${getDaysDifference(
        Date.now(),
        lastPayment.expired_date.getMilliseconds(),
      )}
      
‼️ You have the option to renew your subscription at the old price`;

    case UserLanguageEnum.UA:
      return `📃 Ваша підписка: ${
        lastPayment.subscription_plan[`name${language}`]
      }

- <b>Дата початку</b>: ${lastPayment.created_date}
- <b>Дата закінчення</b>: ${lastPayment.expired_date}
- <b>Залишилось днів</b>: ${getDaysDifference(
        Date.now(),
        lastPayment.expired_date.getMilliseconds(),
      )}
      
‼️ У вас є можливість продовжити підписку за старою ціною`;

    case UserLanguageEnum.RU:
      return `📃 Ваша подписка: ${
        lastPayment.subscription_plan[`name${language}`]
      }

- <b>Дата начала</b>: ${lastPayment.created_date}
- <b>Дата окончания</b>: ${lastPayment.expired_date}
- <b>Осталось дней</b>: ${getDaysDifference(
        Date.now(),
        lastPayment.expired_date.getMilliseconds(),
      )}
      
‼️ У вас есть возможность продлить подписку по старой цене`;
  }
};
