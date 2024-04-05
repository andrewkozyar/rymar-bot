import TelegramBot from 'node-telegram-bot-api';
import { UserLanguageEnum } from 'src/helper';
import { RedisService } from 'src/redis/redis.service';
import { SubscriptionPlanHesoyam } from '../../subscriptionPlan/subscriptionPlan.entity';
import { UserHesoyam } from '../../user/user.entity';

export const sendSubscriptionPlanAdminDetailsKeyboard = async (
  chat_id: number,
  message_id: number,
  bot: TelegramBot,
  plan: SubscriptionPlanHesoyam,
  redisService: RedisService,
  user: UserHesoyam,
  edit = false,
) => {
  const text = `${
    user.language === UserLanguageEnum.EN
      ? 'Subscription plan data'
      : user.language === UserLanguageEnum.UA
        ? 'Дані плану навчання'
        : 'Данные плана обучения'
  }:

- <b>цена</b>: ${plan.price}

--------------

- <b>опубликовано ли</b>: ${plan.is_published} ${
    plan.is_published ? '✅' : '❌'
  }

--------------

- <b>порядковый номер</b>: ${plan.position}

--------------
  
- <b>укр название</b>: ${plan.nameUA}

--------------

- <b>ру название</b>: ${plan.nameRU}

--------------

- <b>укр описание</b>: ${plan.descriptionUA}

--------------

- <b>ру описание</b>: ${plan.descriptionRU}

--------------

- <b>Каналы</b>: 
${plan.channels.map((c) => c.name).join('\n') || '<b>Нет каналов</b>'}

--------------

${
  user.language === UserLanguageEnum.EN
    ? 'Choose field to update'
    : user.language === UserLanguageEnum.UA
      ? 'Виберіть поле для оновлення'
      : 'Выберите поле для обновления'
}:`;

  const planData = {
    id: plan.id,
  };

  const callback_data = `EditSubscriptionPlanAdmin;`;
  redisService.add(
    `EditSubscriptionPlanAdmin-${user.id}`,
    JSON.stringify(planData),
  );

  const inline_keyboard = [
    [
      {
        text: `цена`,
        callback_data: callback_data + 'price',
      },
      {
        text: `опубликовано ли`,
        callback_data: callback_data + 'is_published',
      },
    ],
    [
      // {
      //   text: `nameEN`,
      //   callback_data: callback_data + 'nameEN',
      // },
      {
        text: `укр название`,
        callback_data: callback_data + 'nameUA',
      },
      {
        text: `ру название`,
        callback_data: callback_data + 'nameRU',
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
        text: `порядковый номер`,
        callback_data: callback_data + 'position',
      },
      {
        text: user.language === UserLanguageEnum.UA ? 'Канали' : 'Каналы',
        callback_data: callback_data + 'channels',
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
        callback_data: 'AdminDeleteSubscriptionPlan',
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
        callback_data: 'SendSubscriptionPlanAdminKeyboard',
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
