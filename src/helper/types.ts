import { Promocode } from 'src/bot-vice-city/promocode/promocode.entity';
import { SubscriptionPlan } from '../bot-vice-city/subscriptionPlan/subscriptionPlan.entity';
import { User } from '../bot-vice-city/user/user.entity';
import { Payment } from 'src/bot-vice-city/payment/payment.entity';
import { PaymentHesoyam } from 'src/bot-hesoyam/payment/payment.entity';
import { SubscriptionPlanHesoyam } from 'src/bot-hesoyam/subscriptionPlan/subscriptionPlan.entity';
import { UserHesoyam } from 'src/bot-hesoyam/user/user.entity';

export class GetUsersType {
  readonly users: User[];
  readonly total: number;
}

export class GetUsersHesoyamType {
  readonly users: UserHesoyam[];
  readonly total: number;
}

export class GetSubscriptionPlansType {
  readonly subscriptionPlans: SubscriptionPlan[] | SubscriptionPlanHesoyam[];
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

export class GetPaymentsHesoyamType {
  readonly payments: PaymentHesoyam[];
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

export enum LogTypeEnum {
  INFO = 'info',
  ERROR = 'error',
  USER = 'user',
}

export enum BotEnum {
  VICE_CITY = 'VICE_CITY',
  HESOYAM = 'HESOYAM',
  HESOYAM_MANAGER = 'HESOYAM_MANAGER',
}

export enum LaterTypeEnum {
  BuyPlan = 'BuyPlan',
  ContinueBuyingPlan = 'ContinueBuyingPlan',
  DeclineBuyPlan = 'DeclineBuyPlan',
  EndPlanIn = 'EndPlanIn',
  EndPlan = 'EndPlan',
  BuyPlanWithoutChannels = 'BuyPlanWithoutChannels',
}
