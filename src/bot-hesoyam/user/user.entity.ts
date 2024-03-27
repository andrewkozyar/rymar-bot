import { UserLanguageEnum } from 'src/helper';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export const userLanguages = Object.values(UserLanguageEnum);

@Entity()
export class UserHesoyam {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ unique: true })
  chat_id: string;

  @Column({ nullable: true })
  timezone: string;

  @Column({
    type: 'enum',
    enum: userLanguages,
    default: UserLanguageEnum.EN,
  })
  language: UserLanguageEnum;

  @CreateDateColumn()
  created_date: Date;

  @UpdateDateColumn()
  updated_date: Date;
}
