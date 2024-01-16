import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { UserModule } from '../user/user.module';
import { BotModule } from 'src/bot/bot.module';
import { RedisModule } from 'src/redis/redis.module';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    UserModule,
    BotModule,
    RedisModule,
    HttpModule,
    ScheduleModule.forRoot(),
  ],
  providers: [CronService],
  controllers: [],
  exports: [CronService],
})
export class CronModule {}
