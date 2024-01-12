import TelegramBot from 'node-telegram-bot-api';

export const sendAdminPanelKeyboard = async (id: number, bot: TelegramBot) => {
  await bot.sendMessage(id, '👔 Your admin panel:', {
    reply_markup: {
      remove_keyboard: true,
      inline_keyboard: [
        [
          {
            text: '📋 Subscription plans',
            callback_data: 'SendSubscriptionPlanAdminKeyboard',
          },
          {
            text: '🎁 Promocodes',
            callback_data: 'AdminPromocodes',
          },
        ],
        [
          {
            text: '💸 User transactions',
            callback_data: 'AdminUserTransactions',
          },
        ],
        [
          {
            text: '👤 My account',
            callback_data: 'BackToAccount',
          },
        ],
      ],
    },
  });
};
