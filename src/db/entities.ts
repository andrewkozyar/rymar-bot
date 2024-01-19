import { User } from '../user/user.entity';
import { SubscriptionPlan } from '../subscriptionPlan/subscriptionPlan.entity';
import { Payment } from 'src/payment/payment.entity';
import { PaymentMethod } from 'src/paymentMethod/paymentMethod.entity';
import { Promocode } from 'src/promocode/promocode.entity';
import { Channel } from 'src/chanel/channel.entity';
import { ConversionRate } from 'src/conversionRate/conversionRate.entity';
import { Log } from 'src/log/log.entity';

export const entities = [
  Channel,
  Payment,
  PaymentMethod,
  Promocode,
  SubscriptionPlan,
  User,
  ConversionRate,
  Log,
];
