import TelegramBot from 'node-telegram-bot-api';
import { UserLanguageEnum } from 'src/helper';
import { PromocodeService } from 'src/bot-vice-city/promocode/promocode.service';
import { User } from 'src/bot-vice-city/user/user.entity';

export const editPromocodesKeyboard = async (
  chat_id: number,
  message_id: number,
  bot: TelegramBot,
  promocodeService: PromocodeService,
  user: User,
) => {
  const callback_data = 'AdminPromocodeDetails;';

  const { promocodes } = await promocodeService.find();

  const inline_keyboard = promocodes.map((promocode) => [
    {
      text: `${promocode.name}`,
      callback_data: callback_data + promocode.id,
    },
  ]);

  inline_keyboard.push([
    {
      text: `➕ ${
        user.language === UserLanguageEnum.EN
          ? 'New promocode'
          : user.language === UserLanguageEnum.UA
            ? 'Новий промокод'
            : 'Новый промокод'
      }`,
      callback_data: 'NewPromocode',
    },
    {
      text: `⬅️ ${
        user.language === UserLanguageEnum.EN
          ? 'Back'
          : user.language === UserLanguageEnum.UA
            ? 'Назад'
            : 'Назад'
      }`,
      callback_data: 'AdminPanel',
    },
  ]);

  await bot.editMessageText(
    `🗑️ ${
      user.language === UserLanguageEnum.EN
        ? 'Choose promocode:'
        : user.language === UserLanguageEnum.UA
          ? 'Виберіть промокод:'
          : 'Выберите промокод:'
    }`,
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
