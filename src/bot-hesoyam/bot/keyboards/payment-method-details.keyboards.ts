import TelegramBot from 'node-telegram-bot-api';
import { CurrencyEnum, UserLanguageEnum } from 'src/helper';
import { PaymentMethodHesoyam } from 'src/bot-hesoyam/paymentMethod/paymentMethod.entity';
import { SubscriptionPlanHesoyam } from 'src/bot-hesoyam/subscriptionPlan/subscriptionPlan.entity';
import { UserHesoyam } from 'src/bot-hesoyam/user/user.entity';

export const editPaymentMethodDetailsKeyboard = async (
  chat_id: number,
  message_id: number,
  bot: TelegramBot,
  paymentMethod: PaymentMethodHesoyam,
  plan: SubscriptionPlanHesoyam,
  user: UserHesoyam,
  price: number,
  newPrice?: number,
) => {
  const priceToShow = newPrice
    ? `<s>${price}</s> <b>${newPrice} ${
        paymentMethod.currency === CurrencyEnum.USDT
          ? paymentMethod.currency + ' TRC20'
          : paymentMethod.currency
      }</b>`
    : `<b>${price?.toString()} ${paymentMethod.currency}</b>`;

  const text =
    user.language === UserLanguageEnum.EN
      ? `After payment, press the "I paid" button and send a screenshot of the payment here in a message. The bot will check the payment and send a link to the channels in a few minutes.

Pay ${priceToShow} to the account that will arrive in the next message. Attention, carefully check the payment method, amount and network so as not to lose funds!`
      : user.language === UserLanguageEnum.UA
        ? `Після оплати натиніть кнопку "Я оплатив" та надішліть скріншот з оплатою сюди в повідомлення. Бот перевірить оплату та за кілька хвилин надішле посилання в канали.
        
Оплатіть ${priceToShow} на рахунок який прийде наступним повідомленням. Увага перевірте уважно метод оплати, суму  та мережу, щоб не втратити кошти!\n\nІ заповніть адресу електронної пошти у вкладці "👤 Мій акаунт", щоб отримувати актуальні сповіщення!`
        : `После оплаты нажмите кнопку "Я оплатил" и отправьте скриншот с оплатой сюда в сообщение. Бот проверит оплату и через несколько минут отправит ссылку в каналы.

Оплатите ${priceToShow} на счет, который придет следующим сообщением. Внимание проверьте метод оплаты, сумму и сеть, чтобы не потерять средства!\n\nИ заполните адрес электронной почты во вкладке "👤 Мой аккаунт", чтобы получать актуальные уведомления!`;

  const inline_keyboard = [
    [
      {
        text: `💵 ${
          user.language === UserLanguageEnum.EN
            ? 'I paid'
            : user.language === UserLanguageEnum.UA
              ? 'Я оплатив'
              : 'Я оплатил'
        }`,
        callback_data: 'UserPaid;' + paymentMethod.id,
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
        callback_data: 'BuySubscriptionPlan;' + plan.id,
      },
    ],
  ];

  await bot.editMessageText(
    paymentMethod[`description${user.language}`] +
      `
    
` +
      text,
    {
      chat_id,
      message_id,
      parse_mode: 'HTML',
    },
  );

  await bot.editMessageReplyMarkup(
    {
      inline_keyboard,
    },
    {
      chat_id,
      message_id,
    },
  );

  const addressText =
    user.language === UserLanguageEnum.EN
      ? `Payment address for ${paymentMethod.name}:

Click to copy 👇

`
      : user.language === UserLanguageEnum.UA
        ? `Платіжна адреса для ${paymentMethod.name}:

Натисніть щоб скопіювати 👇

`
        : `Платежный адрес для ${paymentMethod.name}:

Нажмите, чтобы скопировать 👇

`;

  return await bot.sendMessage(
    chat_id,
    addressText + '`' + paymentMethod.address + '`',
    {
      parse_mode: 'Markdown',
    },
  );
};
