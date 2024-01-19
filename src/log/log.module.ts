import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LogService } from './log.service';
import { Log } from './log.entity';

@Module({
  controllers: [],
  providers: [LogService],
  imports: [TypeOrmModule.forFeature([Log])],
  exports: [LogService],
})
export class LogModule {}
