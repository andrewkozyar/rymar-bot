import { IsString, IsNumber } from 'class-validator';

export class CreateDto {
  @IsNumber()
  readonly UAH?: number;

  @IsString({ message: 'Must be a string' })
  readonly RUB?: number;

  @IsString({ message: 'Must be a string' })
  readonly KZT?: number;

  @IsString({ message: 'Must be a string' })
  readonly USDT?: number;

  @IsString({ message: 'Must be a string' })
  readonly USD?: number;
}
