import TelegramBot from 'node-telegram-bot-api';

export const sendLanguageKeyboard = async (
  chat_id: number,
  message_id: number,
  bot: TelegramBot,
  edit = false,
) => {
  const callback_data = 'ChangeLanguage;';

  const title = 'Выберите язык:';

  const inline_keyboard = [
    [
      {
        text: '🇷🇺 Русский',
        callback_data: callback_data + 'RU',
      },
      // {
      //   text: '🇺🇸 English',
      //   callback_data: callback_data + 'EN',
      // },
      {
        text: '🇺🇦 Українська',
        callback_data: callback_data + 'UA',
      },
    ],
    [
      // {
      //   text: 'Polski',
      //   callback_data: callback_data + 'PL',
      // },
    ],
    // [
    //   {
    //     text: 'Deutsch',
    //     callback_data: callback_data + 'GE',
    //   },
    //   {
    //     text: 'Română',
    //     callback_data: callback_data + 'RO',
    //   },
    // ],
    // [
    //   {
    //     text: 'Italiano',
    //     callback_data: callback_data + 'IT',
    //   },
    // ],
  ];

  if (!edit) {
    await bot.sendMessage(chat_id, title, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard,
      },
    });
  } else {
    await bot.editMessageText(title, {
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
