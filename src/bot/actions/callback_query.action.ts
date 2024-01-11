import TelegramBot from 'node-telegram-bot-api';
import { ChannelService } from 'src/chanel/channel.service';
import { UserLanguageEnum } from 'src/helper';
import { PaymentService } from 'src/payment/payment.service';
import { SubscriptionPlanService } from 'src/subscriptionPlan/subscriptionPlan.service';
import { UserService } from 'src/user/user.service';
import { sendAccountKeyboard } from '../keyboards/account.keyboards';
import { sendLanguageKeyboard } from '../keyboards/language.keyboards';
import { sendMenuKeyboard } from '../keyboards/menu.keyboards';
import { sendMySubscriptionKeyboard } from '../keyboards/my-subscription.keyboards';
import { sendSubscriptionPlanDetailsKeyboard } from '../keyboards/subscription-plan-details.keyboards';
import { sendSubscriptionPlanKeyboard } from '../keyboards/subscription-plans.keyboards';
import { sendTimezoneKeyboard } from '../keyboards/timezone.keyboards';
import { sendTransactionsKeyboard } from '../keyboards/transactions.keyboards';
import { RedisService } from 'src/redis/redis.service';
import { sendAdminPanelKeyboard } from '../keyboards/adminPanel.keyboards';
import { PromocodeService } from 'src/promocode/promocode.service';
import { sendPromocodesKeyboard } from '../keyboards/promocodes.keyboards';
import { sendSubscriptionPlanAdminDetailsKeyboard } from '../keyboards/subscription-plan-admin-details.keyboards';
import { UpdateDto as UpdatePlanDto } from 'src/subscriptionPlan/dto';
import { sendIsPublishedKeyboard } from '../keyboards/is-published.keyboards';
import { sendTextWithCancelKeyboard } from '../keyboards/cancel.keyboards';
import { sendPromocodeAdminDetailsKeyboard } from '../keyboards/promocode-admin-details.keyboards';
import { UpdateDto as UpdatePromocodeDto } from 'src/promocode/dto';
import { clearUserRedisData } from './message.action';

export const actionCallbackQuery = (
  bot: TelegramBot,
  userService: UserService,
  redisService: RedisService,
  planService: SubscriptionPlanService,
  promocodeService: PromocodeService,
  paymentService: PaymentService,
  channelService: ChannelService,
) => {
  return bot.on('callback_query', async (query) => {
    const [key, data] = query.data.split(';');
    const user = await userService.findOne({
      chat_id: query.message.chat.id,
    });

    if (user) {
      await redisService.delete(`ChangeEmail-${user.id}`);
    }

    if (key === 'FirstLogin') {
      const createdUser =
        user ||
        (await userService.create({
          chat_id: query.message.chat.id,
          language: data as unknown as UserLanguageEnum,
          name: query.message.chat.username,
        }));

      await sendMenuKeyboard(
        query.message.chat.id,
        bot,
        'Hi. Let`s start',
        createdUser.language,
      );

      return await sendAccountKeyboard(query.message.chat.id, bot, createdUser);
    }

    if (key === 'ChangeLanguageMenu') {
      return await sendLanguageKeyboard(query.message.chat.id, bot, true);
    }

    if (key === 'ChangeLanguage') {
      const updatedUser = await userService.update(user.id, {
        language: data as unknown as UserLanguageEnum,
      });
      await sendMenuKeyboard(
        query.message.chat.id,
        bot,
        'Language is changed',
        updatedUser.language,
      );
      return await sendAccountKeyboard(query.message.chat.id, bot, updatedUser);
    }

    if (key === 'ChangeTimezoneMenu') {
      return await sendTimezoneKeyboard(query.message.chat.id, bot);
    }

    if (key === 'ChangeTimezone') {
      const updatedUser = await userService.update(user.id, {
        timezone: data,
      });
      await sendMenuKeyboard(
        query.message.chat.id,
        bot,
        'Timezone is changed',
        user.language,
      );
      return await sendAccountKeyboard(query.message.chat.id, bot, updatedUser);
    }

    if (key === 'BackToAccount') {
      await clearUserRedisData(redisService, user.id);

      return await sendAccountKeyboard(query.message.chat.id, bot, user);
    }

    if (key === 'ChangeEmailMessage') {
      await redisService.add(`ChangeEmail-${user.id}`, 'waiting');

      return await sendTextWithCancelKeyboard(
        query.message.chat.id,
        bot,
        user.language === UserLanguageEnum.EN
          ? 'Enter your email address!'
          : user.language === UserLanguageEnum.UA
            ? 'Введіть адресу вашої електронної пошти!'
            : 'Введите ваш адрес электронной почты!',
        'BackToAccount',
        user,
      );
    }

    if (key === 'ChooseSubscriptionPlan') {
      const plan = await planService.findOne({ id: data });

      return await sendSubscriptionPlanDetailsKeyboard(
        query.message.chat.id,
        bot,
        plan,
        redisService,
        user,
      );
    }

    if (key === 'AdminChooseSubscriptionPlan') {
      const plan = await planService.findOne({ id: data });

      if (!plan) {
        return;
      }

      return await sendSubscriptionPlanAdminDetailsKeyboard(
        query.message.chat.id,
        bot,
        plan,
        redisService,
        user,
      );
    }

    if (key === 'AdminPromocodeDetails') {
      const promocode = await promocodeService.findOne({ id: data });

      return await sendPromocodeAdminDetailsKeyboard(
        query.message.chat.id,
        bot,
        promocode,
        redisService,
        user,
      );
    }

    if (key === 'SendSubscriptionPlanKeyboard') {
      return await sendSubscriptionPlanKeyboard(
        query.message.chat.id,
        bot,
        planService,
        false,
        user.language,
      );
    }

    if (key === 'SendSubscriptionPlanAdminKeyboard') {
      return await sendSubscriptionPlanKeyboard(
        query.message.chat.id,
        bot,
        planService,
        true,
        user.language,
      );
    }

    if (key === 'Promocode') {
      await redisService.add(`Promocode-${user.id}`, data);

      return await bot.sendMessage(
        query.message.chat.id,
        'Enter your promo code!',
      );
    }

    if (key === 'BuySubscriptionPlan') {
      const redisData = await redisService.get(
        `BuySubscriptionPlan-${user.id}`,
      );

      if (!redisData) {
        return;
      }

      const payData: {
        amount: number;
        subscription_plan_id: string;
        promocode_id?: string;
      } = JSON.parse(redisData);
      await redisService.delete(`BuySubscriptionPlan-${user.id}`);

      await paymentService.create({
        ...payData,
        user_id: user.id,
      });

      await bot.sendMessage(query.message.chat.id, 'Pay is success!');

      return await channelService.sendChannelsLinks(bot, query.message.chat.id);
    }

    if (key === 'ListOfTransactions') {
      return await sendTransactionsKeyboard(
        query.message.chat.id,
        bot,
        user,
        paymentService,
        false,
        user.language,
      );
    }

    if (key === 'MySubscription') {
      return await sendMySubscriptionKeyboard(
        query.message.chat.id,
        bot,
        user,
        paymentService,
      );
    }

    if (key === 'AdminPanel') {
      return await sendAdminPanelKeyboard(query.message.chat.id, bot);
    }

    if (key === 'AdminPromocodes') {
      return await sendPromocodesKeyboard(
        query.message.chat.id,
        bot,
        promocodeService,
      );
    }

    if (key === 'AdminUserTransactions') {
      await redisService.add(`AdminUserTransactions-${user.id}`, 'waiting');

      return await sendTextWithCancelKeyboard(
        query.message.chat.id,
        bot,
        `Enter user nickname!`,
        `AdminPanel`,
        user,
      );
    }

    if (key === 'EditSubscriptionPlanAdmin') {
      const redisData = await redisService.get(
        `EditSubscriptionPlanAdmin-${user.id}`,
      );

      const planData: UpdatePlanDto = JSON.parse(redisData);

      planData[data] = null;
      planData.field = data;

      await redisService.add(
        `EditSubscriptionPlanAdmin-${user.id}`,
        JSON.stringify(planData),
      );

      if (data === 'is_published') {
        return await sendIsPublishedKeyboard(
          query.message.chat.id,
          bot,
          'SubscriptionPlanIsPublished;',
          `AdminChooseSubscriptionPlan;${planData.id}`,
        );
      }

      if (['price', 'months_count'].includes(data)) {
        return await sendTextWithCancelKeyboard(
          query.message.chat.id,
          bot,
          `Enter user new ${data}! Should be number.`,
          `AdminChooseSubscriptionPlan;${planData.id}`,
          user,
        );
      }

      if (['descriptionEN', 'descriptionUA', 'descriptionRU'].includes(data)) {
        return await sendTextWithCancelKeyboard(
          query.message.chat.id,
          bot,
          `Enter user new ${data}! If there includes price write it not as number but as {{price}}. It needs for writing customers correct amount after using promo code.`,
          `AdminChooseSubscriptionPlan;${planData.id}`,
          user,
        );
      }

      return await sendTextWithCancelKeyboard(
        query.message.chat.id,
        bot,
        `Enter user new ${data}!`,
        `AdminChooseSubscriptionPlan;${planData.id}`,
        user,
      );
    }

    if (key === 'SubscriptionPlanIsPublished') {
      const redisData = await redisService.get(
        `EditSubscriptionPlanAdmin-${user.id}`,
      );
      await redisService.delete(`EditSubscriptionPlanAdmin-${user.id}`);

      const planData: UpdatePlanDto = JSON.parse(redisData);

      const plan = await planService.update({
        ...planData,
        is_published: data === 'true',
      });

      return await sendSubscriptionPlanAdminDetailsKeyboard(
        query.message.chat.id,
        bot,
        plan,
        redisService,
        user,
      );
    }

    if (key === 'AdminDeleteSubscriptionPlan') {
      const redisData = await redisService.get(
        `EditSubscriptionPlanAdmin-${user.id}`,
      );
      await redisService.delete(`EditSubscriptionPlanAdmin-${user.id}`);

      const planData: UpdatePlanDto = JSON.parse(redisData);

      await planService.remove(planData.id);

      return await sendSubscriptionPlanKeyboard(
        query.message.chat.id,
        bot,
        planService,
        true,
        user.language,
      );
    }

    if (key === 'NewSubscriptionPlan') {
      const plan = await planService.create();

      return await sendSubscriptionPlanAdminDetailsKeyboard(
        query.message.chat.id,
        bot,
        plan,
        redisService,
        user,
      );
    }

    if (key === 'EditPromocodeAdmin') {
      const redisData = await redisService.get(`EditPromocodeAdmin-${user.id}`);

      const promocodeData: UpdatePromocodeDto = JSON.parse(redisData);

      promocodeData[data] = null;
      promocodeData.field = data;

      await redisService.add(
        `EditPromocodeAdmin-${user.id}`,
        JSON.stringify(promocodeData),
      );

      if (data === 'is_published') {
        return await sendIsPublishedKeyboard(
          query.message.chat.id,
          bot,
          'PromocodeIsPublished;',
          `AdminPromocodeDetails;${promocodeData.id}`,
        );
      }

      if (data === 'sale_percent') {
        return await sendTextWithCancelKeyboard(
          query.message.chat.id,
          bot,
          `Enter user new ${data}! Should be number.`,
          `AdminPromocodeDetails;${promocodeData.id}`,
          user,
        );
      }

      return await sendTextWithCancelKeyboard(
        query.message.chat.id,
        bot,
        `Enter user new ${data}!`,
        `AdminPromocodeDetails;${promocodeData.id}`,
        user,
      );
    }

    if (key === 'PromocodeIsPublished') {
      const redisData = await redisService.get(`EditPromocodeAdmin-${user.id}`);
      await redisService.delete(`EditPromocodeAdmin-${user.id}`);

      const promocodeData: UpdatePromocodeDto = JSON.parse(redisData);

      const promocode = await promocodeService.update({
        ...promocodeData,
        is_published: data === 'true',
      });

      return await sendPromocodeAdminDetailsKeyboard(
        query.message.chat.id,
        bot,
        promocode,
        redisService,
        user,
      );
    }

    if (key === 'AdminDeletePromocode') {
      const redisData = await redisService.get(`EditPromocodeAdmin-${user.id}`);
      await redisService.delete(`EditPromocodeAdmin-${user.id}`);

      const promocodeData: UpdatePromocodeDto = JSON.parse(redisData);

      await promocodeService.remove(promocodeData.id);

      return await sendPromocodesKeyboard(
        query.message.chat.id,
        bot,
        promocodeService,
      );
    }

    if (key === 'NewPromocode') {
      const promocode = await promocodeService.create();

      return await sendPromocodeAdminDetailsKeyboard(
        query.message.chat.id,
        bot,
        promocode,
        redisService,
        user,
      );
    }
  });
};
