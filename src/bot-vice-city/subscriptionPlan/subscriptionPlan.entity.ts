import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Channel } from '../chanel/channel.entity';

@Entity()
export class SubscriptionPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  nameEN: string;

  @Column({ nullable: true })
  nameUA: string;

  @Column({ nullable: true })
  nameRU: string;

  @Column({ nullable: true })
  price: number;

  @Column({ default: false })
  is_published: boolean;

  @Column({ nullable: true })
  descriptionEN: string;

  @Column({ nullable: true })
  descriptionUA: string;

  @Column({ nullable: true })
  descriptionRU: string;

  @Column({ nullable: true })
  months_count: number;

  @Column({ nullable: true })
  position: number;

  @ManyToMany(() => Channel)
  @JoinTable()
  channels: Channel[];

  @CreateDateColumn()
  created_date: Date;

  @UpdateDateColumn()
  updated_date: Date;

  @DeleteDateColumn()
  deleted_date: Date;
}
