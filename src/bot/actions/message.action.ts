import TelegramBot from 'node-telegram-bot-api';
import { ChannelService } from 'src/chanel/channel.service';
import { PaymentService } from 'src/payment/payment.service';
import { PromocodeService } from 'src/promocode/promocode.service';
import { SubscriptionPlanService } from 'src/subscriptionPlan/subscriptionPlan.service';
import { UserService } from 'src/user/user.service';
import { admins, sendAccountKeyboard } from '../keyboards/account.keyboards';
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
import {
  PayDataInterface,
  PaymentStatusEnum,
  UserLanguageEnum,
  getFiatAmount,
} from 'src/helper';
import { sendAdminPanelKeyboard } from '../keyboards/adminPanel.keyboards';
import { sendPaymentMethodAdminDetailsKeyboard } from '../keyboards/payment-method-admin-details.keyboards';
import { PaymentMethodService } from 'src/paymentMethod/paymentMethod.service';
import { UpdateDto as UpdatePaymentMethodDto } from 'src/paymentMethod/dto';
import { sendTextWithCancelKeyboard } from '../keyboards/cancel.keyboards';
import { sendGiveUserAccessKeyboard } from '../keyboards/give-user-access.keyboards';
import { ConversionRateService } from 'src/conversionRate/conversionRate.service';

export const actionMessage = (
  bot: TelegramBot,
  userService: UserService,
  redisService: RedisService,
  planService: SubscriptionPlanService,
  promocodeService: PromocodeService,
  paymentService: PaymentService,
  channelService: ChannelService,
  paymentMethodService: PaymentMethodService,
  rateService: ConversionRateService,
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
        await redisService.clearData(user.id);
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
      await redisService.clearData(user.id);

      return await sendSubscriptionPlanKeyboard(
        msg.chat.id,
        bot,
        planService,
        false,
        user,
      );
    }

    if (
      ['🧾 My Subscription', '🧾 Моя підписка', '🧾 Моя подписка'].includes(
        msg.text,
      )
    ) {
      await redisService.clearData(user.id);

      return await sendMySubscriptionKeyboard(
        msg.chat.id,
        bot,
        user,
        paymentService,
        redisService,
      );
    }

    if (
      ['👤 My Account', '👤 Мій акаунт', '👤 Мой аккаунт'].includes(msg.text)
    ) {
      await redisService.clearData(user.id);

      return await sendAccountKeyboard(msg.chat.id, bot, user);
    }

    if (['🤝 Support', '🤝 Допомога', '🤝 Помощь'].includes(msg.text)) {
      await redisService.clearData(user.id);

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
        user.language === UserLanguageEnum.EN
          ? '✅ Email is changed'
          : user.language === UserLanguageEnum.UA
            ? '✅ Електронна пошта змінена'
            : '✅ Электронная почта изменена',
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

      const payData: PayDataInterface = {
        amount: plan.price,
        subscription_plan_id: plan.id,
        promocode_id: null,
        newPrice: null,
        isContinue: false,
      };

      if (promocode) {
        payData.promocode_id = promocode.id;

        return await sendSubscriptionPlanDetailsKeyboard(
          msg.chat.id,
          bot,
          plan,
          redisService,
          user,
          payData,
          promocode,
        );
      }

      await bot.sendMessage(
        msg.chat.id,
        user.language === UserLanguageEnum.EN
          ? `❌ Wrong promo code!`
          : user.language === UserLanguageEnum.UA
            ? `❌ Неправильний promo code!`
            : `❌ Неправильный promo code!`,
      );
      return await sendSubscriptionPlanDetailsKeyboard(
        msg.chat.id,
        bot,
        plan,
        redisService,
        user,
        payData,
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
        await bot.sendMessage(msg.chat.id, `😢 User ${msg.text} is not fined!`);

        return await sendAdminPanelKeyboard(msg.chat.id, bot, user);
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

    // update promocode
    const redisPaymentMethodAdminData = await redisService.get(
      `EditPaymentMethodAdmin-${user.id}`,
    );

    if (redisPaymentMethodAdminData) {
      await redisService.delete(`EditPaymentMethodAdmin-${user.id}`);

      const paymentMethodData: UpdatePaymentMethodDto = JSON.parse(
        redisPaymentMethodAdminData,
      );
      paymentMethodData[paymentMethodData.field] = msg.text;

      const paymentMethod = await paymentMethodService.update({
        ...paymentMethodData,
      });

      return await sendPaymentMethodAdminDetailsKeyboard(
        msg.chat.id,
        bot,
        paymentMethod,
        redisService,
        user,
      );
    }

    // screenshot with payment
    const redisUserPaymentData = await redisService.get(
      `BuySubscriptionPlan-${user.id}`,
    );

    if (redisUserPaymentData) {
      const payData: PayDataInterface = JSON.parse(redisUserPaymentData);

      if (!msg.photo?.length) {
        return await sendTextWithCancelKeyboard(
          msg.chat.id,
          bot,
          user.language === UserLanguageEnum.EN
            ? 'Wrong value. Please send a screenshot of the payment! 📱'
            : user.language === UserLanguageEnum.UA
              ? 'Неправильне значення. Будь ласка, надішліть скрін з оплатою! 📱'
              : 'Неверное значение. Пожалуйста, отправьте скрин с оплатой! 📱',
          'PayBy;' + payData.payment_method_id,
          user,
        );
      }

      await redisService.clearData(user.id);

      const paymentMethod = await paymentMethodService.findOne({
        id: payData.payment_method_id,
      });

      const rateToUsd = await rateService.get();

      const payment = await paymentService.create({
        ...payData,
        status: PaymentStatusEnum.Pending,
        amount: getFiatAmount(
          rateToUsd[paymentMethod.currency] *
            (payData.newPrice || payData.amount),
        ),
        price_usd: payData.newPrice || payData.amount,
        user_id: user.id,
        screenshot_message_id: msg.message_id.toString(),
        address: paymentMethod.address,
        currency: paymentMethod.currency,
      });

      const managers = await userService.getUsers({
        names: admins,
      });

      const plan = await planService.findOne({
        id: payData.subscription_plan_id,
      });

      let promocode = null;

      if (payData.promocode_id) {
        promocode = await promocodeService.findOne({
          id: payData.promocode_id,
        });
      }

      await Promise.all(
        managers.users.map(async (manager) => {
          return sendGiveUserAccessKeyboard(
            manager.chat_id,
            bot,
            manager,
            user,
            payment,
            plan,
            paymentMethod,
            promocode,
          );
        }),
      );

      return await bot.sendMessage(
        msg.chat.id,
        user.language === UserLanguageEnum.EN
          ? '✅ Thank you for the payment. The manager will soon verify all the payment and if it was successful, the links to join all the chats and channels will come here.'
          : user.language === UserLanguageEnum.UA
            ? '✅ Дякуємо за оплату. Менеджер скоро перевірить вшу оплату, і якщо вона пройшла успішно, сюди прийдуть посилання для приєднання до всіх чатів та каналів.'
            : '✅ Спасибо за оплату. Менеджер скоро проверит вашу оплату, и если она прошла успешно, сюда придут ссылки для подключения ко всем чатам и каналам.',
      );
    }

    await redisService.clearData(user.id);
    return await sendMenuKeyboard(
      msg.chat.id,
      bot,
      user.language === UserLanguageEnum.EN
        ? '🤨 Wrong value'
        : user.language === UserLanguageEnum.UA
          ? '🤨 Неправильне значення'
          : '🤨 Неверное значение',
      user.language,
    );
  });
};
