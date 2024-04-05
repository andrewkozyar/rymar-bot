import { IsString, IsNumber } from 'class-validator';
import { BotEnum, CurrencyEnum, PaymentStatusEnum } from 'src/helper';

export class CreateDto {
  @IsString({ message: 'Must be a string' })
  readonly id?: string;

  @IsString({ message: 'Must be a string' })
  readonly address?: string;

  @IsNumber()
  readonly amount?: number;

  @IsString({ message: 'Must be a string' })
  readonly currency?: CurrencyEnum;

  @IsString({ message: 'Must be a string' })
  readonly subscription_plan_id?: string;

  @IsString({ message: 'Must be a string' })
  readonly promocode_id?: string;

  @IsString({ message: 'Must be a string' })
  readonly payment_method_id?: string;

  @IsString({ message: 'Must be a string' })
  readonly status?: PaymentStatusEnum;

  @IsString({ message: 'Must be a string' })
  readonly user_id?: string;

  @IsString({ message: 'Must be a string' })
  readonly screenshot_message_id?: string;

  @IsString({ message: 'Must be a string' })
  readonly updated_by_id?: string;

  @IsString({ message: 'Must be a string' })
  readonly admins_payment_messages?: string;

  @IsNumber()
  readonly price_usd?: number;

  readonly full_price_usd?: number;

  bot: BotEnum;
}
