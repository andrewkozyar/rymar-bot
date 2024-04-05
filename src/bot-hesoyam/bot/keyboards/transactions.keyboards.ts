import TelegramBot from 'node-telegram-bot-api';
import { BotEnum, PaymentStatusEnum, UserLanguageEnum } from 'src/helper';
import { PaymentHesoyam } from '../../payment/payment.entity';
import { PaymentService } from '../../payment/payment.service';
import { UserHesoyam } from '../../user/user.entity';

export const sendTransactionsKeyboard = async (
  chat_id: number,
  message_id: number,
  bot: TelegramBot,
  user: UserHesoyam,
  paymentService: PaymentService,
  isAdminPanel: boolean,
  language: UserLanguageEnum,
  botType: BotEnum,
  edit = false,
  isConfirmedPayment: boolean = null,
  admin?: UserHesoyam,
) => {
  const { payments, total } = await paymentService.getPayments({
    user_id: user.id,
    bot: botType,
  });

  let text = '';

  if (isConfirmedPayment) {
    text =
      text +
      `✅ ${
        language === UserLanguageEnum.EN
          ? `Users @${user.name} payment confirmed successfully!

`
          : language === UserLanguageEnum.UA
            ? `Оплата користувача @${user.name} підтверджена успішно адміністратором @${admin.name}!

`
            : `Оплата пользователя @${user.name} подтверждена успешно администратором @${admin.name}!

`
      }`;
  } else if (isConfirmedPayment === false) {
    text =
      text +
      `✅ ${
        language === UserLanguageEnum.EN
          ? `PaymentHesoyam by user @${user.name} declined!

`
          : language === UserLanguageEnum.UA
            ? `Оплата користувача @${user.name} відхилена адміністратором @${admin.name}!

`
            : `Оплата пользователя @${user.name} отклонена администратором @${admin.name}!

`
      }`;
  }

  if (payments.length) {
    text =
      text +
      `🗄️ ${getUserInfoText(language, isAdminPanel, user)} ${
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
      text = text + getPaymentInfoText(language, p, isAdminPanel);

      if (p.promocode) {
        text =
          text +
          `
<b>Promo code</b>: ${p.promocode.name}`;
      }
    });
  } else {
    text = `${getUserInfoText(
      language,
      isAdminPanel,
      user,
    )} ${getNoPaymentsInfoText(language)}`;
  }

  const inline_keyboard = [
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
  ];

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

const getPaymentInfoText = (
  language: UserLanguageEnum,
  p: PaymentHesoyam,
  isAdminPanel: boolean,
) => {
  switch (language) {
    case UserLanguageEnum.EN:
      return `

${
  p.status === PaymentStatusEnum.Success
    ? '✅'
    : p.status === PaymentStatusEnum.Cancel
      ? '❌'
      : p.status === PaymentStatusEnum.End
        ? '🗓️'
        : '🤷‍♂️'
} <b>Status:</b> ${getStatusText(language, p.status)}
  <b>Amount USD:</b> ${p.price_usd}$ 
  <b>Paid amount:</b> ${p.amount} ${p.currency}
  <b>PaymentHesoyam method:</b> ${p.payment_method.name}
  <b>Subscription plan:</b> ${p.subscription_plan[`name${language}`]}
  <b>Date:</b> ${p.created_date}${
    isAdminPanel
      ? `
<b>The manager checking the payment:</b> ${
          p.updated_by ? '@' + p.updated_by?.name : 'is still pending'
        }`
      : ''
  }`;

    case UserLanguageEnum.UA:
      return `

${
  p.status === PaymentStatusEnum.Success
    ? '✅'
    : p.status === PaymentStatusEnum.Cancel
      ? '❌'
      : p.status === PaymentStatusEnum.End
        ? '🗓️'
        : '🤷‍♂️'
} <b>Статус:</b> ${getStatusText(language, p.status)}
  <b>Сума в USD:</b> ${p.price_usd}$
  <b>Оплачена сума:</b> ${p.amount} ${p.currency}
  <b>Метод оплати:</b> ${p.payment_method.name}
  <b>План навчання:</b> ${p.subscription_plan[`name${language}`]}
  <b>Дата:</b> ${p.created_date}${
    isAdminPanel
      ? `
<b>Менеджер перевірявший оплату:</b> ${
          p.updated_by ? '@' + p.updated_by?.name : 'ще очікує розгляду'
        }`
      : ''
  }`;

    case UserLanguageEnum.RU:
      return `

${
  p.status === PaymentStatusEnum.Success
    ? '✅'
    : p.status === PaymentStatusEnum.Cancel
      ? '❌'
      : p.status === PaymentStatusEnum.End
        ? '🗓️'
        : '🤷‍♂️'
} <b>Статус:</b> ${getStatusText(language, p.status)}
  <b>Сумма в USD:</b> ${p.price_usd}$
  <b>Оплаченная сумма:</b> ${p.amount} ${p.currency}
  <b>Метод оплаты:</b> ${p.payment_method.name}
  <b>План обучения:</b> ${p.subscription_plan[`name${language}`]}
  <b>Дата:</b> ${p.created_date}${
    isAdminPanel
      ? `
<b>Менеджер проверявший оплату:</b> ${
          p.updated_by ? '@' + p.updated_by?.name : 'еще ожидает рассмотрения'
        }`
      : ''
  }`;
  }
};

const getUserInfoText = (
  language: UserLanguageEnum,
  isAdminPanel: boolean,
  user: UserHesoyam,
) => {
  switch (language) {
    case UserLanguageEnum.EN:
      return isAdminPanel ? `UserHesoyam ${user.name}` : 'You';

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
        ? 'payment has not been confirmed by the manager'
        : language === UserLanguageEnum.UA
          ? 'платіж не підтверджено менеджером'
          : 'платеж не подтвержден менеджером';

    case PaymentStatusEnum.Pending:
      return language === UserLanguageEnum.EN
        ? 'payment is still pending'
        : language === UserLanguageEnum.UA
          ? 'платіж ще очікує розгляду'
          : 'платеж еще ожидает рассмотрения';

    case PaymentStatusEnum.Success:
      return language === UserLanguageEnum.EN
        ? 'payment is successful'
        : language === UserLanguageEnum.UA
          ? 'платіж успішний'
          : 'платеж успешен';

    case PaymentStatusEnum.End:
      return language === UserLanguageEnum.EN
        ? 'The subscription for this payment has already expired'
        : language === UserLanguageEnum.UA
          ? 'Термін дії підписки по цьому платежу вже закінчився'
          : 'Срок действия подписки по этому платежу уже истек';
  }
};
