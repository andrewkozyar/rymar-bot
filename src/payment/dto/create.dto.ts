import { IsString, IsNumber } from 'class-validator';

export class CreateDto {
  @IsString({ message: 'Must be a string' })
  readonly address?: string;

  @IsNumber()
  readonly amount?: number;

  @IsString({ message: 'Must be a string' })
  readonly currency?: string;

  @IsString({ message: 'Must be a string' })
  readonly status?: string;

  @IsString({ message: 'Must be a string' })
  readonly subscription_plan_id?: string;

  @IsString({ message: 'Must be a string' })
  readonly promocode_id?: string;

  @IsString({ message: 'Must be a string' })
  readonly user_id?: string;
}
