import { IsString } from 'class-validator';
import { CurrencyEnum } from 'src/helper';

export class CreateDto {
  @IsString({ message: 'Must be a string' })
  readonly name?: string;

  @IsString({ message: 'Must be a string' })
  readonly address?: string;

  @IsString({ message: 'Must be a string' })
  readonly description?: string;

  @IsString({ message: 'Must be a string' })
  readonly currency?: CurrencyEnum;
}
