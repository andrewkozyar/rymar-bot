import TelegramBot from 'node-telegram-bot-api';
import { UserLanguageEnum } from 'src/helper';
import { Payment } from 'src/payment/payment.entity';
import { PaymentService } from 'src/payment/payment.service';
import { User } from 'src/user/user.entity';

export const sendTransactionsKeyboard = async (
  id: number,
  bot: TelegramBot,
  user: User,
  paymentService: PaymentService,
  isAdminPanel: boolean,
  language: UserLanguageEnum,
) => {
  const { payments, total } = await paymentService.getPayments({
    user_id: user.id,
  });

  let text;

  if (payments.length) {
    text = `🗄️ ${getUserInfoText(language, isAdminPanel, user)} ${
      language === UserLanguageEnum.EN
        ? `had ${total} payments!

List of payments:`
        : language === UserLanguageEnum.UA
          ? `є платежів: ${total}!
  
Список платежів:`
          : `есть платежей: ${total}!

Список платежей:`
    }`;

    payments.forEach((p) => {
      text = text + getPaymentInfoText(language, p);

      if (p.promocode) {
        text =
          text +
          `
  Promo code: ${p.promocode.name}`;
      }
    });
  } else {
    text = `${getUserInfoText(
      language,
      isAdminPanel,
      user,
    )} ${getNoPaymentsInfoText(language)}`;
  }

  await bot.sendMessage(id, text, {
    reply_markup: {
      remove_keyboard: true,
      inline_keyboard: [
        [
          {
            text: `⬅️ ${
              language === UserLanguageEnum.EN
                ? 'Back'
                : language === UserLanguageEnum.UA
                  ? 'Назад'
                  : 'Назад'
            }`,
            callback_data: isAdminPanel ? 'AdminPanel' : 'MySubscription',
          },
        ],
      ],
    },
  });
};

const getPaymentInfoText = (language: UserLanguageEnum, p: Payment) => {
  switch (language) {
    case UserLanguageEnum.EN:
      return `

- Amount: ${p.amount}$ 
  Subscription plan: ${p.subscription_plan[`name${language}`]}
  Date: ${p.created_date}
  Expired date: ${p.expired_date}`;

    case UserLanguageEnum.UA:
      return `

- Сума: ${p.amount}$
  План підписки: ${p.subscription_plan[`name${language}`]}
  Дата: ${p.created_date}
  Дата закінчення: ${p.expired_date}`;

    case UserLanguageEnum.RU:
      return `

- Сумма: ${p.amount}$
  План подписки: ${p.subscription_plan[`name${language}`]}
  Дата: ${p.created_date}
  Дата истечения срока: ${p.expired_date}`;
  }
};

const getUserInfoText = (
  language: UserLanguageEnum,
  isAdminPanel: boolean,
  user: User,
) => {
  switch (language) {
    case UserLanguageEnum.EN:
      return isAdminPanel ? `User ${user.name}` : 'You';

    case UserLanguageEnum.UA:
      return isAdminPanel ? `У користувача ${user.name}` : 'У вас';

    case UserLanguageEnum.RU:
      return isAdminPanel ? `У пользователя ${user.name}` : 'У вас';
  }
};

const getNoPaymentsInfoText = (language: UserLanguageEnum) => {
  switch (language) {
    case UserLanguageEnum.EN:
      return `haven't payments yet.`;

    case UserLanguageEnum.UA:
      return `ще не має платежів.`;

    case UserLanguageEnum.RU:
      return `еще нету платежей.`;
  }
};
