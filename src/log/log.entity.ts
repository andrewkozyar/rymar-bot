import { LogTypeEnum } from 'src/helper';
import { User } from 'src/user/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

export const types = Object.values(LogTypeEnum);

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

  @Column({ nullable: true })
  user_id: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ referencedColumnName: 'id', name: 'user_id' })
  user: User;

  @Column({ default: false })
  action: string;

  @CreateDateColumn()
  created_date: Date;
}
