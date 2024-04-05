import TelegramBot from 'node-telegram-bot-api';
import { BotEnum, UserLanguageEnum } from 'src/helper';
import { UserService } from 'src/bot-hesoyam/user/user.service';

export const notifyAdminAboutNewUser = async (
  bot: TelegramBot,
  nickname: string,
  userService: UserService,
  botType: BotEnum,
) => {
  const admin = await userService.findOne({
    name: 'tomera_study',
    bot: botType,
  });

  if (admin) {
    return await bot.sendMessage(
      admin.chat_id,
      admin.language === UserLanguageEnum.UA
        ? `❕👤 в системі з'явився новий користувач @${nickname}`
        : `❕👤 в системе появился новый пользователь @${nickname}`,
    );
  }
};
