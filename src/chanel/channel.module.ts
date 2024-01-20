import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChannelService } from './channel.service';
import { Channel } from './channel.entity';
import { LogModule } from 'src/log/log.module';

@Module({
  controllers: [],
  providers: [ChannelService],
  imports: [TypeOrmModule.forFeature([Channel]), LogModule],
  exports: [ChannelService],
})
export class ChannelModule {}
