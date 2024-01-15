import { PaymentStatusEnum } from 'src/helper';
import { PaymentMethod } from 'src/paymentMethod/paymentMethod.entity';
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

export const statuses = Object.values(PaymentStatusEnum);

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

  @Column({
    type: 'enum',
    enum: statuses,
    default: PaymentStatusEnum.Pending,
  })
  status: PaymentStatusEnum;

  @Column({ nullable: true })
  screenshot_message_id: string;

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

  @Column({ nullable: true })
  payment_method_id: string;

  @ManyToOne(() => PaymentMethod, { nullable: true })
  @JoinColumn({ referencedColumnName: 'id', name: 'payment_method_id' })
  payment_method: PaymentMethod;

  @Column()
  expired_date: Date;

  @CreateDateColumn()
  created_date: Date;

  @UpdateDateColumn()
  updated_date: Date;
}
