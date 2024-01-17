import TelegramBot from 'node-telegram-bot-api';
import { UserLanguageEnum } from 'src/helper';
import { Promocode } from 'src/promocode/promocode.entity';
import { RedisService } from 'src/redis/redis.service';
import { User } from 'src/user/user.entity';

export const sendPromocodeAdminDetailsKeyboard = async (
  id: number,
  bot: TelegramBot,
  promocode: Promocode,
  redisService: RedisService,
  user: User,
) => {
  const text = `${
    user.language === UserLanguageEnum.EN
      ? 'Promocode data'
      : user.language === UserLanguageEnum.UA
        ? 'Дані промокоду'
        : 'Данные промокода'
  }:

- <b>name</b>: ${promocode.name}

- <b>is published</b>: ${promocode.is_published} ${
    promocode.is_published ? '✅' : '❌'
  }

- <b>sale percent</b>: ${promocode.sale_percent}

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

  await bot.sendMessage(id, text, {
    parse_mode: 'HTML',
    reply_markup: {
      remove_keyboard: true,
      inline_keyboard: [
        [
          {
            text: `name`,
            callback_data: callback_data + 'name',
          },
        ],
        [
          {
            text: `is published`,
            callback_data: callback_data + 'is_published',
          },
        ],
        [
          {
            text: `sale percent`,
            callback_data: callback_data + 'sale_percent',
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
      ],
    },
  });
};
