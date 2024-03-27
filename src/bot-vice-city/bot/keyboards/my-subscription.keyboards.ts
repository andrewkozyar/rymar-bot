import TelegramBot from 'node-telegram-bot-api';
import { PaymentStatusEnum, UserLanguageEnum } from 'src/helper';
import { getDateWithoutHours, getDaysDifference } from 'src/helper/date';
import { Payment } from 'src/bot-vice-city/payment/payment.entity';
import { PaymentService } from 'src/bot-vice-city/payment/payment.service';
import { User } from 'src/bot-vice-city/user/user.entity';

export const sendMySubscriptionKeyboard = async (
  id: number,
  bot: TelegramBot,
  user: User,
  paymentService: PaymentService,
) => {
  const lastPayment = await paymentService.findOne({
    user_id: user.id,
    statuses: [PaymentStatusEnum.Success],
  });

  let text;

  const inline_keyboard = [];

  if (lastPayment) {
    const continueDays = getDaysDifference(
      new Date(),
      lastPayment.expired_date,
    );
    const expiredDate = getDateWithoutHours(
      lastPayment.expired_date,
    ).toDateString();

    text = getPlanInfo(user.language, lastPayment, continueDays, expiredDate);

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
  } else {
    text =
      user.language === UserLanguageEnum.EN
        ? 'You do not have an active subscription'
        : user.language === UserLanguageEnum.UA
          ? 'У вас немає активної підписки'
          : 'У вас нет активной подписки';
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

export const editMySubscriptionKeyboard = async (
  chat_id: number,
  message_id: number,
  bot: TelegramBot,
  user: User,
  paymentService: PaymentService,
) => {
  const lastPayment = await paymentService.findOne({
    user_id: user.id,
    statuses: [PaymentStatusEnum.Success],
  });

  let text;

  const inline_keyboard = [];

  if (lastPayment) {
    const continueDays = getDaysDifference(
      new Date(),
      lastPayment.expired_date,
    );
    const expiredDate = getDateWithoutHours(
      lastPayment.expired_date,
    ).toDateString();

    text = getPlanInfo(user.language, lastPayment, continueDays, expiredDate);

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
  } else {
    text =
      user.language === UserLanguageEnum.EN
        ? 'You do not have an active subscription'
        : user.language === UserLanguageEnum.UA
          ? 'У вас немає активної підписки'
          : 'У вас нет активной подписки';
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

  await bot.editMessageText(text, {
    chat_id,
    message_id,
    parse_mode: 'HTML',
  });

  await bot.editMessageReplyMarkup(
    {
      inline_keyboard,
    },
    {
      chat_id,
      message_id,
    },
  );
};

const getPlanInfo = (
  language: UserLanguageEnum,
  lastPayment: Payment,
  continueDays: number,
  expiredDate: string,
) => {
  switch (language) {
    case UserLanguageEnum.EN:
      return `📃 Your subscription plan is ${
        lastPayment.subscription_plan[`name${language}`]
      }

- <b>Start date</b>: ${lastPayment.created_date.toDateString()}
- <b>Expired date</b>: ${expiredDate}
- <b>Days left</b>: ${continueDays}
      
🎁 You have the option to renew your subscription at the old price`;

    case UserLanguageEnum.UA:
      return `📃 Ваша підписка: ${
        lastPayment.subscription_plan[`name${language}`]
      }

- <b>Дата початку</b>: ${lastPayment.created_date.toDateString()}
- <b>Дата закінчення</b>: ${expiredDate}
- <b>Залишилось днів</b>: ${continueDays}
      
🎁 У вас є можливість продовжити підписку за старою ціною`;

    case UserLanguageEnum.RU:
      return `📃 Ваша подписка: ${
        lastPayment.subscription_plan[`name${language}`]
      }

- <b>Дата начала</b>: ${lastPayment.created_date.toDateString()}
- <b>Дата окончания</b>: ${expiredDate}
- <b>Осталось дней</b>: ${continueDays}
      
🎁 У вас есть возможность продлить подписку по старой цене`;
  }
};
