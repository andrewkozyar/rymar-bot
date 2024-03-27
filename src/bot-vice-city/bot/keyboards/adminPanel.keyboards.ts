import TelegramBot from 'node-telegram-bot-api';
import { UserLanguageEnum } from 'src/helper';
import { User } from 'src/bot-vice-city/user/user.entity';

export const sendAdminPanelKeyboard = async (
  id: number,
  bot: TelegramBot,
  user: User,
) => {
  await bot.sendMessage(
    id,
    user.language === UserLanguageEnum.EN
      ? '👔 Your admin panel:'
      : user.language === UserLanguageEnum.UA
        ? '👔 Ваша панель адміністратора:'
        : '👔 Ваша админ-панель:',
    {
      reply_markup: {
        remove_keyboard: true,
        inline_keyboard: [
          [
            {
              text:
                user.language === UserLanguageEnum.EN
                  ? '📋 Subscription plans'
                  : user.language === UserLanguageEnum.UA
                    ? '📋 Плани підписок'
                    : '📋 Планы подписки',
              callback_data: 'SendSubscriptionPlanAdminKeyboard',
            },
            {
              text: '🎁 Promo codes',
              callback_data: 'AdminPromocodes',
            },
          ],
          [
            {
              text:
                user.language === UserLanguageEnum.EN
                  ? '🗃️ User transactions'
                  : user.language === UserLanguageEnum.UA
                    ? '🗃️ Транзакції'
                    : '🗃️ Транзакции',
              callback_data: 'AdminUserTransactions',
            },
            {
              text:
                user.language === UserLanguageEnum.EN
                  ? '💸 Payment methods'
                  : user.language === UserLanguageEnum.UA
                    ? '💸 Методи оплати'
                    : '💸 Способы оплаты',
              callback_data: 'AdminPaymentMethods',
            },
          ],
          [
            {
              text:
                user.language === UserLanguageEnum.EN
                  ? '⏳ Pending users'
                  : user.language === UserLanguageEnum.UA
                    ? '⏳ Користувачі в очікуванні'
                    : '⏳ Ожидающие пользователи',
              callback_data: 'PendingUsers',
            },
          ],
          [
            {
              text:
                user.language === UserLanguageEnum.UA
                  ? '👥 Список користувачів'
                  : '👥 Список пользователей',
              callback_data: 'UsersList',
            },
          ],
          [
            {
              text:
                user.language === UserLanguageEnum.UA
                  ? '🔎 Короки користувача'
                  : '🔎 Шаги пользователя',
              callback_data: 'UsersStep',
            },
          ],
          [
            {
              text:
                user.language === UserLanguageEnum.EN
                  ? '👤 My account'
                  : user.language === UserLanguageEnum.UA
                    ? '👤 My account'
                    : '👤 My account',
              callback_data: 'BackToAccount',
            },
          ],
        ],
      },
    },
  );
};

export const editAdminPanelKeyboard = async (
  chat_id: number,
  message_id: number,
  bot: TelegramBot,
  user: User,
) => {
  const text =
    user.language === UserLanguageEnum.EN
      ? '👔 Your admin panel:'
      : user.language === UserLanguageEnum.UA
        ? '👔 Ваша панель адміністратора:'
        : '👔 Ваша админ-панель:';

  const inline_keyboard = [
    [
      {
        text:
          user.language === UserLanguageEnum.EN
            ? '📋 Subscription plans'
            : user.language === UserLanguageEnum.UA
              ? '📋 Плани підписок'
              : '📋 Планы подписки',
        callback_data: 'SendSubscriptionPlanAdminKeyboard',
      },
      {
        text: '🎁 Promo codes',
        callback_data: 'AdminPromocodes',
      },
    ],
    [
      {
        text:
          user.language === UserLanguageEnum.EN
            ? '🗃️ User transactions'
            : user.language === UserLanguageEnum.UA
              ? '🗃️ Транзакції'
              : '🗃️ Транзакции',
        callback_data: 'AdminUserTransactions',
      },
      {
        text:
          user.language === UserLanguageEnum.EN
            ? '💸 Payment methods'
            : user.language === UserLanguageEnum.UA
              ? '💸 Методи оплати'
              : '💸 Способы оплаты',
        callback_data: 'AdminPaymentMethods',
      },
    ],
    [
      {
        text:
          user.language === UserLanguageEnum.EN
            ? '⏳ Pending users'
            : user.language === UserLanguageEnum.UA
              ? '⏳ Користувачі в очікуванні'
              : '⏳ Ожидающие пользователи',
        callback_data: 'PendingUsers',
      },
    ],
    [
      {
        text:
          user.language === UserLanguageEnum.UA
            ? '👥 Список користувачів'
            : '👥 Список пользователей',
        callback_data: 'UsersList',
      },
    ],
    [
      {
        text:
          user.language === UserLanguageEnum.UA
            ? '🔎 Короки користувача'
            : '🔎 Шаги пользователя',
        callback_data: 'UsersStep',
      },
    ],
    [
      {
        text:
          user.language === UserLanguageEnum.EN
            ? '👤 My account'
            : user.language === UserLanguageEnum.UA
              ? '👤 My account'
              : '👤 My account',
        callback_data: 'BackToAccount',
      },
    ],
  ];

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
