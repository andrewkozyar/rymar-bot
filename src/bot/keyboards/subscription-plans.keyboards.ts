import TelegramBot from 'node-telegram-bot-api';
import { UserLanguageEnum } from 'src/helper';
import { SubscriptionPlanService } from 'src/subscriptionPlan/subscriptionPlan.service';
import { User } from 'src/user/user.entity';

export const sendSubscriptionPlanKeyboard = async (
  id: number,
  bot: TelegramBot,
  planService: SubscriptionPlanService,
  isAdminPanel: boolean,
  user: User,
) => {
  const callback_data = isAdminPanel
    ? 'AdminChooseSubscriptionPlan;'
    : 'ChooseSubscriptionPlan;';

  const plansData = await (isAdminPanel
    ? planService.getPlans()
    : planService.getPlans(true));

  const inline_keyboard = plansData.subscriptionPlans.map((plan) => [
    {
      text: `${plan[`name${user.language}`]} | ${plan.price}$`,
      callback_data: callback_data + plan.id,
    },
  ]);

  if (isAdminPanel) {
    inline_keyboard.push([
      {
        text: `➕ ${
          user.language === UserLanguageEnum.EN
            ? 'New subscription plan'
            : user.language === UserLanguageEnum.UA
              ? 'Новий план підписки'
              : 'Новый план подписки'
        }`,
        callback_data: 'NewSubscriptionPlan',
      },
      {
        text: `⬅️ ${
          user.language === UserLanguageEnum.EN
            ? 'Back'
            : user.language === UserLanguageEnum.UA
              ? 'Назад'
              : 'Назад'
        }`,
        callback_data: 'AdminPanel',
      },
    ]);
  }

  await bot.sendMessage(
    id,
    user.language === UserLanguageEnum.EN
      ? '📋 Choose subscription plan:'
      : user.language === UserLanguageEnum.UA
        ? '📋 Виберіть план підписки:'
        : '📋 Выберите план подписки:',
    {
      reply_markup: {
        remove_keyboard: true,
        inline_keyboard,
      },
    },
  );
};
