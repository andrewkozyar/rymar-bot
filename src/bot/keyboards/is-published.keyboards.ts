import TelegramBot from 'node-telegram-bot-api';

export const sendIsPublishedKeyboard = async (
  id: number,
  bot: TelegramBot,
  callback_data: string,
  cancel: string,
) => {
  await bot.sendMessage(id, `Choose publish status.`, {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: `Is published`,
            callback_data: callback_data + 'true',
          },
          {
            text: `Is not published`,
            callback_data: callback_data + 'false',
          },
        ],
        [
          {
            text: `🚫 Cancel`,
            callback_data: cancel,
          },
        ],
      ],
    },
  });
};
