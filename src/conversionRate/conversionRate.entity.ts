import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ConversionRate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'float' })
  UAH: number;

  @Column({ nullable: true, type: 'float' })
  RUB: number;

  @Column({ nullable: true, type: 'float' })
  KZT: number;

  @Column({ nullable: true, type: 'float' })
  USDT: number;

  @Column({ nullable: true, type: 'float' })
  USD: number;
}
