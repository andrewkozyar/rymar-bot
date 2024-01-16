import { CurrencyEnum, currencies } from 'src/helper';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity()
export class PaymentMethod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  address: string;

  @Column({
    type: 'enum',
    enum: currencies,
    nullable: true,
  })
  currency: CurrencyEnum;

  @Column({ nullable: true })
  descriptionEN: string;

  @Column({ nullable: true })
  descriptionUA: string;

  @Column({ nullable: true })
  descriptionRU: string;

  @Column({ default: false })
  is_published: boolean;

  @CreateDateColumn()
  created_date: Date;

  @UpdateDateColumn()
  updated_date: Date;

  @DeleteDateColumn()
  deleted_date: Date;
}
