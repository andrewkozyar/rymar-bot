import { CurrencyEnum, PaymentStatusEnum, currencies } from 'src/helper';
import { PaymentMethod } from 'src/bot-vice-city/paymentMethod/paymentMethod.entity';
import { Promocode } from 'src/bot-vice-city/promocode/promocode.entity';
import { SubscriptionPlan } from 'src/bot-vice-city/subscriptionPlan/subscriptionPlan.entity';
import { User } from 'src/bot-vice-city/user/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

const statuses = Object.values(PaymentStatusEnum);

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'float' })
  amount: number;

  @Column({ nullable: true, type: 'float' })
  price_usd: number;

  @Column({ nullable: true, type: 'float' })
  full_price_usd: number;

  @Column({ nullable: true })
  address: string;

  @Column({
    type: 'enum',
    enum: currencies,
    nullable: true,
  })
  currency: CurrencyEnum;

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

  @Column({ nullable: true })
  admins_payment_messages: string;

  @CreateDateColumn()
  created_date: Date;

  @UpdateDateColumn()
  updated_date: Date;

  @Column({ nullable: true })
  updated_by_id: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ referencedColumnName: 'id', name: 'updated_by_id' })
  updated_by: User;
}
