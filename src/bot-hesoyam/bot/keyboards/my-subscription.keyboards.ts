import TelegramBot from 'node-telegram-bot-api';
import { BotEnum, PaymentStatusEnum, UserLanguageEnum } from 'src/helper';
import { PaymentHesoyam } from '../../payment/payment.entity';
import { PaymentService } from '../../payment/payment.service';
import { UserHesoyam } from '../../user/user.entity';

export const sendMySubscriptionKeyboard = async (
  chat_id: number,
  message_id: number,
  bot: TelegramBot,
  user: UserHesoyam,
  paymentService: PaymentService,
  botType: BotEnum,
  edit = false,
) => {
  const lastPayment = await paymentService.findOne({
    user_id: user.id,
    statuses: [PaymentStatusEnum.Success],
    bot: botType,
  });

  let text;

  const inline_keyboard = [];

  if (lastPayment) {
    text = getPlanInfo(user.language, lastPayment);

    // inline_keyboard.push([
    //   {
    //     text:
    //       user.language === UserLanguageEnum.EN
    //         ? 'Continue the subscription at the old price'
    //         : user.language === UserLanguageEnum.UA
    //           ? 'Продовжити підписку за старою ціною'
    //           : 'Продолжить подписку по старой цене',
    //     callback_data: 'ContinueSubscription',
    //   },
    // ]);
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
              ? '🗒️ Плани навчання'
              : '🗒️ Планы обучения',
        callback_data: 'SendSubscriptionPlanKeyboard',
      },
    ],
  );

  if (!edit) {
    await bot.sendMessage(chat_id, text, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard,
      },
    });
  } else {
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
  }
};

const getPlanInfo = (
  language: UserLanguageEnum,
  lastPayment: PaymentHesoyam,
) => {
  switch (language) {
    case UserLanguageEnum.EN:
      return `📃 Your subscription plan is ${
        lastPayment.subscription_plan[`name${language}`]
      }`;

    case UserLanguageEnum.UA:
      return `📃 Ваша підписка: ${
        lastPayment.subscription_plan[`name${language}`]
      }`;

    case UserLanguageEnum.RU:
      return `📃 Ваша подписка: ${
        lastPayment.subscription_plan[`name${language}`]
      }`;
  }
};
