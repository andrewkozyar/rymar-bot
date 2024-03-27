import { User } from '../bot-vice-city/user/user.entity';
import { SubscriptionPlan } from '../bot-vice-city/subscriptionPlan/subscriptionPlan.entity';
import { Payment } from 'src/bot-vice-city/payment/payment.entity';
import { PaymentMethod } from 'src/bot-vice-city/paymentMethod/paymentMethod.entity';
import { Promocode } from 'src/bot-vice-city/promocode/promocode.entity';
import { Channel } from 'src/bot-vice-city/chanel/channel.entity';
import { ConversionRate } from 'src/conversionRate/conversionRate.entity';
import { Log } from 'src/log/log.entity';
import { ChannelHesoyam } from 'src/bot-hesoyam/chanel/channel.entity';
import { PaymentHesoyam } from 'src/bot-hesoyam/payment/payment.entity';
import { PaymentMethodHesoyam } from 'src/bot-hesoyam/paymentMethod/paymentMethod.entity';
import { PromocodeHesoyam } from 'src/bot-hesoyam/promocode/promocode.entity';
import { SubscriptionPlanHesoyam } from 'src/bot-hesoyam/subscriptionPlan/subscriptionPlan.entity';
import { UserHesoyam } from 'src/bot-hesoyam/user/user.entity';

export const entities = [
  Channel,
  Payment,
  PaymentMethod,
  Promocode,
  SubscriptionPlan,
  User,
  ChannelHesoyam,
  PaymentHesoyam,
  PaymentMethodHesoyam,
  PromocodeHesoyam,
  SubscriptionPlanHesoyam,
  UserHesoyam,
  ConversionRate,
  Log,
];
