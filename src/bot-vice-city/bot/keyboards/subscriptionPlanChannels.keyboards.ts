import TelegramBot from 'node-telegram-bot-api';
import { UserLanguageEnum } from 'src/helper';
import { User } from 'src/bot-vice-city/user/user.entity';
import { ChannelService } from 'src/bot-vice-city/chanel/channel.service';
import { SubscriptionPlan } from 'src/bot-vice-city/subscriptionPlan/subscriptionPlan.entity';

export const editSubscriptionPlanChannelsKeyboard = async (
  chat_id: number,
  message_id: number,
  bot: TelegramBot,
  subscriptionPlan: SubscriptionPlan,
  channelService: ChannelService,
  user: User,
) => {
  const callback_data = 'PlanChannel;';

  const channels = await channelService.find(true);

  const inline_keyboard = channels.map((channel) => [
    {
      text: `${channel.name} ${
        subscriptionPlan.channels.find((ch) => ch.id === channel.id)
          ? '✅'
          : '❌'
      }`,
      callback_data: callback_data + channel.id,
    },
  ]);

  inline_keyboard.push([
    {
      text: `⬅️ ${
        user.language === UserLanguageEnum.EN
          ? 'Back'
          : user.language === UserLanguageEnum.UA
            ? 'Назад'
            : 'Назад'
      }`,
      callback_data: 'AdminChooseSubscriptionPlan;' + subscriptionPlan.id,
    },
  ]);

  await bot.editMessageText(
    `${
      user.language === UserLanguageEnum.UA
        ? 'Виберіть канал:'
        : 'Выберите канал:'
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
