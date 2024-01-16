import TelegramBot from 'node-telegram-bot-api';
import { CurrencyEnum, UserLanguageEnum } from 'src/helper';
import { PaymentMethod } from 'src/paymentMethod/paymentMethod.entity';
import { SubscriptionPlan } from 'src/subscriptionPlan/subscriptionPlan.entity';
import { User } from 'src/user/user.entity';

export const sendPaymentMethodDetailsKeyboard = async (
  id: number,
  bot: TelegramBot,
  paymentMethod: PaymentMethod,
  plan: SubscriptionPlan,
  user: User,
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
      ? `Pay ${priceToShow} to the account that will arrive in the next message. Attention, carefully check the payment method, amount and network so as not to lose funds!`
      : user.language === UserLanguageEnum.UA
        ? `Оплатіть ${priceToShow} на рахунок який прийде наступним повідомленням. Увага перевірте уважно метод оплати, суму  та мережу, щоб не втратити кошти!`
        : `Оплатите ${priceToShow} на счет, который придет следующим сообщением. Внимание проверьте метод оплаты, сумму и сеть, чтобы не потерять средства!`;

  await bot.sendMessage(id, text, {
    parse_mode: 'HTML',
    reply_markup: {
      remove_keyboard: true,
      inline_keyboard: [
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
      ],
    },
  });

  await bot.sendMessage(id, paymentMethod.address);
};
