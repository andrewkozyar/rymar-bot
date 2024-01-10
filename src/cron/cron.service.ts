import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BotService } from 'src/bot/bot.service';
import { addDays } from 'src/helper/date';
import { UserService } from 'src/user/user.service';

@Injectable()
export class CronService {
  constructor(
    private userService: UserService,
    private botService: BotService,
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

    return true;
  }
}
