import TelegramBot from 'node-telegram-bot-api';
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
  const text = `Subscription plan data:

- price: ${plan.price}

- is published: ${plan.is_published}

- months count: ${plan.months_count}
  
- nameEN: ${plan.nameEN}

- nameUA: ${plan.nameUA}

- nameRU: ${plan.nameRU}

- descriptionEN: ${plan.descriptionEN}

- descriptionUA: ${plan.descriptionUA}

- descriptionRU: ${plan.descriptionRU}

Choose field to update:`;

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
            text: `🗑️ Delete`,
            callback_data: 'AdminDeleteSubscriptionPlan',
          },
        ],
        [
          {
            text: `⬅️ Back`,
            callback_data: 'SendSubscriptionPlanAdminKeyboard',
          },
        ],
      ],
    },
  });
};
