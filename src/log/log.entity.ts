import { BotEnum, LogTypeEnum } from 'src/helper';
import { User } from 'src/bot-vice-city/user/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { UserHesoyam } from 'src/bot-hesoyam/user/user.entity';

export const types = Object.values(LogTypeEnum);
export const botTypes = Object.values(BotEnum);

@Entity()
export class Log {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  info: string;

  @Column({
    type: 'enum',
    enum: types,
    nullable: true,
  })
  type: LogTypeEnum;

  @Column({
    type: 'enum',
    enum: botTypes,
    nullable: true,
  })
  bot: BotEnum;

  @Column({ nullable: true })
  user_id: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ referencedColumnName: 'id', name: 'user_id' })
  user: User;

  @Column({ nullable: true })
  user_hesoyam_id: string;

  @ManyToOne(() => UserHesoyam, { nullable: true })
  @JoinColumn({ referencedColumnName: 'id', name: 'user_hesoyam_id' })
  user_hesoyam: UserHesoyam;

  @Column({ nullable: true })
  action: string;

  @CreateDateColumn()
  created_date: Date;
}
