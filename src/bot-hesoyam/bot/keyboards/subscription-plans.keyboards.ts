import TelegramBot from 'node-telegram-bot-api';
import { UserLanguageEnum } from 'src/helper';
import { SubscriptionPlanService } from '../../subscriptionPlan/subscriptionPlan.service';
import { UserHesoyam } from '../../user/user.entity';

export const sendSubscriptionPlanKeyboard = async (
  chat_id: number,
  message_id: number,
  bot: TelegramBot,
  planService: SubscriptionPlanService,
  isAdminPanel: boolean,
  user: UserHesoyam,
  edit = false,
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
              ? 'Новий план навчання'
              : 'Новый план обучения'
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

  const text =
    user.language === UserLanguageEnum.UA
      ? '📋 Виберіть план навчання:'
      : '📋 Выберите план обучения:';

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
