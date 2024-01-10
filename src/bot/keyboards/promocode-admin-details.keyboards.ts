import TelegramBot from 'node-telegram-bot-api';
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
  const text = `Subscription promocode data:

- name: ${promocode.name}

- is published: ${promocode.is_published}

- sale percent: ${promocode.sale_percent}

Choose field to update:`;

  const promocodeData = {
    id: promocode.id,
  };

  const callback_data = `EditPromocodeAdmin;`;
  redisService.add(
    `EditPromocodeAdmin-${user.id}`,
    JSON.stringify(promocodeData),
  );

  await bot.sendMessage(id, text, {
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
            text: `🗑️ Delete`,
            callback_data: 'AdminDeletePromocode',
          },
        ],
        [
          {
            text: `⬅️ Back`,
            callback_data: 'AdminPromocodes',
          },
        ],
      ],
    },
  });
};
