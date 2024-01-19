import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Log {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  info: string;

  @Column({ nullable: true })
  type: string;

  @Column({ default: false })
  action: string;

  @CreateDateColumn()
  created_date: Date;
}
