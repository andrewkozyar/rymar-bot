import TelegramBot from 'node-telegram-bot-api';
import { UserLanguageEnum } from 'src/helper';
import { PaymentHesoyam } from 'src/bot-hesoyam/payment/payment.entity';
import { PaymentMethodHesoyam } from 'src/bot-hesoyam/paymentMethod/paymentMethod.entity';
import { PromocodeHesoyam } from 'src/bot-hesoyam/promocode/promocode.entity';
import { SubscriptionPlanHesoyam } from 'src/bot-hesoyam/subscriptionPlan/subscriptionPlan.entity';
import { UserHesoyam } from 'src/bot-hesoyam/user/user.entity';

export const sendGiveUserAccessKeyboard = async (
  id: number | string,
  bot: TelegramBot,
  user: UserHesoyam,
  customer: UserHesoyam,
  payment: PaymentHesoyam,
  plan: SubscriptionPlanHesoyam,
  paymentMethod: PaymentMethodHesoyam,
  promocode: PromocodeHesoyam,
) => {
  const text = getMainText(
    user.language,
    customer,
    payment,
    plan,
    paymentMethod,
    promocode,
  );

  await bot.forwardMessage(
    user.chat_id,
    customer.chat_id,
    Number(payment.screenshot_message_id),
  );
  return await bot.sendMessage(id, text, {
    parse_mode: 'HTML',
    reply_markup: {
      remove_keyboard: true,
      inline_keyboard: [
        [
          {
            text:
              user.language === UserLanguageEnum.EN
                ? '✅ Confirm user payment'
                : user.language === UserLanguageEnum.UA
                  ? '✅ Підтвердити оплату користувача'
                  : '✅ Подтвердить платеж пользователя',
            callback_data: 'GiveUserAccessConfirm;' + payment.id,
          },
          {
            text:
              user.language === UserLanguageEnum.EN
                ? '❌ Decline user payment'
                : user.language === UserLanguageEnum.UA
                  ? '❌ Відхилити оплату користувача'
                  : '❌ Отклонить оплату пользователя',
            callback_data: 'GiveUserAccessDecline;' + payment.id,
          },
        ],
        // [
        //   {
        //     text:
        //       user.language === UserLanguageEnum.EN
        //         ? '🚫 Cancel'
        //         : user.language === UserLanguageEnum.UA
        //           ? '🚫 Скасувати'
        //           : '🚫 Отменить',
        //     callback_data: callback_data + 'Europe/Rome',
        //   },
        // ],
      ],
    },
  });
};

const getMainText = (
  language: UserLanguageEnum,
  customer: UserHesoyam,
  payment: PaymentHesoyam,
  plan: SubscriptionPlanHesoyam,
  paymentMethod: PaymentMethodHesoyam,
  promocode: PromocodeHesoyam,
) => {
  switch (language) {
    case UserLanguageEnum.EN:
      return `‼️ New customer
<b>nickname</b>: @${customer.name}
<b>subscription plan</b>: ${plan[`name${language}`]}
<b>payment amount</b>: ${payment.amount} ${payment.currency}
<b>promocode</b>: ${promocode ? promocode.name : 'no promocode'}
<b>payment method</b>: ${paymentMethod.name}
<b>payment address</b>: ${payment.address}
<b>payment date</b>: ${payment.created_date}`;

    case UserLanguageEnum.UA:
      return `‼️ Новий клієнт
<b>nickname</b>: @${customer.name}
<b>план підписки</b>: ${plan[`name${language}`]}
<b>сума оплати</b>: ${payment.amount} ${payment.currency}
<b>промокод</b>: ${promocode ? promocode.name : 'без промокоду'}
<b>спосіб оплати</b>: ${paymentMethod.name}
<b>платіжна адреса</b>: ${payment.address}
<b>дата оплати</b>: ${payment.created_date}`;

    case UserLanguageEnum.RU:
      return `‼️ Новый клиент
<b>nickname</b>: @${customer.name}
<b>план подписки</b>: ${plan[`name${language}`]}
<b>сумма оплаты</b>: ${payment.amount} ${payment.currency}
<b>промокод</b>: ${promocode ? promocode.name : 'нет промокода'}
<b>способ оплаты</b>: ${paymentMethod.name}
<b>платежный адрес</b>: ${payment.address}
<b>дата платежа</b>: ${payment.created_date}`;
  }
};
