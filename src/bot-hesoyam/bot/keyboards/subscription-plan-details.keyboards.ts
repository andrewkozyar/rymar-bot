import TelegramBot from 'node-telegram-bot-api';
import { PayDataInterface, UserLanguageEnum, getFullText } from 'src/helper';
import { PromocodeHesoyam } from 'src/bot-hesoyam/promocode/promocode.entity';
import { RedisService } from 'src/redis/redis.service';
import { SubscriptionPlanHesoyam } from 'src/bot-hesoyam/subscriptionPlan/subscriptionPlan.entity';
import { UserHesoyam } from 'src/bot-hesoyam/user/user.entity';

export const sendSubscriptionPlanDetailsKeyboard = async (
  id: number,
  bot: TelegramBot,
  plan: SubscriptionPlanHesoyam,
  redisService: RedisService,
  user: UserHesoyam,
  payData: PayDataInterface,
  promocode?: PromocodeHesoyam,
) => {
  if (promocode) {
    payData.newPrice = plan.price - (plan.price * promocode.sale_percent) / 100;
  }

  const text =
    getFullText(plan[`description${user.language}`], {
      price:
        payData.newPrice && payData.newPrice != plan.price
          ? `<s>${plan.price}</s> <b style="color:red">${payData.newPrice}</b>`
          : plan.price?.toString(),
    }) || 'No description';

  const callback_data = `BuySubscriptionPlan;`;
  redisService.add(`BuySubscriptionPlan-${user.id}`, JSON.stringify(payData));

  const inline_keyboard = [];

  inline_keyboard.push([
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
  ]);

  if (!payData?.isContinue) {
    inline_keyboard.push([
      {
        text: `🎁 Promo code`,
        callback_data: 'PromocodeHesoyam;' + plan.id,
      },
    ]);
  }

  if (!payData.isFromNotification) {
    inline_keyboard.push([
      {
        text: `⬅️ ${
          user.language === UserLanguageEnum.EN
            ? 'Back'
            : user.language === UserLanguageEnum.UA
              ? 'Назад'
              : 'Назад'
        }`,
        callback_data: payData?.isContinue
          ? 'MySubscription'
          : 'SendSubscriptionPlanKeyboard',
      },
    ]);
  }

  await bot.sendMessage(id, text, {
    parse_mode: 'HTML',
    reply_markup: {
      remove_keyboard: true,
      inline_keyboard,
    },
  });
};

export const editSubscriptionPlanDetailsKeyboard = async (
  chat_id: number,
  message_id: number,
  bot: TelegramBot,
  plan: SubscriptionPlanHesoyam,
  redisService: RedisService,
  user: UserHesoyam,
  payData: PayDataInterface,
  promocode?: PromocodeHesoyam,
) => {
  if (promocode) {
    payData.newPrice = plan.price - (plan.price * promocode.sale_percent) / 100;
  }

  const text =
    getFullText(plan[`description${user.language}`], {
      price:
        payData.newPrice && payData.newPrice != plan.price
          ? `<s>${plan.price}</s> <b style="color:red">${payData.newPrice}</b>`
          : plan.price?.toString(),
    }) || 'No description';

  const callback_data = `BuySubscriptionPlan;`;
  redisService.add(`BuySubscriptionPlan-${user.id}`, JSON.stringify(payData));

  const inline_keyboard = [];

  inline_keyboard.push([
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
  ]);

  if (!payData?.isContinue) {
    inline_keyboard.push([
      {
        text: `🎁 Promo code`,
        callback_data: 'PromocodeHesoyam;' + plan.id,
      },
    ]);
  }

  if (!payData.isFromNotification) {
    inline_keyboard.push([
      {
        text: `⬅️ ${
          user.language === UserLanguageEnum.EN
            ? 'Back'
            : user.language === UserLanguageEnum.UA
              ? 'Назад'
              : 'Назад'
        }`,
        callback_data: payData?.isContinue
          ? 'MySubscription'
          : 'SendSubscriptionPlanKeyboard',
      },
    ]);
  }

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
