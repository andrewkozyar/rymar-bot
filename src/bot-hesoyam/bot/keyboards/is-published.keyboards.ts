import TelegramBot from 'node-telegram-bot-api';
import { UserLanguageEnum } from 'src/helper';
import { UserHesoyam } from '../../user/user.entity';

export const editIsPublishedKeyboard = async (
  chat_id: number,
  message_id: number,
  bot: TelegramBot,
  callback_data: string,
  cancel: string,
  user: UserHesoyam,
  is_multiple: boolean = false,
) => {
  const inline_keyboard = [
    [
      {
        text: `✅ ${
          is_multiple
            ? 'Многоразовый'
            : user.language === UserLanguageEnum.UA
              ? 'Опубліковано'
              : 'Опубликовано'
        }`,
        callback_data: callback_data + 'true',
      },
      {
        text: `❌ ${
          is_multiple
            ? 'Одноразовый'
            : user.language === UserLanguageEnum.UA
              ? 'Не опубліковано'
              : 'Не опубликовано'
        }`,
        callback_data: callback_data + 'false',
      },
    ],
    [
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
    ],
  ];

  await bot.editMessageText(
    user.language === UserLanguageEnum.EN
      ? 'Choose publish status.'
      : user.language === UserLanguageEnum.UA
        ? 'Виберіть статус публікації.'
        : 'Выберите статус публикации.',
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
