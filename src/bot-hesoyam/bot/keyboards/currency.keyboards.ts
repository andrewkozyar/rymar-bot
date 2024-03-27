import TelegramBot from 'node-telegram-bot-api';
import {
  CurrencyEnum,
  RatesInterface,
  UserLanguageEnum,
  currencies,
} from 'src/helper';
import { UserHesoyam } from 'src/bot-hesoyam/user/user.entity';

export const editCurrencyKeyboard = async (
  chat_id: number,
  message_id: number,
  bot: TelegramBot,
  callback_data: string,
  cancel: string,
  user: UserHesoyam,
  rates: RatesInterface,
) => {
  const inline_keyboard = [];
  const text =
    user.language === UserLanguageEnum.EN
      ? `Choose currency. Today's exchange rate to USD:
`
      : user.language === UserLanguageEnum.UA
        ? `Виберіть валюту. Сьогоднішній курс до USD:
`
        : `Выберите валюту. Сегодняшний курс к USD:
`;

  currencies.forEach((currency) => {
    inline_keyboard.push([
      {
        text: currency,
        callback_data: callback_data + currency,
      },
    ]);
  });

  inline_keyboard.push([
    {
      text: `🚫 ${
        user.language === UserLanguageEnum.EN
          ? 'Cancel'
          : user.language === UserLanguageEnum.UA
            ? 'Скасувати'
            : 'Отмена'
      }`,
      callback_data: cancel,
    },
  ]);

  await bot.editMessageText(
    text +
      `${currencies.map((currency) =>
        currency === CurrencyEnum.USD
          ? ''
          : `
${currency}: ${rates[currency]}`,
      )}`,
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
};
