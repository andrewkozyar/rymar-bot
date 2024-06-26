import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BotService } from 'src/bot-vice-city/bot/bot.service';
import { addDays, getDateWithoutHours } from 'src/helper/date';
import { UserService } from 'src/bot-vice-city/user/user.service';
import { HttpService } from '@nestjs/axios';
import {
  BotEnum,
  CurrencyEnum,
  ExchangeRatesApiResponseInterface,
  LogTypeEnum,
  errorHandler,
  getFiatAmount,
} from 'src/helper';
import { ConversionRateService } from 'src/conversionRate/conversionRate.service';
import { LogService } from 'src/log/log.service';
import { PaymentService } from 'src/bot-vice-city/payment/payment.service';

@Injectable()
export class CronService {
  constructor(
    private userService: UserService,
    private botService: BotService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private rateService: ConversionRateService,
    private logService: LogService,
    private paymentService: PaymentService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_1PM)
  async checkExpiredDate() {
    try {
      await this.logService.create({
        action: 'checkExpiredDate',
        info: 'start cron job',
        type: LogTypeEnum.INFO,
        bot: BotEnum.VICE_CITY,
      });

      const { users: expiredUsers } = await this.userService.getUsers({
        expired_date: new Date(),
        expiredDateBefore: true,
      });

      if (expiredUsers.length) {
        await this.botService.deleteExpiredUsers(expiredUsers);
      }

      const { users: usersFor1DayNotification } =
        await this.userService.getUsers({
          expired_date: addDays(getDateWithoutHours(new Date()), 1),
          notIn: expiredUsers.map((u) => u.id),
          expiredDateBefore: false,
        });

      if (usersFor1DayNotification.length) {
        await this.botService.notifyUsers(usersFor1DayNotification, 1);
      }

      const { users: usersFor3DayNotification } =
        await this.userService.getUsers({
          expired_date: addDays(getDateWithoutHours(new Date()), 3),
          notIn: [
            ...expiredUsers.map((u) => u.id),
            ...usersFor1DayNotification.map((u) => u.id),
          ],
          expiredDateBefore: false,
        });

      if (usersFor3DayNotification.length) {
        await this.botService.notifyUsers(usersFor3DayNotification, 3);
      }

      const { users: usersFor7DayNotification } =
        await this.userService.getUsers({
          expired_date: addDays(getDateWithoutHours(new Date()), 7),
          notIn: [
            ...expiredUsers.map((u) => u.id),
            ...usersFor1DayNotification.map((u) => u.id),
            ...usersFor3DayNotification.map((u) => u.id),
          ],
          expiredDateBefore: false,
        });

      if (usersFor7DayNotification.length) {
        await this.botService.notifyUsers(usersFor7DayNotification, 7);
      }

      await this.updateConversionRates();
      await this.paymentService.changeExpiredStatuses();

      return true;
    } catch (e) {
      this.logService.create({
        action: 'checkExpiredDate',
        info: JSON.stringify(e),
        type: LogTypeEnum.ERROR,
        bot: BotEnum.VICE_CITY,
      });
    }
  }

  // @Cron(CronExpression.EVERY_MINUTE)
  async updateConversionRates() {
    const exchangeRatesApiUrl = this.configService.get<string>(
      'EXCHANGE_RATES_API_URL',
    );
    const exchangeRatesApiAccessKey = this.configService.get<string>(
      'EXCHANGE_RATES_API_ACCESS_KEY',
    );

    try {
      const exchangeRateToEurData =
        await this.httpService.axiosRef.get<ExchangeRatesApiResponseInterface>(
          `${exchangeRatesApiUrl}/latest`,
          {
            params: {
              access_key: exchangeRatesApiAccessKey,
              symbols: `${CurrencyEnum.USD},${CurrencyEnum.UAH},${CurrencyEnum.RUB},${CurrencyEnum.KZT}`,
            },
          },
        );
      const { rates } =
        exchangeRateToEurData.data as ExchangeRatesApiResponseInterface;

      return await this.rateService.create({
        UAH: getFiatAmount(rates.UAH / rates.USD),
        RUB: getFiatAmount(rates.RUB / rates.USD),
        KZT: getFiatAmount(rates.KZT / rates.USD),
        USD: 1,
        USDT: 1,
      });
    } catch (e) {
      errorHandler(
        `Failed to get fiat exchange rates`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        e,
      );

      return null;
    }
  }
}
