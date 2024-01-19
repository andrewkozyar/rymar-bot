import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BotService } from 'src/bot/bot.service';
import { addDays } from 'src/helper/date';
import { UserService } from 'src/user/user.service';
import { HttpService } from '@nestjs/axios';
import {
  CurrencyEnum,
  ExchangeRatesApiResponseInterface,
  errorHandler,
  getFiatAmount,
} from 'src/helper';
import { ConversionRateService } from 'src/conversionRate/conversionRate.service';
import { LogService } from 'src/log/log.service';

@Injectable()
export class CronService {
  constructor(
    private userService: UserService,
    private botService: BotService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private rateService: ConversionRateService,
    private logService: LogService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_1PM)
  async checkExpiredDate() {
    try {
      const { users: usersFor7DayNotification } =
        await this.userService.getUsers({
          expired_date: addDays(new Date(), 7),
        });

      if (usersFor7DayNotification.length) {
        this.botService.notifyUsers(usersFor7DayNotification, 7);
      }

      const { users: usersFor3DayNotification } =
        await this.userService.getUsers({
          expired_date: addDays(new Date(), 3),
        });

      if (usersFor7DayNotification.length) {
        this.botService.notifyUsers(usersFor3DayNotification, 3);
      }

      const { users: usersFor1DayNotification } =
        await this.userService.getUsers({
          expired_date: addDays(new Date(), 1),
        });

      if (usersFor7DayNotification.length) {
        this.botService.notifyUsers(usersFor1DayNotification, 1);
      }

      const { users: expiredUsers } = await this.userService.getUsers({
        expired_date: new Date(),
      });

      if (expiredUsers.length) {
        this.botService.deleteExpiredUsers(expiredUsers);
      }

      await this.updateConversionRates();

      return true;
    } catch (e) {
      this.logService.create({
        action: 'checkExpiredDate',
        info: JSON.stringify(e),
        type: 'error',
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
