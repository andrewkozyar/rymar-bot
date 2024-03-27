import TelegramBot from 'node-telegram-bot-api';
import { UserLanguageEnum } from 'src/helper';
import { UserHesoyam } from 'src/bot-hesoyam/user/user.entity';

export const sendTextWithCancelKeyboard = async (
  id: number,
  bot: TelegramBot,
  text: string,
  callback_data: string,
  user: UserHesoyam,
) => {
  const inline_keyboard = [
    [
      {
        text: `🚫 ${
          user.language === UserLanguageEnum.EN
            ? 'Cancel'
            : user.language === UserLanguageEnum.UA
              ? 'Скасувати'
              : 'Отменить'
        }`,
        callback_data: callback_data,
      },
    ],
  ];
  await bot.sendMessage(
    id,
    text,
    callback_data
      ? {
          reply_markup: {
            inline_keyboard,
          },
          parse_mode: 'HTML',
        }
      : {
          parse_mode: 'HTML',
        },
  );
};

export const editTextWithCancelKeyboard = async (
  chat_id: number,
  message_id: number,
  bot: TelegramBot,
  text: string,
  callback_data: string,
  user: UserHesoyam,
) => {
  const inline_keyboard = [
    [
      {
        text: `🚫 ${
          user.language === UserLanguageEnum.EN
            ? 'Cancel'
            : user.language === UserLanguageEnum.UA
              ? 'Скасувати'
              : 'Отменить'
        }`,
        callback_data: callback_data,
      },
    ],
  ];

  await bot.editMessageText(text, {
    chat_id,
    message_id,
    parse_mode: 'HTML',
  });

  if (callback_data) {
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
