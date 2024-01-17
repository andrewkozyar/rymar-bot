import TelegramBot from 'node-telegram-bot-api';
import { UserLanguageEnum } from 'src/helper';
import { PaymentMethodService } from 'src/paymentMethod/paymentMethod.service';
import { User } from 'src/user/user.entity';

export const sendPaymentMethodsKeyboard = async (
  id: number,
  bot: TelegramBot,
  paymentMethodService: PaymentMethodService,
  user: User,
  isAdmin: boolean,
  isContinue: boolean,
  planId?: string,
) => {
  const callback_data = isAdmin ? 'AdminPaymentMethodDetails;' : 'PayBy;';

  const paymentMethods = await paymentMethodService.find();

  const inline_keyboard = paymentMethods.map((paymentMethod) => [
    {
      text: `${paymentMethod.name}`,
      callback_data: callback_data + paymentMethod.id,
    },
  ]);

  if (isAdmin) {
    inline_keyboard.push([
      {
        text: `➕ ${
          user.language === UserLanguageEnum.EN
            ? 'New payment method'
            : user.language === UserLanguageEnum.UA
              ? 'Новий спосіб оплати'
              : 'Новый способ оплаты'
        }`,
        callback_data: 'NewPaymentMethod',
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
  } else {
    inline_keyboard.push([
      {
        text: `🚫 ${
          user.language === UserLanguageEnum.EN
            ? 'Cancel'
            : user.language === UserLanguageEnum.UA
              ? 'Скасувати'
              : 'Отменить'
        }`,
        callback_data: isContinue
          ? 'ContinueSubscription;'
          : 'ChooseSubscriptionPlan;' + planId,
      },
    ]);
  }

  await bot.sendMessage(
    id,
    `💳 ${
      user.language === UserLanguageEnum.EN
        ? 'Choose payment method:'
        : user.language === UserLanguageEnum.UA
          ? 'Виберіть спосіб оплати:'
          : 'Выберите способ оплаты:'
    }`,
    {
      reply_markup: {
        remove_keyboard: true,
        inline_keyboard,
      },
    },
  );
};
