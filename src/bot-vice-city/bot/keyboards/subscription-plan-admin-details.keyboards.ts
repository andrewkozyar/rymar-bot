import TelegramBot from 'node-telegram-bot-api';
import { UserLanguageEnum } from 'src/helper';
import { RedisService } from 'src/redis/redis.service';
import { SubscriptionPlan } from 'src/bot-vice-city/subscriptionPlan/subscriptionPlan.entity';
import { User } from 'src/bot-vice-city/user/user.entity';

export const sendSubscriptionPlanAdminDetailsKeyboard = async (
  id: number,
  bot: TelegramBot,
  plan: SubscriptionPlan,
  redisService: RedisService,
  user: User,
) => {
  const text = `${
    user.language === UserLanguageEnum.EN
      ? 'Subscription plan data'
      : user.language === UserLanguageEnum.UA
        ? 'Дані плану підписки'
        : 'Данные плана подписки'
  }:

- <b>цена</b>: ${plan.price}

--------------

- <b>опубликовано ли</b>: ${plan.is_published} ${
    plan.is_published ? '✅' : '❌'
  }

--------------

- <b>количество месяцев</b>: ${plan.months_count}

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

  await bot.sendMessage(id, text, {
    parse_mode: 'HTML',
    reply_markup: {
      remove_keyboard: true,
      inline_keyboard: [
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
          {
            text: `количество месяцев`,
            callback_data: callback_data + 'months_count',
          },
          {
            text: `порядковый номер`,
            callback_data: callback_data + 'position',
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
      ],
    },
  });
};

export const editSubscriptionPlanAdminDetailsKeyboard = async (
  chat_id: number,
  message_id: number,
  bot: TelegramBot,
  plan: SubscriptionPlan,
  redisService: RedisService,
  user: User,
) => {
  const text = `${
    user.language === UserLanguageEnum.EN
      ? 'Subscription plan data'
      : user.language === UserLanguageEnum.UA
        ? 'Дані плану підписки'
        : 'Данные плана подписки'
  }:

- <b>цена</b>: ${plan.price}

--------------

- <b>опубликовано ли</b>: ${plan.is_published} ${
    plan.is_published ? '✅' : '❌'
  }

--------------

- <b>количество месяцев</b>: ${plan.months_count}

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
      {
        text: `количество месяцев`,
        callback_data: callback_data + 'months_count',
      },
      {
        text: `порядковый номер`,
        callback_data: callback_data + 'position',
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
