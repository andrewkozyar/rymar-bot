import TelegramBot from 'node-telegram-bot-api';
import { ChannelService } from 'src/chanel/channel.service';

export const actionChannelPost = (
  bot: TelegramBot,
  channelService: ChannelService,
) => {
  return bot.on('channel_post', async (post) => {
    await channelService.create({
      chat_id: post.chat.id,
      name: post.chat.title,
      type: post.chat.type,
    });
  });
};
