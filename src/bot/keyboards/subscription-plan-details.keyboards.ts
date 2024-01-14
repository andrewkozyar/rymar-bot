import TelegramBot from 'node-telegram-bot-api';
import { UserLanguageEnum, getFullText } from 'src/helper';
import { Promocode } from 'src/promocode/promocode.entity';
import { RedisService } from 'src/redis/redis.service';
import { SubscriptionPlan } from 'src/subscriptionPlan/subscriptionPlan.entity';
import { User } from 'src/user/user.entity';

export const sendSubscriptionPlanDetailsKeyboard = async (
  id: number,
  bot: TelegramBot,
  plan: SubscriptionPlan,
  redisService: RedisService,
  user: User,
  promocode?: Promocode,
) => {
  const payData = {
    amount: plan.price,
    subscription_plan_id: plan.id,
    promocode_id: promocode?.id,
    newPrice: null,
  };

  if (promocode) {
    payData.newPrice = plan.price - (plan.price * promocode.sale_percent) / 100;
  }

  const text =
    getFullText(plan[`description${user.language}`], {
      price: payData.newPrice
        ? `<s>${plan.price}</s> <b style="color:red">${payData.newPrice}</b>`
        : plan.price.toString(),
    }) || 'No description';

  const callback_data = `BuySubscriptionPlan;`;
  redisService.add(`BuySubscriptionPlan-${user.id}`, JSON.stringify(payData));

  await bot.sendMessage(id, text, {
    parse_mode: 'HTML',
    reply_markup: {
      remove_keyboard: true,
      inline_keyboard: [
        [
          {
            text: `💵 ${
              user.language === UserLanguageEnum.EN
                ? 'Pay'
                : user.language === UserLanguageEnum.UA
                  ? 'Заплатити'
                  : 'Заплатить'
            }`,
            callback_data: callback_data + plan.id,
          },
        ],
        [
          {
            text: `🎁 Promo code`,
            callback_data: 'Promocode;' + plan.id,
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
            callback_data: 'SendSubscriptionPlanKeyboard',
          },
        ],
      ],
    },
  });
};
