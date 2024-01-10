import { Promocode } from 'src/promocode/promocode.entity';
import { SubscriptionPlan } from 'src/subscriptionPlan/subscriptionPlan.entity';
import { User } from 'src/user/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'float' })
  amount: number;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  currency: string;

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: true })
  subscription_plan_id: string;

  @ManyToOne(() => SubscriptionPlan, { nullable: true })
  @JoinColumn({ referencedColumnName: 'id', name: 'subscription_plan_id' })
  subscription_plan: SubscriptionPlan;

  @Column({ nullable: true })
  promocode_id: string;

  @ManyToOne(() => Promocode, { nullable: true })
  @JoinColumn({ referencedColumnName: 'id', name: 'promocode_id' })
  promocode: Promocode;

  @Column({ nullable: true })
  user_id: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ referencedColumnName: 'id', name: 'user_id' })
  user: User;

  @Column()
  expired_date: Date;

  @CreateDateColumn()
  created_date: Date;

  @UpdateDateColumn()
  updated_date: Date;
}
