import { ConfigService } from '@nestjs/config';
import * as TelegramBot from 'node-telegram-bot-api';

export const telegramBot = (configService: ConfigService): TelegramBot => {
  return new TelegramBot(configService.get<string>('TELEGRAM_BOT_TOKEN'), {
    polling: true,
  });
};
