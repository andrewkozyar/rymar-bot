import TelegramBot from 'node-telegram-bot-api';
import { UserLanguageEnum } from 'src/helper';
import { User } from 'src/user/user.entity';

export const sendIsPublishedKeyboard = async (
  id: number,
  bot: TelegramBot,
  callback_data: string,
  cancel: string,
  user: User,
) => {
  await bot.sendMessage(
    id,
    user.language === UserLanguageEnum.EN
      ? 'Choose publish status.'
      : user.language === UserLanguageEnum.UA
        ? 'Виберіть статус публікації.'
        : 'Выберите статус публикации.',
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: `${
                user.language === UserLanguageEnum.EN
                  ? 'Is published'
                  : user.language === UserLanguageEnum.UA
                    ? 'Опубліковано'
                    : 'Опубликовано'
              } ✅`,
              callback_data: callback_data + 'true',
            },
            {
              text: `${
                user.language === UserLanguageEnum.EN
                  ? 'Is not published'
                  : user.language === UserLanguageEnum.UA
                    ? 'Не опубліковано'
                    : 'Не опубликовано'
              } ❌`,
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
        ],
      },
    },
  );
};
