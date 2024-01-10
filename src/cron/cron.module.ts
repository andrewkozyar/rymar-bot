import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { UserModule } from '../user/user.module';
import { BotModule } from 'src/bot/bot.module';

@Module({
  imports: [UserModule, BotModule],
  providers: [CronService],
  controllers: [],
  exports: [CronService],
})
export class CronModule {}
