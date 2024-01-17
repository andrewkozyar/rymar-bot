import TelegramBot from 'node-telegram-bot-api';
import { ChannelService } from 'src/chanel/channel.service';
import {
  CurrencyEnum,
  PayDataInterface,
  PaymentStatusEnum,
  UserLanguageEnum,
  getFiatAmount,
} from 'src/helper';
import { PaymentService } from 'src/payment/payment.service';
import { SubscriptionPlanService } from 'src/subscriptionPlan/subscriptionPlan.service';
import { UserService } from 'src/user/user.service';
import { editAccountKeyboard } from '../keyboards/account.keyboards';
import { editLanguageKeyboard } from '../keyboards/language.keyboards';
import { sendMenuKeyboard } from '../keyboards/menu.keyboards';
import { sendMySubscriptionKeyboard } from '../keyboards/my-subscription.keyboards';
import { sendSubscriptionPlanDetailsKeyboard } from '../keyboards/subscription-plan-details.keyboards';
import { sendSubscriptionPlanKeyboard } from '../keyboards/subscription-plans.keyboards';
import { sendTimezoneKeyboard } from '../keyboards/timezone.keyboards';
import { sendTransactionsKeyboard } from '../keyboards/transactions.keyboards';
import { RedisService } from 'src/redis/redis.service';
import { editAdminPanelKeyboard } from '../keyboards/adminPanel.keyboards';
import { PromocodeService } from 'src/promocode/promocode.service';
import { sendPromocodesKeyboard } from '../keyboards/promocodes.keyboards';
import { sendSubscriptionPlanAdminDetailsKeyboard } from '../keyboards/subscription-plan-admin-details.keyboards';
import { UpdateDto as UpdatePlanDto } from 'src/subscriptionPlan/dto';
import { sendIsPublishedKeyboard } from '../keyboards/is-published.keyboards';
import { editTextWithCancelKeyboard } from '../keyboards/cancel.keyboards';
import { sendPromocodeAdminDetailsKeyboard } from '../keyboards/promocode-admin-details.keyboards';
import { UpdateDto as UpdatePromocodeDto } from 'src/promocode/dto';
import { sendPaymentMethodsKeyboard } from '../keyboards/payment-methods.keyboards';
import { PaymentMethodService } from 'src/paymentMethod/paymentMethod.service';
import { sendPaymentMethodAdminDetailsKeyboard } from '../keyboards/payment-method-admin-details.keyboards';
import { UpdateDto as UpdatePaymentMethodDto } from 'src/paymentMethod/dto';
import { sendPaymentMethodDetailsKeyboard } from '../keyboards/payment-method-details.keyboards';
import { sendGiveUserAccessKeyboard } from '../keyboards/give-user-access.keyboards';
import { sendCurrencyKeyboard } from '../keyboards/currency.keyboards';
import { ConversionRateService } from 'src/conversionRate/conversionRate.service';

export const actionCallbackQuery = (
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
        createdUser.language === UserLanguageEnum.EN
          ? '👋 Hi. Let`s start'
          : createdUser.language === UserLanguageEnum.UA
            ? '👋 Привіт. Давайте почнемо'
            : '👋 Привет. Давайте начнем',
        createdUser.language,
      );

      return await editAccountKeyboard(
        query.message.chat.id,
        query.message.message_id,
        bot,
        createdUser,
      );
    }

    if (!user) {
      return;
    }

    if (key === 'ChangeLanguageMenu') {
      await redisService.clearData(user.id);

      return await editLanguageKeyboard(
        query.message.chat.id,
        bot,
        true,
        query.message.message_id,
      );
    }

    if (key === 'ChangeLanguage') {
      await redisService.clearData(user.id);

      const updatedUser = await userService.update(user.id, {
        language: data as unknown as UserLanguageEnum,
      });
      await sendMenuKeyboard(
        query.message.chat.id,
        bot,
        updatedUser.language === UserLanguageEnum.EN
          ? '✅ Language is changed'
          : updatedUser.language === UserLanguageEnum.UA
            ? '✅ Мову змінено'
            : '✅ Язык изменен',
        updatedUser.language,
      );
      return await editAccountKeyboard(
        query.message.chat.id,
        query.message.message_id,
        bot,
        updatedUser,
      );
    }

    if (key === 'ChangeTimezoneMenu') {
      await redisService.clearData(user.id);

      return await sendTimezoneKeyboard(query.message.chat.id, bot);
    }

    if (key === 'ChangeTimezone') {
      await redisService.clearData(user.id);

      const updatedUser = await userService.update(user.id, {
        timezone: data,
      });
      await sendMenuKeyboard(
        query.message.chat.id,
        bot,
        'Timezone is changed',
        user.language,
      );
      return await editAccountKeyboard(
        query.message.chat.id,
        query.message.message_id,
        bot,
        updatedUser,
      );
    }

    if (key === 'BackToAccount') {
      await redisService.clearData(user.id);

      return await editAccountKeyboard(
        query.message.chat.id,
        query.message.message_id,
        bot,
        user,
      );
    }

    if (key === 'ChangeEmailMessage') {
      await redisService.clearData(user.id);

      await redisService.add(`ChangeEmail-${user.id}`, 'waiting');

      return await editTextWithCancelKeyboard(
        query.message.chat.id,
        query.message.message_id,
        bot,
        user.language === UserLanguageEnum.EN
          ? '🖊️ Enter your email address!'
          : user.language === UserLanguageEnum.UA
            ? '🖊️ Введіть адресу вашої електронної пошти!'
            : '🖊️ Введите ваш адрес электронной почты!',
        'BackToAccount',
        user,
      );
    }

    if (key === 'ChooseSubscriptionPlan') {
      const redisData = await redisService.get(
        `BuySubscriptionPlan-${user.id}`,
      );

      const payData: PayDataInterface = JSON.parse(redisData);

      const plan = await planService.findOne({ id: data });

      if (payData?.promocode_id && payData?.subscription_plan_id === data) {
        const promocode = await promocodeService.findOne({
          id: payData.promocode_id,
        });

        return await sendSubscriptionPlanDetailsKeyboard(
          query.message.chat.id,
          bot,
          plan,
          redisService,
          user,
          payData,
          promocode,
        );
      }

      await redisService.clearData(user.id);

      const planPayData: PayDataInterface = {
        amount: plan.price,
        subscription_plan_id: plan.id,
        promocode_id: null,
        newPrice: null,
        isContinue: false,
      };

      return await sendSubscriptionPlanDetailsKeyboard(
        query.message.chat.id,
        bot,
        plan,
        redisService,
        user,
        planPayData,
      );
    }

    if (key === 'ContinueSubscription') {
      const redisData = await redisService.get(
        `ContinueSubscription-${user.id}`,
      );

      const payData: PayDataInterface = JSON.parse(redisData);

      const plan = await planService.findOne({
        id: payData.subscription_plan_id,
      });

      return await sendSubscriptionPlanDetailsKeyboard(
        query.message.chat.id,
        bot,
        plan,
        redisService,
        user,
        payData,
      );
    }

    if (key === 'AdminChooseSubscriptionPlan') {
      await redisService.clearData(user.id);

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
      await redisService.clearData(user.id);

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
      await redisService.clearData(user.id);

      return await sendSubscriptionPlanKeyboard(
        query.message.chat.id,
        bot,
        planService,
        false,
        user,
      );
    }

    if (key === 'SendSubscriptionPlanAdminKeyboard') {
      await redisService.clearData(user.id);

      return await sendSubscriptionPlanKeyboard(
        query.message.chat.id,
        bot,
        planService,
        true,
        user,
      );
    }

    if (key === 'Promocode') {
      await redisService.clearData(user.id);

      await redisService.add(`Promocode-${user.id}`, data);

      return await editTextWithCancelKeyboard(
        query.message.chat.id,
        query.message.message_id,
        bot,
        user.language === UserLanguageEnum.EN
          ? '🖊️ Enter your promo code!'
          : user.language === UserLanguageEnum.UA
            ? '🖊️ Введіть promo code!'
            : '🖊️ Введите promo code!',
        `ChooseSubscriptionPlan;${data}`,
        user,
      );
    }

    if (key === 'BuySubscriptionPlan') {
      const redisData = await redisService.get(
        `BuySubscriptionPlan-${user.id}`,
      );

      const payData: PayDataInterface = JSON.parse(redisData);

      return await sendPaymentMethodsKeyboard(
        query.message.chat.id,
        bot,
        paymentMethodService,
        user,
        false,
        payData.isContinue,
        data,
      );
    }

    if (key === 'PayBy') {
      const paymentMethod = await paymentMethodService.findOne({ id: data });

      const redisData = await redisService.get(
        `BuySubscriptionPlan-${user.id}`,
      );

      const payData: PayDataInterface = JSON.parse(redisData);

      const plan = await planService.findOne({
        id: payData.subscription_plan_id,
      });

      const rateToUsd = await rateService.get();

      return await sendPaymentMethodDetailsKeyboard(
        query.message.chat.id,
        bot,
        paymentMethod,
        plan,
        user,
        getFiatAmount(rateToUsd[paymentMethod.currency] * plan.price),
        getFiatAmount(rateToUsd[paymentMethod.currency] * payData.newPrice),
      );
    }

    if (key === 'UserPaid') {
      const paymentMethod = await paymentMethodService.findOne({ id: data });

      const redisData = await redisService.get(
        `BuySubscriptionPlan-${user.id}`,
      );

      const payData: PayDataInterface = JSON.parse(redisData);

      await redisService.add(
        `BuySubscriptionPlan-${user.id}`,
        JSON.stringify({
          ...payData,
          payment_method_id: paymentMethod.id,
        }),
      );

      return await editTextWithCancelKeyboard(
        query.message.chat.id,
        query.message.message_id,
        bot,
        user.language === UserLanguageEnum.EN
          ? 'Please send a screenshot of the payment! 📱'
          : user.language === UserLanguageEnum.UA
            ? 'Будь ласка, надішліть скрін з оплатою! 📱'
            : 'Пожалуйста, отправьте скрин с оплатой! 📱',
        'PayBy;' + data,
        user,
      );
    }

    if (key === 'ListOfTransactions') {
      await redisService.clearData(user.id);

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
      await redisService.clearData(user.id);

      return await sendMySubscriptionKeyboard(
        query.message.chat.id,
        bot,
        user,
        paymentService,
        redisService,
      );
    }

    if (key === 'AdminPanel') {
      await redisService.clearData(user.id);

      return await editAdminPanelKeyboard(
        query.message.chat.id,
        query.message.message_id,
        bot,
        user,
      );
    }

    if (key === 'AdminPromocodes') {
      await redisService.clearData(user.id);

      return await sendPromocodesKeyboard(
        query.message.chat.id,
        bot,
        promocodeService,
        user,
      );
    }

    if (key === 'AdminUserTransactions') {
      await redisService.clearData(user.id);

      await redisService.add(`AdminUserTransactions-${user.id}`, 'waiting');

      return await editTextWithCancelKeyboard(
        query.message.chat.id,
        query.message.message_id,
        bot,
        user.language === UserLanguageEnum.EN
          ? `🖊️ Enter user nickname!`
          : user.language === UserLanguageEnum.UA
            ? `🖊️ Введіть nickname користувача!`
            : `🖊️ Введите nickname пользователя!`,
        `AdminPanel`,
        user,
      );
    }

    if (key === 'EditSubscriptionPlanAdmin') {
      const redisData = await redisService.get(
        `EditSubscriptionPlanAdmin-${user.id}`,
      );

      await redisService.clearData(user.id);

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
          user,
        );
      }

      if (['price', 'months_count'].includes(data)) {
        return await editTextWithCancelKeyboard(
          query.message.chat.id,
          query.message.message_id,
          bot,
          user.language === UserLanguageEnum.EN
            ? `Enter the new ${
                data === 'months_count' ? 'number of months' : data
              } for the subscription plan! Should be number.`
            : user.language === UserLanguageEnum.UA
              ? `Введіть новий ${
                  data === 'months_count' ? 'number of months' : data
                } для плану підписки! Має бути ціле число.`
              : `Введите новый ${
                  data === 'months_count' ? 'number of months' : data
                } для плана подписки! Должно быть целое число.`,
          `AdminChooseSubscriptionPlan;${planData.id}`,
          user,
        );
      }

      if (['descriptionEN', 'descriptionUA', 'descriptionRU'].includes(data)) {
        return await editTextWithCancelKeyboard(
          query.message.chat.id,
          query.message.message_id,
          bot,
          user.language === UserLanguageEnum.EN
            ? `Enter the new ${data} for the subscription plan! If there includes price write it not as number but as {{price}}. It needs for writing customers correct amount after using promo code.`
            : user.language === UserLanguageEnum.UA
              ? `Введіть новий ${data} для плану підписки! Якщо вказана ціна, напишіть її не число, а {{price}}. Потрібно, щоб клієнти написали правильну суму після використання промокоду.`
              : `Введите новый ${data} для плана подписки! Если там указана цена, напишите ее не число, а {{price}}. Требуется, чтобы клиенты написали правильную сумму после использования промокода.`,
          `AdminChooseSubscriptionPlan;${planData.id}`,
          user,
        );
      }

      return await editTextWithCancelKeyboard(
        query.message.chat.id,
        query.message.message_id,
        bot,
        user.language === UserLanguageEnum.EN
          ? `Enter the new ${data} for the subscription plan!`
          : user.language === UserLanguageEnum.UA
            ? `Введіть новий ${data} для плану підписки!`
            : `Введите новый ${data} для плана подписки!`,
        `AdminChooseSubscriptionPlan;${planData.id}`,
        user,
      );
    }

    if (key === 'SubscriptionPlanIsPublished') {
      const redisData = await redisService.get(
        `EditSubscriptionPlanAdmin-${user.id}`,
      );
      await redisService.clearData(user.id);

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
      await redisService.clearData(user.id);

      const planData: UpdatePlanDto = JSON.parse(redisData);

      await planService.remove(planData.id);

      return await sendSubscriptionPlanKeyboard(
        query.message.chat.id,
        bot,
        planService,
        true,
        user,
      );
    }

    if (key === 'NewSubscriptionPlan') {
      await redisService.clearData(user.id);

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
      await redisService.clearData(user.id);

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
          user,
        );
      }

      if (data === 'sale_percent') {
        return await editTextWithCancelKeyboard(
          query.message.chat.id,
          query.message.message_id,
          bot,
          user.language === UserLanguageEnum.EN
            ? `Enter a new percentage of the discount for the promo code! Must be a number.`
            : user.language === UserLanguageEnum.UA
              ? `Введіть нове число відсотків скидки для промокоду! Має бути ціле число.`
              : `Введите новое число процентов скидки для промокода! Должно быть целое число.`,
          `AdminPromocodeDetails;${promocodeData.id}`,
          user,
        );
      }

      return await editTextWithCancelKeyboard(
        query.message.chat.id,
        query.message.message_id,
        bot,
        user.language === UserLanguageEnum.EN
          ? `Enter the new ${data} for the promo code!`
          : user.language === UserLanguageEnum.UA
            ? `Введіть новий ${data} для промокода!`
            : `Введите новый ${data} для промокода!`,
        `AdminPromocodeDetails;${promocodeData.id}`,
        user,
      );
    }

    if (key === 'PromocodeIsPublished') {
      const redisData = await redisService.get(`EditPromocodeAdmin-${user.id}`);
      await redisService.clearData(user.id);

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
      await redisService.clearData(user.id);

      const promocodeData: UpdatePromocodeDto = JSON.parse(redisData);

      await promocodeService.remove(promocodeData.id);

      return await sendPromocodesKeyboard(
        query.message.chat.id,
        bot,
        promocodeService,
        user,
      );
    }

    if (key === 'NewPromocode') {
      await redisService.clearData(user.id);

      const promocode = await promocodeService.create();

      return await sendPromocodeAdminDetailsKeyboard(
        query.message.chat.id,
        bot,
        promocode,
        redisService,
        user,
      );
    }

    if (key === 'AdminPaymentMethods') {
      await redisService.clearData(user.id);

      return await sendPaymentMethodsKeyboard(
        query.message.chat.id,
        bot,
        paymentMethodService,
        user,
        true,
        false,
      );
    }

    if (key === 'AdminPaymentMethodDetails') {
      await redisService.clearData(user.id);

      const paymentMethod = await paymentMethodService.findOne({ id: data });

      return await sendPaymentMethodAdminDetailsKeyboard(
        query.message.chat.id,
        bot,
        paymentMethod,
        redisService,
        user,
      );
    }

    if (key === 'NewPaymentMethod') {
      await redisService.clearData(user.id);

      const paymentMethod = await paymentMethodService.create();

      return await sendPaymentMethodAdminDetailsKeyboard(
        query.message.chat.id,
        bot,
        paymentMethod,
        redisService,
        user,
      );
    }

    if (key === 'EditPaymentMethodAdmin') {
      const redisData = await redisService.get(
        `EditPaymentMethodAdmin-${user.id}`,
      );
      await redisService.clearData(user.id);

      const paymentMethodData: UpdatePaymentMethodDto = JSON.parse(redisData);

      paymentMethodData[data] = null;
      paymentMethodData.field = data;

      await redisService.add(
        `EditPaymentMethodAdmin-${user.id}`,
        JSON.stringify(paymentMethodData),
      );

      if (data === 'is_published') {
        return await sendIsPublishedKeyboard(
          query.message.chat.id,
          bot,
          'PaymentMethodIsPublished;',
          `AdminPaymentMethodDetails;${paymentMethodData.id}`,
          user,
        );
      }

      if (data === 'currency') {
        const rateToUsd = await rateService.get();

        return await sendCurrencyKeyboard(
          query.message.chat.id,
          bot,
          'PaymentMethodCurrency;',
          `AdminPaymentMethodDetails;${paymentMethodData.id}`,
          user,
          rateToUsd,
        );
      }

      return await editTextWithCancelKeyboard(
        query.message.chat.id,
        query.message.message_id,
        bot,
        user.language === UserLanguageEnum.EN
          ? `Enter the new ${data} for the payment method!`
          : user.language === UserLanguageEnum.UA
            ? `Введіть новий ${data} для способу оплати!`
            : `Введите новый ${data} для способа оплаты!`,
        `AdminPaymentMethodDetails;${paymentMethodData.id}`,
        user,
      );
    }

    if (key === 'PaymentMethodIsPublished') {
      const redisData = await redisService.get(
        `EditPaymentMethodAdmin-${user.id}`,
      );
      await redisService.clearData(user.id);

      const paymentMethodData: UpdatePaymentMethodDto = JSON.parse(redisData);

      const paymentMethod = await paymentMethodService.update({
        ...paymentMethodData,
        is_published: data === 'true',
      });

      return await sendPaymentMethodAdminDetailsKeyboard(
        query.message.chat.id,
        bot,
        paymentMethod,
        redisService,
        user,
      );
    }

    if (key === 'PaymentMethodCurrency') {
      const redisData = await redisService.get(
        `EditPaymentMethodAdmin-${user.id}`,
      );
      await redisService.clearData(user.id);

      const paymentMethodData: UpdatePaymentMethodDto = JSON.parse(redisData);

      const paymentMethod = await paymentMethodService.update({
        ...paymentMethodData,
        currency: data as CurrencyEnum,
      });

      return await sendPaymentMethodAdminDetailsKeyboard(
        query.message.chat.id,
        bot,
        paymentMethod,
        redisService,
        user,
      );
    }

    if (key === 'AdminDeletePaymentMethod') {
      const redisData = await redisService.get(
        `EditPaymentMethodAdmin-${user.id}`,
      );
      await redisService.clearData(user.id);

      const paymentMethodData: UpdatePaymentMethodDto = JSON.parse(redisData);

      await paymentMethodService.remove(paymentMethodData.id);

      return await sendPaymentMethodsKeyboard(
        query.message.chat.id,
        bot,
        paymentMethodService,
        user,
        true,
        false,
      );
    }

    if (key === 'PendingUsers') {
      await redisService.clearData(user.id);

      const { payments } = await paymentService.getPayments({
        status: PaymentStatusEnum.Pending,
      });

      return payments.map(async (payment) => {
        const plan = await planService.findOne({
          id: payment.subscription_plan_id,
        });

        const paymentMethod = await paymentMethodService.findOne({
          id: payment.payment_method_id,
        });

        let promocode = null;

        if (payment.promocode_id) {
          promocode = await promocodeService.findOne({
            id: payment.promocode_id,
          });
        }

        const customer = await userService.findOne({
          id: payment.user_id,
        });

        return sendGiveUserAccessKeyboard(
          query.message.chat.id,
          bot,
          user,
          customer,
          payment,
          plan,
          paymentMethod,
          promocode,
        );
      });
    }

    if (key === 'GiveUserAccessConfirm') {
      await redisService.clearData(user.id);

      const payment = await paymentService.update({
        id: data,
        status: PaymentStatusEnum.Success,
        updated_by_id: user.id,
      });

      const customer = await userService.findOne({
        id: payment.user_id,
      });

      await bot.sendMessage(
        query.message.chat.id,
        user.language === UserLanguageEnum.EN
          ? `✅ User @${customer.name} payment confirmed successfully!`
          : user.language === UserLanguageEnum.UA
            ? `✅ Оплата користувача @${customer.name} підтверджена успішно!`
            : `✅ Оплата пользователя @${customer.name} подтверждена успешно!`,
      );

      await bot.sendMessage(
        customer.chat_id,
        customer.language === UserLanguageEnum.EN
          ? `✅ The manager has confirmed your payment! Thank you for trusting us. Links will come in subsequent messages.

Attention, you must join all channels and chats within 24 hours after receiving the links!`
          : customer.language === UserLanguageEnum.UA
            ? `✅ Менеджер підтвердив вашу оплату! Дякуємо що довірилися нам. Посилання прийдуть наступними повідомленнями.

Увага необхідно приєднатися до всіх каналів та чатів протягом 24 годин після отримання посилань!`
            : `✅ Менеджер подтвердил вашу оплату! Спасибо что доверились нам. Ссылки придут следующими сообщениями.

Внимание необходимо присоединиться ко всем каналам и чатам в течение 24 часов после получения ссылок!`,
      );

      return await channelService.sendChannelsLinks(bot, customer);
    }

    if (key === 'GiveUserAccessDecline') {
      await redisService.clearData(user.id);

      const payment = await paymentService.update({
        id: data,
        status: PaymentStatusEnum.Cancel,
        updated_by_id: user.id,
      });

      const customer = await userService.findOne({
        id: payment.user_id,
      });

      await bot.sendMessage(
        query.message.chat.id,
        user.language === UserLanguageEnum.EN
          ? `❌ Payment by user @${customer.name} declined!`
          : user.language === UserLanguageEnum.UA
            ? `❌ Оплата користувача @${customer.name} відхилена!`
            : `❌ Оплата пользователя @${customer.name} отклонена!`,
      );

      return await bot.sendMessage(
        customer.chat_id,
        customer.language === UserLanguageEnum.EN
          ? `❌ The manager did not confirm your payment! Make sure that you paid the correct amount, entered the promotional code (if available), sent the correct screenshot, sent the screenshot to the payment method where you sent the funds. If you did something wrong, you can send the payment details again by going to "🗒️ Subscription plans", selecting the desired plan and clicking "💵 I paid".

If you could not solve the problem, or you think that an error has occurred, contact support via the "🤝 Support" button`
          : customer.language === UserLanguageEnum.UA
            ? `❌ Менеджер не підтвердив вашу оплату! Переконайтеся що ви оплатили правильну суму, ввели промокод (за наявності), надіслали правильний скрішот, надіслали скрішот в той метод оплати, куди надсилали кошти. Якщо ви щось наділали не вірно, то можна надіслати дані про оплату знову перейшовши в "🗒️ Плани підписок", обравши потрібний план, та натиснувши "💵 Я оплатив".

Якщо ви не змогли вирішити проблему, або вважаєте що сталася помилка, зверніться за підтримкою по кнопці "🤝 Допомога"`
            : `❌ Менеджер не подтвердил вашу оплату! Убедитесь, что вы оплатили правильную сумму, ввели промокод (при наличии), отправили правильный скришот, отправили скришот в тот метод оплаты, куда присылали средства. Если вы что-то наделали не верно, то можно отправить данные об оплате снова перейдя в "🗒️ Планы подписок", выбрав нужный план и нажав "💵 Я оплатил".

Если вы не смогли решить проблему, или считаете произошедшую ошибку, обратитесь за поддержкой по кнопке "🤝 Помощь"`,
      );
    }
  });
};
