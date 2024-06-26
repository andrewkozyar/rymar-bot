import {
  BotEnum,
  CurrencyEnum,
  PaymentStatusEnum,
  currencies,
} from 'src/helper';
import { PaymentMethodHesoyam } from 'src/bot-hesoyam/paymentMethod/paymentMethod.entity';
import { SubscriptionPlanHesoyam } from 'src/bot-hesoyam/subscriptionPlan/subscriptionPlan.entity';
import { UserHesoyam } from 'src/bot-hesoyam/user/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PromocodeHesoyam } from '../promocode/promocode.entity';

const statuses = Object.values(PaymentStatusEnum);
const bots = Object.values(BotEnum);

@Entity()
export class PaymentHesoyam {
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

  @Column({
    type: 'enum',
    enum: bots,
    nullable: true,
  })
  bot: BotEnum;

  @Column({ nullable: true })
  screenshot_message_id: string;

  @Column({ nullable: true })
  file_id: string;

  @Column({ nullable: true })
  subscription_plan_id: string;

  @ManyToOne(() => SubscriptionPlanHesoyam, { nullable: true })
  @JoinColumn({ referencedColumnName: 'id', name: 'subscription_plan_id' })
  subscription_plan: SubscriptionPlanHesoyam;

  @Column({ nullable: true })
  promocode_id: string;

  @ManyToOne(() => PromocodeHesoyam, { nullable: true })
  @JoinColumn({ referencedColumnName: 'id', name: 'promocode_id' })
  promocode: PromocodeHesoyam;

  @Column({ nullable: true })
  user_id: string;

  @ManyToOne(() => UserHesoyam, { nullable: true })
  @JoinColumn({ referencedColumnName: 'id', name: 'user_id' })
  user: UserHesoyam;

  @Column({ nullable: true })
  payment_method_id: string;

  @ManyToOne(() => PaymentMethodHesoyam, { nullable: true })
  @JoinColumn({ referencedColumnName: 'id', name: 'payment_method_id' })
  payment_method: PaymentMethodHesoyam;

  @Column({ nullable: true })
  admins_payment_messages: string;

  @CreateDateColumn()
  created_date: Date;

  @UpdateDateColumn()
  updated_date: Date;

  @Column({ nullable: true })
  updated_by_id: string;

  @ManyToOne(() => UserHesoyam, { nullable: true })
  @JoinColumn({ referencedColumnName: 'id', name: 'updated_by_id' })
  updated_by: UserHesoyam;
}
