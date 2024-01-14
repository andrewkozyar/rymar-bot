import TelegramBot from 'node-telegram-bot-api';
import { UserLanguageEnum } from 'src/helper';
import { PromocodeService } from 'src/promocode/promocode.service';
import { User } from 'src/user/user.entity';

export const sendPromocodesKeyboard = async (
  id: number,
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

  await bot.sendMessage(
    id,
    `🗑️ ${
      user.language === UserLanguageEnum.EN
        ? 'Choose promocode:'
        : user.language === UserLanguageEnum.UA
          ? 'Виберіть промокод:'
          : 'Выберите промокод:'
    }`,
    {
      reply_markup: {
        remove_keyboard: true,
        inline_keyboard,
      },
    },
  );
};
