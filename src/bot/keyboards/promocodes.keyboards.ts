import TelegramBot from 'node-telegram-bot-api';
import { PromocodeService } from 'src/promocode/promocode.service';

export const sendPromocodesKeyboard = async (
  id: number,
  bot: TelegramBot,
  promocodeService: PromocodeService,
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
      text: `➕ New promocode`,
      callback_data: 'NewPromocode',
    },
    {
      text: `⬅️ Back`,
      callback_data: 'AdminPanel',
    },
  ]);

  await bot.sendMessage(id, 'Choose promocode:', {
    reply_markup: {
      remove_keyboard: true,
      inline_keyboard,
    },
  });
};
