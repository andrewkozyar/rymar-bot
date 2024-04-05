import { BotEnum } from 'src/helper';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

const bots = Object.values(BotEnum);

@Entity()
export class ChannelHesoyam {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  chat_id: string;

  @Column({ nullable: true })
  type: string;

  @Column({ default: false })
  is_for_subscription: boolean;

  @Column({ nullable: true })
  resend_to: string;

  @Column({
    type: 'enum',
    enum: bots,
    nullable: true,
  })
  bot: BotEnum;
}
