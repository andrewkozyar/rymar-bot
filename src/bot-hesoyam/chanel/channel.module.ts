import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChannelService } from './channel.service';
import { ChannelHesoyam } from './channel.entity';
import { LogModule } from 'src/log/log.module';

@Module({
  controllers: [],
  providers: [ChannelService],
  imports: [TypeOrmModule.forFeature([ChannelHesoyam]), LogModule],
  exports: [ChannelService],
})
export class ChannelModule {}
