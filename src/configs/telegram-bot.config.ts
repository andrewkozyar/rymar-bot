import { ConfigService } from '@nestjs/config';
import * as TelegramBot from 'node-telegram-bot-api';

export const telegramBot = (
  configService: ConfigService,
  botENV: string,
): TelegramBot => {
  if (configService.get<string>(botENV)) {
    return new TelegramBot(configService.get<string>(botENV), {
      polling: true,
    });
  }
  return null;
};
