import TelegramBot from 'node-telegram-bot-api';
import { ChannelService } from 'src/bot-hesoyam/chanel/channel.service';
import { BotEnum, LogTypeEnum } from 'src/helper';
import { LogService } from 'src/log/log.service';

export const actionChannelPost = async (
  bot: TelegramBot,
  channelService: ChannelService,
  logService: LogService,
) => {
  return bot.on('channel_post', async (post) => {
    try {
      const chanel = await channelService.create({
        chat_id: post.chat.id,
        name: post.chat.title,
        type: post.chat.type,
      });

      if (chanel.resend_to) {
        await bot.forwardMessage(
          chanel.resend_to,
          chanel.chat_id,
          Number(post.message_id),
        );
      }
    } catch (e) {
      logService.create({
        action: 'channel_post',
        info: JSON.stringify(e.stack),
        type: LogTypeEnum.ERROR,
        bot: BotEnum.HESOYAM,
      });
    }
  });
};
