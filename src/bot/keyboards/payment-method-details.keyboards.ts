import TelegramBot from 'node-telegram-bot-api';
import { UserLanguageEnum } from 'src/helper';
import { PaymentMethod } from 'src/paymentMethod/paymentMethod.entity';
import { Promocode } from 'src/promocode/promocode.entity';
import { SubscriptionPlan } from 'src/subscriptionPlan/subscriptionPlan.entity';
import { User } from 'src/user/user.entity';

export const sendPaymentMethodDetailsKeyboard = async (
  id: number,
  bot: TelegramBot,
  paymentMethod: PaymentMethod,
  plan: SubscriptionPlan,
  user: User,
  promocode?: Promocode,
) => {
  let newPrice;

  if (promocode) {
    newPrice = plan.price - (plan.price * promocode.sale_percent) / 100;
  }

  const price = newPrice
    ? `<s>${plan.price}</s> <b style="color:red">${newPrice}</b>`
    : plan.price.toString();

  const text =
    user.language === UserLanguageEnum.EN
      ? `Pay ${price}$ to the account that will arrive in the next message. Attention, carefully check the payment method, amount and network so as not to lose funds!`
      : user.language === UserLanguageEnum.UA
        ? `Оплатіть ${price}$ на рахунок який прийде наступним повідомленням. Увага перевірте уважно метод оплати, суму  та мережу, щоб не втратити кошти!`
        : `Оплатите ${price}$ на счет, который придет следующим сообщением. Внимание проверьте метод оплаты, сумму и сеть, чтобы не потерять средства!`;

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
