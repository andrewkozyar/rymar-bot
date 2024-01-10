import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChannelService } from './channel.service';
import { Channel } from './channel.entity';

@Module({
  controllers: [],
  providers: [ChannelService],
  imports: [TypeOrmModule.forFeature([Channel])],
  exports: [ChannelService],
})
export class ChannelModule {}
