import { Promocode } from 'src/promocode/promocode.entity';
import { SubscriptionPlan } from '../subscriptionPlan/subscriptionPlan.entity';
import { User } from '../user/user.entity';
import { Payment } from 'src/payment/payment.entity';

export class GetUsersType {
  readonly users: User[];
  readonly total: number;
}

export class GetSubscriptionPlansType {
  readonly subscriptionPlans: SubscriptionPlan[];
  readonly total: number;
}

export class GetPromocodesType {
  readonly promocodes: Promocode[];
  readonly total: number;
}

export class GetPaymentsType {
  readonly payments: Payment[];
  readonly total: number;
}

export class MessageType {
  readonly message: boolean;
}

export enum UserLanguageEnum {
  RU = 'RU',
  EN = 'EN',
  PL = 'PL',
  UA = 'UA',
  GE = 'GE',
  RO = 'RO',
  IT = 'IT',
}
