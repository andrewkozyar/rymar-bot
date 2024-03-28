import TelegramBot from 'node-telegram-bot-api';
import { UserLanguageEnum } from 'src/helper';
import { Promocode } from '../../promocode/promocode.entity';
import { RedisService } from 'src/redis/redis.service';
import { User } from '../../user/user.entity';

export const sendPromocodeAdminDetailsKeyboard = async (
  chat_id: number,
  message_id: number,
  bot: TelegramBot,
  promocode: Promocode,
  redisService: RedisService,
  user: User,
  edit = false,
) => {
  const text = `${
    user.language === UserLanguageEnum.EN
      ? 'Promocode data'
      : user.language === UserLanguageEnum.UA
        ? 'Дані промокоду'
        : 'Данные промокода'
  }:

- <b>название</b>: ${promocode.name}

--------------

- <b>опубликовано ли</b>: ${promocode.is_published} ${
    promocode.is_published ? '✅' : '❌'
  }

--------------

- <b>процент скидки</b>: ${promocode.sale_percent}

--------------

- <b>многоразовый ли</b>: ${promocode.is_multiple} ${
    promocode.is_multiple ? '✅' : '❌'
  }

--------------

${
  user.language === UserLanguageEnum.EN
    ? 'Choose field to update'
    : user.language === UserLanguageEnum.UA
      ? 'Виберіть поле для оновлення'
      : 'Выберите поле для обновления'
}:`;

  const promocodeData = {
    id: promocode.id,
  };

  const callback_data = `EditPromocodeAdmin;`;
  redisService.add(
    `EditPromocodeAdmin-${user.id}`,
    JSON.stringify(promocodeData),
  );

  const inline_keyboard = [
    [
      {
        text: `название`,
        callback_data: callback_data + 'name',
      },
    ],
    [
      {
        text: `опубликовано ли`,
        callback_data: callback_data + 'is_published',
      },
    ],
    [
      {
        text: `процент скидки`,
        callback_data: callback_data + 'sale_percent',
      },
    ],
    [
      {
        text: `многоразовый ли`,
        callback_data: callback_data + 'is_multiple',
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
        callback_data: 'AdminDeletePromocode',
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
        callback_data: 'AdminPromocodes',
      },
    ],
  ];

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
