import TelegramBot from 'node-telegram-bot-api';
import { PaymentStatusEnum, UserLanguageEnum } from 'src/helper';
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

<b>List of payments:</b>`
        : language === UserLanguageEnum.UA
          ? `є платежів: ${total}!
  
<b>Список платежів:</b>`
          : `есть платежей: ${total}!

<b>Список платежей:</b>`
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
    parse_mode: 'HTML',
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

- <b>Amount:</b> ${p.amount}$ 
  <b>Subscription plan:</b> ${p.subscription_plan[`name${language}`]}
  <b>Status:</b> ${getStatusText(language, p.status)}
  <b>Date:</b> ${p.created_date}
  <b>Expired date:</b> ${p.expired_date}`;

    case UserLanguageEnum.UA:
      return `

- <b>Сума:</b> ${p.amount}$
  <b>План підписки:</b> ${p.subscription_plan[`name${language}`]}
  <b>Статус:</b> ${getStatusText(language, p.status)}
  <b>Дата:</b> ${p.created_date}
  <b>Дата закінчення:</b> ${p.expired_date}`;

    case UserLanguageEnum.RU:
      return `

- <b>Сумма:</b> ${p.amount}$
  <b>План подписки:</b> ${p.subscription_plan[`name${language}`]}
  <b>Статус:</b> ${getStatusText(language, p.status)}
  <b>Дата:</b> ${p.created_date}
  <b>Дата истечения срока:</b> ${p.expired_date}`;
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

const getStatusText = (
  language: UserLanguageEnum,
  status: PaymentStatusEnum,
) => {
  switch (status) {
    case PaymentStatusEnum.Cancel:
      return language === UserLanguageEnum.EN
        ? 'Your payment has not been confirmed by the manager'
        : language === UserLanguageEnum.UA
          ? 'Ваш платіж не підтверджено менеджером'
          : 'Ваш платеж не подтвержден менеджером';

    case PaymentStatusEnum.Pending:
      return language === UserLanguageEnum.EN
        ? 'Your payment is still pending'
        : language === UserLanguageEnum.UA
          ? 'Ваш платіж ще очікує розгляду'
          : 'Ваш платеж еще ожидает рассмотрения';

    case PaymentStatusEnum.Success:
      return language === UserLanguageEnum.EN
        ? 'Your payment is successful'
        : language === UserLanguageEnum.UA
          ? 'Ваш платіж успішний'
          : 'Ваш платеж успешен';
  }
};
