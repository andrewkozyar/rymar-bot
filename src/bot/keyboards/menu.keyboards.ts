import TelegramBot from 'node-telegram-bot-api';
import { UserLanguageEnum } from '../../helper';

export const sendMenuKeyboard = async (
  id: number,
  bot: TelegramBot,
  message: string,
  lang: UserLanguageEnum,
) => {
  await bot.sendMessage(id, message, {
    disable_notification: true,
    reply_markup: {
      resize_keyboard: true,
      keyboard: [
        [
          {
            text:
              lang === UserLanguageEnum.EN
                ? '🗒️ Subscription plans'
                : lang === UserLanguageEnum.UA
                  ? '🗒️ Плани підписок'
                  : '🗒️ Планы подписок',
          },
          {
            text:
              lang === UserLanguageEnum.EN
                ? '🧾 My Subscription'
                : lang === UserLanguageEnum.UA
                  ? '🧾 Моя підписка'
                  : '🧾 Моя подписка',
          },
        ],
        [
          {
            text:
              lang === UserLanguageEnum.EN
                ? '👤 My Account'
                : lang === UserLanguageEnum.UA
                  ? '👤 Мій акаунт'
                  : '👤 Мой аккаунт',
          },
          {
            text:
              lang === UserLanguageEnum.EN
                ? '🤝 Support'
                : lang === UserLanguageEnum.UA
                  ? '🤝 Допомога'
                  : '🤝 Помощь',
          },
        ],
      ],
    },
  });
};
