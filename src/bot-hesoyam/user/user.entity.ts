import { BotEnum, UserLanguageEnum } from 'src/helper';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export const userLanguages = Object.values(UserLanguageEnum);
const bots = Object.values(BotEnum);

@Entity()
export class UserHesoyam {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  email: string;

  @Column()
  chat_id: string;

  @Column({ nullable: true })
  timezone: string;

  @Column({
    type: 'enum',
    enum: userLanguages,
    default: UserLanguageEnum.EN,
  })
  language: UserLanguageEnum;

  @Column({
    type: 'enum',
    enum: bots,
    nullable: true,
  })
  bot: BotEnum;

  @CreateDateColumn()
  created_date: Date;

  @UpdateDateColumn()
  updated_date: Date;
}
