import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BotService } from 'src/bot/bot.service';
import { addDays } from 'src/helper/date';
import { RedisService } from 'src/redis/redis.service';
import { UserService } from 'src/user/user.service';
import { HttpService } from '@nestjs/axios';
import {
  CurrencyEnum,
  ExchangeRatesApiResponseInterface,
  errorHandler,
} from 'src/helper';

@Injectable()
export class CronService {
  constructor(
    private userService: UserService,
    private botService: BotService,
    private redisService: RedisService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_1PM)
  async checkExpiredDate() {
    const { users: usersFor7DayNotification } = await this.userService.getUsers(
      {
        expired_date: addDays(new Date(), 7),
      },
    );

    if (usersFor7DayNotification.length) {
      this.botService.notifyUsers(usersFor7DayNotification, 7);
    }

    const { users: usersFor3DayNotification } = await this.userService.getUsers(
      {
        expired_date: addDays(new Date(), 3),
      },
    );

    if (usersFor7DayNotification.length) {
      this.botService.notifyUsers(usersFor3DayNotification, 3);
    }

    const { users: usersFor1DayNotification } = await this.userService.getUsers(
      {
        expired_date: addDays(new Date(), 1),
      },
    );

    if (usersFor7DayNotification.length) {
      this.botService.notifyUsers(usersFor1DayNotification, 1);
    }

    const { users: expiredUsers } = await this.userService.getUsers({
      expired_date: new Date(),
    });

    if (expiredUsers.length) {
      this.botService.deleteExpiredUsers(expiredUsers);
    }

    this.updateConversionRates();

    return true;
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async updateConversionRates() {
    console.log('start updateConversionRates *****************************');
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

      return await this.redisService.add(
        'exchangeRateToUsd',
        JSON.stringify({
          UAH: rates.UAH / rates.USD,
          RUB: rates.RUB / rates.USD,
          KZT: rates.KZT / rates.USD,
          USD: 1,
          USDT: 1,
        }),
      );
    } catch (e) {
      errorHandler(`Failed to get fiat exchange rates`, 500, e);

      return null;
    }
  }
}
