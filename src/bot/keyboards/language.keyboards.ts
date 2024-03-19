import TelegramBot from 'node-telegram-bot-api';

export const editLanguageKeyboard = async (
  chat_id: number,
  bot: TelegramBot,
  isUser: boolean,
  message_id: number,
) => {
  const callback_data = isUser ? 'ChangeLanguage;' : 'FirstLogin;';

  await bot.editMessageText('Choose your language:', {
    chat_id,
    message_id,
  });

  await bot.editMessageReplyMarkup(
    {
      inline_keyboard: [
        [
          {
            text: '🇷🇺 Русский',
            callback_data: callback_data + 'RU',
          },
          // {
          //   text: '🇺🇸 English',
          //   callback_data: callback_data + 'EN',
          // },
        ],
        [
          // {
          //   text: 'Polski',
          //   callback_data: callback_data + 'PL',
          // },
          {
            text: '🇺🇦 Українська',
            callback_data: callback_data + 'UA',
          },
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
      ],
    },
    {
      chat_id,
      message_id,
    },
  );
};

export const sendLanguageKeyboard = async (
  id: number,
  bot: TelegramBot,
  isUser: boolean,
) => {
  const callback_data = isUser ? 'ChangeLanguage;' : 'FirstLogin;';

  await bot.sendMessage(id, 'Выберите язык:', {
    reply_markup: {
      remove_keyboard: true,
      inline_keyboard: [
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
      ],
    },
  });
};
