import TelegramBot from 'node-telegram-bot-api';
import { ChannelService } from 'src/chanel/channel.service';
import { PaymentService } from 'src/payment/payment.service';
import { PromocodeService } from 'src/promocode/promocode.service';
import { SubscriptionPlanService } from 'src/subscriptionPlan/subscriptionPlan.service';
import { UserService } from 'src/user/user.service';
import { sendAccountKeyboard } from '../keyboards/account.keyboards';
import { sendLanguageKeyboard } from '../keyboards/language.keyboards';
import { sendMenuKeyboard } from '../keyboards/menu.keyboards';
import { sendMySubscriptionKeyboard } from '../keyboards/my-subscription.keyboards';
import { sendSubscriptionPlanDetailsKeyboard } from '../keyboards/subscription-plan-details.keyboards';
import { sendSubscriptionPlanKeyboard } from '../keyboards/subscription-plans.keyboards';
import { RedisService } from 'src/redis/redis.service';
import { sendTransactionsKeyboard } from '../keyboards/transactions.keyboards';
import { UpdateDto as UpdatePlanDto } from 'src/subscriptionPlan/dto';
import { sendSubscriptionPlanAdminDetailsKeyboard } from '../keyboards/subscription-plan-admin-details.keyboards';
import { sendPromocodeAdminDetailsKeyboard } from '../keyboards/promocode-admin-details.keyboards';
import { UpdateDto as UpdatePromocodeDto } from 'src/promocode/dto';
import { UserLanguageEnum } from 'src/helper';

export const actionMessage = (
  bot: TelegramBot,
  userService: UserService,
  redisService: RedisService,
  planService: SubscriptionPlanService,
  promocodeService: PromocodeService,
  paymentService: PaymentService,
  channelService: ChannelService,
) => {
  return bot.on('message', async (msg) => {
    if (msg.chat.id < 0) {
      return await channelService.create({
        chat_id: msg.chat.id,
        name: msg.chat.title,
        type: msg.chat.type,
      });
    }

    const user = await userService.findOne({ chat_id: msg.chat.id });

    if (msg.text === '/start' || !user) {
      if (user) {
        await clearUserRedisData(redisService, user.id);
      }
      return await sendLanguageKeyboard(msg.chat.id, bot, !!user);
    }

    // menu buttons
    if (
      [
        '🗒️ Subscription plans',
        '🗒️ Плани підписок',
        '🗒️ Планы подписок',
      ].includes(msg.text)
    ) {
      await clearUserRedisData(redisService, user.id);

      return await sendSubscriptionPlanKeyboard(
        msg.chat.id,
        bot,
        planService,
        false,
        user.language,
      );
    }

    if (
      ['🧾 My Subscription', '🧾 Моя підписка', '🧾 Моя подписка'].includes(
        msg.text,
      )
    ) {
      await clearUserRedisData(redisService, user.id);

      return await sendMySubscriptionKeyboard(
        msg.chat.id,
        bot,
        user,
        paymentService,
      );
    }

    if (
      ['👤 My Account', '👤 Мій акаунт', '👤 Мой аккаунт'].includes(msg.text)
    ) {
      await clearUserRedisData(redisService, user.id);

      return await sendAccountKeyboard(msg.chat.id, bot, user);
    }

    if (['🤝 Support', '🤝 Допомога', '🤝 Помощь'].includes(msg.text)) {
      await clearUserRedisData(redisService, user.id);

      return await bot.sendMessage(
        msg.chat.id,
        user.language === UserLanguageEnum.EN
          ? 'For support, please contact @rymar'
          : user.language === UserLanguageEnum.UA
            ? 'Щоб отримати підтримку, зв’яжіться з @rymar'
            : 'Для поддержки обращайтесь к @rymar',
      );
    }

    // change email
    const emailData = await redisService.get(`ChangeEmail-${user.id}`);

    if (emailData === 'waiting') {
      const updatedUser = await userService.update(user.id, {
        email: msg.text,
      });
      await sendMenuKeyboard(
        msg.chat.id,
        bot,
        'Email is changed',
        user.language,
      );
      await redisService.delete(`ChangeEmail-${user.id}`);
      return await sendAccountKeyboard(msg.chat.id, bot, updatedUser);
    }

    // use promocode
    const promocodeData = await redisService.get(`Promocode-${user.id}`);

    if (promocodeData) {
      const promocode = await promocodeService.findOne({
        name: msg.text,
        is_published: true,
      });
      const plan = await planService.findOne({ id: promocodeData });
      await redisService.delete(`Promocode-${user.id}`);

      if (promocode) {
        return await sendSubscriptionPlanDetailsKeyboard(
          msg.chat.id,
          bot,
          plan,
          redisService,
          user,
          promocode,
        );
      }

      await bot.sendMessage(msg.chat.id, 'Wrong promocode!');
      return await sendSubscriptionPlanDetailsKeyboard(
        msg.chat.id,
        bot,
        plan,
        redisService,
        user,
      );
    }

    // get user transactions
    const adminUserTransactionsData = await redisService.get(
      `AdminUserTransactions-${user.id}`,
    );

    if (adminUserTransactionsData) {
      await redisService.delete(`AdminUserTransactions-${user.id}`);

      const finedUser = await userService.findOne({ name: msg.text });

      if (!finedUser) {
        return await bot.sendMessage(
          msg.chat.id,
          `User ${msg.text} is not fined!`,
        );
      }

      return await sendTransactionsKeyboard(
        msg.chat.id,
        bot,
        finedUser,
        paymentService,
        true,
        user.language,
      );
    }

    // update subscription plan
    const redisSubscriptionPlanData = await redisService.get(
      `EditSubscriptionPlanAdmin-${user.id}`,
    );

    if (redisSubscriptionPlanData) {
      await redisService.delete(`EditSubscriptionPlanAdmin-${user.id}`);

      const planData: UpdatePlanDto = JSON.parse(redisSubscriptionPlanData);
      planData[planData.field] = msg.text;

      const plan = await planService.update({
        ...planData,
      });

      return await sendSubscriptionPlanAdminDetailsKeyboard(
        msg.chat.id,
        bot,
        plan,
        redisService,
        user,
      );
    }

    // update promocode
    const redisPromocodeAdminData = await redisService.get(
      `EditPromocodeAdmin-${user.id}`,
    );

    if (redisPromocodeAdminData) {
      await redisService.delete(`EditPromocodeAdmin-${user.id}`);

      const promocodeData: UpdatePromocodeDto = JSON.parse(
        redisPromocodeAdminData,
      );
      promocodeData[promocodeData.field] = msg.text;

      const promocode = await promocodeService.update({
        ...promocodeData,
      });

      return await sendPromocodeAdminDetailsKeyboard(
        msg.chat.id,
        bot,
        promocode,
        redisService,
        user,
      );
    }

    return await sendMenuKeyboard(
      msg.chat.id,
      bot,
      user.language === UserLanguageEnum.EN
        ? 'Wrong value'
        : user.language === UserLanguageEnum.UA
          ? 'Неправильне значення'
          : 'Неверное значение',
      user.language,
    );
  });
};

export const clearUserRedisData = async (
  redisService: RedisService,
  userId: string,
) => {
  await redisService.delete(`BuySubscriptionPlan-${userId}`);
  await redisService.delete(`ChangeEmail-${userId}`);
  await redisService.delete(`Promocode-${userId}`);
  await redisService.delete(`AdminUserTransactions-${userId}`);
  await redisService.delete(`EditSubscriptionPlanAdmin-${userId}`);
  await redisService.delete(`EditPromocodeAdmin-${userId}`);
};
