import TelegramBot from 'node-telegram-bot-api';
import { ChannelService } from 'src/bot-hesoyam/chanel/channel.service';
import { PaymentService } from 'src/bot-hesoyam/payment/payment.service';
import { PromocodeService } from 'src/bot-hesoyam/promocode/promocode.service';
import { SubscriptionPlanService } from 'src/bot-hesoyam/subscriptionPlan/subscriptionPlan.service';
import { UserService } from 'src/bot-hesoyam/user/user.service';
import { admins, sendAccountKeyboard } from '../keyboards/account.keyboards';
import { sendLanguageKeyboard } from '../keyboards/language.keyboards';
import { sendMenuKeyboard } from '../keyboards/menu.keyboards';
import { sendMySubscriptionKeyboard } from '../keyboards/my-subscription.keyboards';
import { sendSubscriptionPlanDetailsKeyboard } from '../keyboards/subscription-plan-details.keyboards';
import { sendSubscriptionPlanKeyboard } from '../keyboards/subscription-plans.keyboards';
import { RedisService } from 'src/redis/redis.service';
import { sendTransactionsKeyboard } from '../keyboards/transactions.keyboards';
import { UpdateDto as UpdatePlanDto } from 'src/bot-hesoyam/subscriptionPlan/dto';
import { sendSubscriptionPlanAdminDetailsKeyboard } from '../keyboards/subscription-plan-admin-details.keyboards';
import { sendPromocodeAdminDetailsKeyboard } from '../keyboards/promocode-admin-details.keyboards';
import { UpdateDto as UpdatePromocodeDto } from 'src/bot-hesoyam/promocode/dto';
import {
  BotEnum,
  LogTypeEnum,
  PayDataInterface,
  PaymentStatusEnum,
  UserLanguageEnum,
  getFiatAmount,
  trimEmail,
  validateEmail,
} from 'src/helper';
import { sendAdminPanelKeyboard } from '../keyboards/adminPanel.keyboards';
import { sendPaymentMethodAdminDetailsKeyboard } from '../keyboards/payment-method-admin-details.keyboards';
import { PaymentMethodService } from 'src/bot-hesoyam/paymentMethod/paymentMethod.service';
import { UpdateDto as UpdatePaymentMethodDto } from 'src/bot-hesoyam/paymentMethod/dto';
import { sendTextWithCancelKeyboard } from '../keyboards/cancel.keyboards';
import { sendGiveUserAccessKeyboard } from '../keyboards/give-user-access.keyboards';
import { ConversionRateService } from 'src/conversionRate/conversionRate.service';
import { LogService } from 'src/log/log.service';
import { notifyAdminAboutNewUser } from '../helpers/notifyAdminAboutNewUser';
import { getDateWithoutHours } from 'src/helper/date';
import { PromocodeHesoyam } from 'src/bot-hesoyam/promocode/promocode.entity';

export const actionMessage = async (
  bot: TelegramBot,
  userService: UserService,
  redisService: RedisService,
  planService: SubscriptionPlanService,
  promocodeService: PromocodeService,
  paymentService: PaymentService,
  channelService: ChannelService,
  paymentMethodService: PaymentMethodService,
  rateService: ConversionRateService,
  logService: LogService,
) => {
  return bot.on('message', async (msg) => {
    try {
      if (msg.chat.id < 0) {
        return await channelService.create({
          chat_id: msg.chat.id,
          name: msg.chat.title,
          type: msg.chat.type,
        });
      }

      let user = await userService.findOne({ chat_id: msg.chat.id });

      if (msg.text === '/start' || !user) {
        if (user) {
          await redisService.clearData(user.id);
        }

        if (!user) {
          await notifyAdminAboutNewUser(bot, msg.chat.username, userService);

          user = await userService.create({
            chat_id: msg.chat.id,
            language: UserLanguageEnum.RU,
            name: msg.chat.username,
          });
        }

        await logService.create({
          user_hesoyam_id: user.id,
          info: 'нажал кнопку start',
          type: LogTypeEnum.USER,
          bot: BotEnum.HESOYAM,
        });

        return await sendLanguageKeyboard(msg.chat.id, bot);
      }

      // check email
      if (!user.email) {
        if (!validateEmail(trimEmail(msg.text))) {
          return await sendTextWithCancelKeyboard(
            msg.chat.id,
            bot,
            user.language === UserLanguageEnum.EN
              ? 'Wrong value. Submit a valid email!'
              : user.language === UserLanguageEnum.UA
                ? 'Неправильне значення. Надішліть правильну електронну пошту!'
                : 'Неверное значение. Отправьте правильную электронную почту!',
            user.email ? 'BackToAccount;' : null,
            user,
          );
        }

        await logService.create({
          user_hesoyam_id: user.id,
          info: `ввел емейл на "${trimEmail(msg.text)}"`,
          type: LogTypeEnum.USER,
          bot: BotEnum.HESOYAM,
        });

        const updatedUser = await userService.update(user.id, {
          email: trimEmail(msg.text),
        });

        await sendMenuKeyboard(
          msg.chat.id,
          bot,
          user.language === UserLanguageEnum.EN
            ? '👋 Hi. Let`s start'
            : user.language === UserLanguageEnum.UA
              ? '👋 Привіт. Давайте почнемо'
              : '👋 Привет. Давайте начнем',
          user.language,
        );

        await redisService.delete(`ChangeEmail-${user.id}`);
        return await sendAccountKeyboard(msg.chat.id, bot, updatedUser);
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

        await logService.create({
          user_hesoyam_id: user.id,
          info: `нажал кнопку "${msg.text}"`,
          type: LogTypeEnum.USER,
          bot: BotEnum.HESOYAM,
        });

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

        await logService.create({
          user_hesoyam_id: user.id,
          info: `нажал кнопку "${msg.text}"`,
          type: LogTypeEnum.USER,
          bot: BotEnum.HESOYAM,
        });

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
        await redisService.clearData(user.id);

        await logService.create({
          user_hesoyam_id: user.id,
          info: `нажал кнопку "${msg.text}"`,
          type: LogTypeEnum.USER,
          bot: BotEnum.HESOYAM,
        });

        return await sendAccountKeyboard(msg.chat.id, bot, user);
      }

      if (['🤝 Support', '🤝 Допомога', '🤝 Помощь'].includes(msg.text)) {
        await redisService.clearData(user.id);

        await logService.create({
          user_hesoyam_id: user.id,
          info: `нажал кнопку "${msg.text}"`,
          type: LogTypeEnum.USER,
          bot: BotEnum.HESOYAM,
        });

        return await bot.sendMessage(
          msg.chat.id,
          user.language === UserLanguageEnum.EN
            ? 'For support, please contact @rymar_m'
            : user.language === UserLanguageEnum.UA
              ? 'Щоб отримати підтримку, зв’яжіться з @rymar_m'
              : 'Для поддержки обращайтесь к @rymar_m',
        );
      }

      // change email
      const emailData = await redisService.get(`ChangeEmail-${user.id}`);

      if (emailData === 'waiting') {
        if (!validateEmail(trimEmail(msg.text))) {
          return await sendTextWithCancelKeyboard(
            msg.chat.id,
            bot,
            user.language === UserLanguageEnum.EN
              ? 'Wrong value. Submit a valid email!'
              : user.language === UserLanguageEnum.UA
                ? 'Неправильне значення. Надішліть правильну електронну пошту!'
                : 'Неверное значение. Отправьте правильную электронную почту!',
            'BackToAccount;',
            user,
          );
        }

        await logService.create({
          user_hesoyam_id: user.id,
          info: `поменял емейл на "${trimEmail(msg.text)}"`,
          type: LogTypeEnum.USER,
          bot: BotEnum.HESOYAM,
        });

        const updatedUser = await userService.update(user.id, {
          email: trimEmail(msg.text),
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
      const promocodeData = await redisService.get(
        `PromocodeHesoyam-${user.id}`,
      );

      if (promocodeData) {
        const promocode = await promocodeService.findOne({
          name: msg.text,
          is_published: true,
        });

        const userPayments = await paymentService.getPayments({
          user_id: user.id,
          statuses: [
            PaymentStatusEnum.End,
            PaymentStatusEnum.Success,
            PaymentStatusEnum.Pending,
          ],
        });
        const plan = await planService.findOne({
          id: promocodeData,
          withDeleted: true,
        });

        const payData: PayDataInterface = {
          amount: plan.price,
          subscription_plan_id: plan.id,
          promocode_id: null,
          newPrice: null,
          isContinue: false,
        };

        await redisService.delete(`PromocodeHesoyam-${user.id}`);

        if (
          !promocode.is_multiple &&
          userPayments.payments.find((p) => p.promocode_id === promocode.id)
        ) {
          await bot.sendMessage(
            msg.chat.id,
            user.language === UserLanguageEnum.UA
              ? `❌ Цей promo code можна використати тільки один раз!`
              : `❌ Этот promo code можно использовать только один раз!`,
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

        if (promocode) {
          await logService.create({
            user_hesoyam_id: user.id,
            info: `‼️ ввел промокод "${msg.text}"`,
            type: LogTypeEnum.USER,
            bot: BotEnum.HESOYAM,
          });

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

        const finedUser = await userService.findOne({
          name: msg.text.replace('@', '').trim(),
        });

        if (!finedUser) {
          await bot.sendMessage(
            msg.chat.id,
            `😢 User ${msg.text} is not fined!`,
          );

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

      // get user steps
      const usersStepData = await redisService.get(`UsersStep-${user.id}`);

      if (usersStepData) {
        await redisService.delete(`UsersStep-${user.id}`);

        const finedUser = await userService.findOne({
          name: msg.text.replace('@', '').trim(),
        });

        if (!finedUser) {
          await bot.sendMessage(
            msg.chat.id,
            `😢 User ${msg.text} is not fined!`,
          );

          return await sendAdminPanelKeyboard(msg.chat.id, bot, user);
        }

        const userInfo = `ID: ${finedUser.id}\nemail: ${finedUser.email}\nnickname: @${finedUser.name}\n\n`;
        const logs = await logService.get(finedUser.id);

        return await sendTextWithCancelKeyboard(
          msg.chat.id,
          bot,
          userInfo +
            logs
              .map(
                (log) =>
                  `<b>${getDateWithoutHours(log.created_date)}</b>\n${
                    log.info
                  }`,
              )
              .join('\n\n'),
          `AdminPanel`,
          user,
        );
      }

      // update subscription plan
      const redisSubscriptionPlanData = await redisService.get(
        `EditSubscriptionPlanAdmin-${user.id}`,
      );

      if (redisSubscriptionPlanData) {
        const planData: UpdatePlanDto = JSON.parse(redisSubscriptionPlanData);
        planData[planData.field] = msg.text;

        if (
          (planData.field === 'price' || planData.field === 'months_count') &&
          !Number.isInteger(Number(msg.text))
        ) {
          return await sendTextWithCancelKeyboard(
            msg.chat.id,
            bot,
            user.language === UserLanguageEnum.EN
              ? 'Wrong value. Please send integer!'
              : user.language === UserLanguageEnum.UA
                ? 'Неправильне значення. Має бути ціле число!'
                : 'Неверное значение. Должно быть целое число!',
            'AdminChooseSubscriptionPlan;' + planData.id,
            user,
          );
        }

        await redisService.delete(`EditSubscriptionPlanAdmin-${user.id}`);

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
        const promocodeData: UpdatePromocodeDto = JSON.parse(
          redisPromocodeAdminData,
        );
        promocodeData[promocodeData.field] = msg.text;

        if (
          promocodeData.field === 'sale_percent' &&
          !Number.isInteger(Number(msg.text))
        ) {
          return await sendTextWithCancelKeyboard(
            msg.chat.id,
            bot,
            user.language === UserLanguageEnum.EN
              ? 'Wrong value. Please send integer!'
              : user.language === UserLanguageEnum.UA
                ? 'Неправильне значення. Має бути ціле число!'
                : 'Неверное значение. Должно быть целое число!',
            'AdminPromocodeDetails;' + promocodeData.id,
            user,
          );
        }

        await redisService.delete(`EditPromocodeAdmin-${user.id}`);

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

      // update paymentMethod
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

        if (payData.payment_method_id && payData.subscription_plan_id) {
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
            full_price_usd: payData.amount,
          });

          const managers = await userService.getUsers({
            names: admins,
          });

          const plan = await planService.findOne({
            id: payData.subscription_plan_id,
          });

          let promocode: PromocodeHesoyam = null;

          if (payData.promocode_id) {
            promocode = await promocodeService.findOne({
              id: payData.promocode_id,
            });

            const userPayments = await paymentService.getPayments({
              user_id: user.id,
              statuses: [
                PaymentStatusEnum.End,
                PaymentStatusEnum.Success,
                PaymentStatusEnum.Pending,
              ],
            });

            if (
              !promocode.is_multiple &&
              userPayments.payments.find((p) => p.promocode_id === promocode.id)
            ) {
              promocode = null;
            }
          }

          const admins_payment_messages = await Promise.all(
            managers.users.map(async (manager) => {
              const message = await sendGiveUserAccessKeyboard(
                manager.chat_id,
                bot,
                manager,
                user,
                payment,
                plan,
                paymentMethod,
                promocode,
              );

              return {
                message_id: message.message_id,
                chat_id: Number(manager.chat_id),
              };
            }),
          );

          await paymentService.update({
            ...payment,
            admins_payment_messages: JSON.stringify(admins_payment_messages),
          });

          await logService.create({
            user_hesoyam_id: user.id,
            info: `‼️ отправил скриншот с оплатой`,
            type: LogTypeEnum.USER,
            bot: BotEnum.HESOYAM,
          });

          return await bot.sendMessage(
            msg.chat.id,
            user.language === UserLanguageEnum.EN
              ? '✅ Thank you for the payment. The manager will soon verify all the payment and if it was successful, the links to join all the chats and channels will come here.'
              : user.language === UserLanguageEnum.UA
                ? '✅ Дякуємо за оплату. Менеджер скоро перевірить вшу оплату, і якщо вона пройшла успішно, сюди прийдуть посилання для приєднання до всіх чатів та каналів.'
                : '✅ Спасибо за оплату. Менеджер скоро проверит вашу оплату, и если она прошла успешно, сюда придут ссылки для подключения ко всем чатам и каналам.',
          );
        }
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
    } catch (e) {
      logService.create({
        action: 'message',
        info: JSON.stringify(e.stack),
        type: LogTypeEnum.ERROR,
        bot: BotEnum.HESOYAM,
      });
    }
  });
};
