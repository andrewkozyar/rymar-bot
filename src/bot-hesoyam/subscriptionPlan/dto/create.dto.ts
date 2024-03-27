import { IsString, IsNumber } from 'class-validator';

export class CreateDto {
  @IsString({ message: 'Must be a string' })
  readonly nameEN?: string;

  @IsString({ message: 'Must be a string' })
  readonly nameUA?: string;

  @IsString({ message: 'Must be a string' })
  readonly nameRU?: string;

  @IsString({ message: 'Must be a string' })
  readonly descriptionEN?: string;

  @IsString({ message: 'Must be a string' })
  readonly descriptionUA?: string;

  @IsString({ message: 'Must be a string' })
  readonly descriptionRU?: string;

  @IsNumber()
  readonly price?: number;
}
