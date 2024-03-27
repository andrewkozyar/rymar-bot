import { ConfigService } from '@nestjs/config';
import * as TelegramBot from 'node-telegram-bot-api';

export const telegramBotViceCity = (
  configService: ConfigService,
): TelegramBot => {
  return new TelegramBot(
    configService.get<string>('TELEGRAM_BOT_VICE_CITY_TOKEN'),
    {
      polling: true,
    },
  );
};

export const telegramBotHesoyam = (
  configService: ConfigService,
): TelegramBot => {
  return new TelegramBot(
    configService.get<string>('TELEGRAM_BOT_HESOYAM_TOKEN'),
    {
      polling: true,
    },
  );
};
