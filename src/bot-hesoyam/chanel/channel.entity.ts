import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ChannelHesoyam {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  chat_id: string;

  @Column({ nullable: true })
  type: string;

  @Column({ default: false })
  is_for_subscription: boolean;

  @Column({ nullable: true })
  resend_to: string;
}
