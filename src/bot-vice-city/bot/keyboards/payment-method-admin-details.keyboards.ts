import TelegramBot from 'node-telegram-bot-api';
import { UserLanguageEnum } from 'src/helper';
import { PaymentMethod } from 'src/bot-vice-city/paymentMethod/paymentMethod.entity';
import { RedisService } from 'src/redis/redis.service';
import { User } from 'src/bot-vice-city/user/user.entity';

export const sendPaymentMethodAdminDetailsKeyboard = async (
  id: number,
  bot: TelegramBot,
  paymentMethod: PaymentMethod,
  redisService: RedisService,
  user: User,
) => {
  const text = `${
    user.language === UserLanguageEnum.EN
      ? 'Payment method data'
      : user.language === UserLanguageEnum.UA
        ? 'Дані про спосіб оплати'
        : 'Данные о способе оплаты'
  }:

- <b>название</b>: ${paymentMethod.name}

--------------

- <b>опубликовано ли</b>: ${paymentMethod.is_published} ${
    paymentMethod.is_published ? '✅' : '❌'
  }

--------------

- <b>адресс</b>: ${paymentMethod.address}

--------------

- <b>валюта</b>: ${paymentMethod.currency}

--------------

- <b>укр описание</b>: ${paymentMethod.descriptionUA}

--------------

- <b>ру описание</b>: ${paymentMethod.descriptionRU}

--------------

${
  user.language === UserLanguageEnum.EN
    ? 'Choose field to update'
    : user.language === UserLanguageEnum.UA
      ? 'Виберіть поле для оновлення'
      : 'Выберите поле для обновления'
}:`;

  const paymentMethodData = {
    id: paymentMethod.id,
  };

  const callback_data = `EditPaymentMethodAdmin;`;
  redisService.add(
    `EditPaymentMethodAdmin-${user.id}`,
    JSON.stringify(paymentMethodData),
  );

  await bot.sendMessage(id, text, {
    parse_mode: 'HTML',
    reply_markup: {
      remove_keyboard: true,
      inline_keyboard: [
        [
          {
            text: `название`,
            callback_data: callback_data + 'name',
          },
          {
            text: `опубликовано ли`,
            callback_data: callback_data + 'is_published',
          },
        ],
        [
          {
            text: `адресс`,
            callback_data: callback_data + 'address',
          },
          {
            text: `валюта`,
            callback_data: callback_data + 'currency',
          },
        ],
        [
          // {
          //   text: `descriptionEN`,
          //   callback_data: callback_data + 'descriptionEN',
          // },
          {
            text: `укр описание`,
            callback_data: callback_data + 'descriptionUA',
          },
          {
            text: `ру описание`,
            callback_data: callback_data + 'descriptionRU',
          },
        ],
        [
          {
            text: `🗑️ ${
              user.language === UserLanguageEnum.EN
                ? 'Delete'
                : user.language === UserLanguageEnum.UA
                  ? 'Видалити'
                  : 'Удалить'
            }`,
            callback_data: 'AdminDeletePaymentMethod',
          },
        ],
        [
          {
            text: `⬅️ ${
              user.language === UserLanguageEnum.EN
                ? 'Back'
                : user.language === UserLanguageEnum.UA
                  ? 'Назад'
                  : 'Назад'
            }`,
            callback_data: 'AdminPaymentMethods',
          },
        ],
      ],
    },
  });
};

export const editPaymentMethodAdminDetailsKeyboard = async (
  chat_id: number,
  message_id: number,
  bot: TelegramBot,
  paymentMethod: PaymentMethod,
  redisService: RedisService,
  user: User,
) => {
  const text = `${
    user.language === UserLanguageEnum.EN
      ? 'Payment method data'
      : user.language === UserLanguageEnum.UA
        ? 'Дані про спосіб оплати'
        : 'Данные о способе оплаты'
  }:

- <b>название</b>: ${paymentMethod.name}

--------------

- <b>опубликовано ли</b>: ${paymentMethod.is_published} ${
    paymentMethod.is_published ? '✅' : '❌'
  }

  --------------

- <b>адресс</b>: ${paymentMethod.address}

--------------

- <b>валюта</b>: ${paymentMethod.currency}

--------------

- <b>укр описание</b>: ${paymentMethod.descriptionUA}

--------------

- <b>ру описание</b>: ${paymentMethod.descriptionRU}

--------------

${
  user.language === UserLanguageEnum.EN
    ? 'Choose field to update'
    : user.language === UserLanguageEnum.UA
      ? 'Виберіть поле для оновлення'
      : 'Выберите поле для обновления'
}:`;

  const paymentMethodData = {
    id: paymentMethod.id,
  };

  const callback_data = `EditPaymentMethodAdmin;`;
  redisService.add(
    `EditPaymentMethodAdmin-${user.id}`,
    JSON.stringify(paymentMethodData),
  );

  const inline_keyboard = [
    [
      {
        text: `название`,
        callback_data: callback_data + 'name',
      },
      {
        text: `опубликовано ли`,
        callback_data: callback_data + 'is_published',
      },
    ],
    [
      {
        text: `адресс`,
        callback_data: callback_data + 'address',
      },
      {
        text: `валюта`,
        callback_data: callback_data + 'currency',
      },
    ],
    [
      // {
      //   text: `descriptionEN`,
      //   callback_data: callback_data + 'descriptionEN',
      // },
      {
        text: `укр описание`,
        callback_data: callback_data + 'descriptionUA',
      },
      {
        text: `ру описание`,
        callback_data: callback_data + 'descriptionRU',
      },
    ],
    [
      {
        text: `🗑️ ${
          user.language === UserLanguageEnum.EN
            ? 'Delete'
            : user.language === UserLanguageEnum.UA
              ? 'Видалити'
              : 'Удалить'
        }`,
        callback_data: 'AdminDeletePaymentMethod',
      },
    ],
    [
      {
        text: `⬅️ ${
          user.language === UserLanguageEnum.EN
            ? 'Back'
            : user.language === UserLanguageEnum.UA
              ? 'Назад'
              : 'Назад'
        }`,
        callback_data: 'AdminPaymentMethods',
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
