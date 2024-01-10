import TelegramBot from 'node-telegram-bot-api';
import { UserLanguageEnum } from 'src/helper';
import { SubscriptionPlanService } from 'src/subscriptionPlan/subscriptionPlan.service';

export const sendSubscriptionPlanKeyboard = async (
  id: number,
  bot: TelegramBot,
  planService: SubscriptionPlanService,
  isAdminPanel: boolean,
  language: UserLanguageEnum,
) => {
  const callback_data = isAdminPanel
    ? 'AdminChooseSubscriptionPlan;'
    : 'ChooseSubscriptionPlan;';

  const plansData = await (isAdminPanel
    ? planService.getPlans()
    : planService.getPlans(true));

  const inline_keyboard = plansData.subscriptionPlans.map((plan) => [
    {
      text: `${plan[`name${language}`]} | ${plan.price}$`,
      callback_data: callback_data + plan.id,
    },
  ]);

  if (isAdminPanel) {
    inline_keyboard.push([
      {
        text: `➕ New subscription plan`,
        callback_data: 'NewSubscriptionPlan',
      },
      {
        text: `⬅️ Back`,
        callback_data: 'AdminPanel',
      },
    ]);
  }

  await bot.sendMessage(
    id,
    language === UserLanguageEnum.EN
      ? 'Choose subscription plan:'
      : language === UserLanguageEnum.UA
        ? 'Виберіть тарифний план:'
        : 'Выберите план подписки:',
    {
      reply_markup: {
        remove_keyboard: true,
        inline_keyboard,
      },
    },
  );
};
