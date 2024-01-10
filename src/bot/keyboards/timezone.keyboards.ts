import TelegramBot from 'node-telegram-bot-api';

export const sendTimezoneKeyboard = async (id: number, bot: TelegramBot) => {
  const callback_data = 'ChangeTimezone;';

  await bot.sendMessage(id, 'Choose your timezone:', {
    reply_markup: {
      remove_keyboard: true,
      inline_keyboard: [
        [
          {
            text: 'UTC',
            callback_data: callback_data + 'UTC',
          },
        ],
        [
          {
            text: 'Europe/London',
            callback_data: callback_data + 'Europe/London',
          },
          {
            text: 'Europe/Berlin',
            callback_data: callback_data + 'Europe/Berlin',
          },
        ],
        [
          {
            text: 'Europe/Rome',
            callback_data: callback_data + 'Europe/Rome',
          },
          {
            text: 'Europe/Warsaw',
            callback_data: callback_data + 'Europe/Warsaw',
          },
        ],
        [
          {
            text: 'Europe/Kyiv',
            callback_data: callback_data + 'Europe/Kyiv',
          },
          {
            text: 'Europe/Bucharest',
            callback_data: callback_data + 'Europe/Bucharest',
          },
        ],
        [
          {
            text: 'Europe/Moscow',
            callback_data: callback_data + 'Europe/Moscow',
          },
          {
            text: 'Asia/Almaty',
            callback_data: callback_data + 'Asia/Almaty',
          },
        ],
      ],
    },
  });
};
