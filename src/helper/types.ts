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

export enum PaymentStatusEnum {
  Pending = 'PENDING',
  Success = 'SUCCESS',
  Cancel = 'CANCEL',
  End = 'END',
}

export interface ExchangeRatesApiResponseInterface {
  success: boolean;
  timestamp: number;
  base: CurrencyEnum;
  date: Date;
  rates: RatesInterface;
}

export interface RatesInterface {
  USD: number;
  UAH: number;
  RUB: number;
  KZT: number;
  USDT?: number;
}

export enum CurrencyEnum {
  UAH = 'UAH',
  RUB = 'RUB',
  KZT = 'KZT',
  USDT = 'USDT',
  USD = 'USD',
}

export const currencies = Object.values(CurrencyEnum);

export interface PayDataInterface {
  amount: number;
  subscription_plan_id: string;
  promocode_id?: string;
  newPrice: number;
  isContinue?: boolean;
  price_usd?: number;
  payment_method_id?: string;
  isFromNotification?: boolean;
  continueDays?: number;
  addressMessageId?: number;
}
