import TelegramBot from 'node-telegram-bot-api';
import { UserLanguageEnum } from 'src/helper';
import { UserService } from 'src/bot-vice-city/user/user.service';

export const notifyAdminAboutNewUser = async (
  bot: TelegramBot,
  nickname: string,
  userService: UserService,
) => {
  const admin = await userService.findOne({
    name: 'rymar_m',
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
