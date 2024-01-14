import TelegramBot from 'node-telegram-bot-api';
import { UserLanguageEnum } from 'src/helper';
import { RedisService } from 'src/redis/redis.service';
import { SubscriptionPlan } from 'src/subscriptionPlan/subscriptionPlan.entity';
import { User } from 'src/user/user.entity';

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

- price: ${plan.price}

- is published: ${plan.is_published} ${plan.is_published ? '✅' : '❌'}

- months count: ${plan.months_count}
  
- nameEN: ${plan.nameEN}

- nameUA: ${plan.nameUA}

- nameRU: ${plan.nameRU}

- descriptionEN: ${plan.descriptionEN}

- descriptionUA: ${plan.descriptionUA}

- descriptionRU: ${plan.descriptionRU}

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
    reply_markup: {
      remove_keyboard: true,
      inline_keyboard: [
        [
          {
            text: `price`,
            callback_data: callback_data + 'price',
          },
          {
            text: `is published status`,
            callback_data: callback_data + 'is_published',
          },
          {
            text: `months count`,
            callback_data: callback_data + 'months_count',
          },
        ],
        [
          {
            text: `nameEN`,
            callback_data: callback_data + 'nameEN',
          },
          {
            text: `nameUA`,
            callback_data: callback_data + 'nameUA',
          },
          {
            text: `nameRU`,
            callback_data: callback_data + 'nameRU',
          },
        ],
        [
          {
            text: `descriptionEN`,
            callback_data: callback_data + 'descriptionEN',
          },
          {
            text: `descriptionUA`,
            callback_data: callback_data + 'descriptionUA',
          },
          {
            text: `descriptionRU`,
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
