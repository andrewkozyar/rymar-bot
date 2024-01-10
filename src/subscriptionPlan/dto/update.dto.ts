import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class UpdateDto {
  @IsString({ message: 'Must be a string' })
  id: string;

  @IsString({ message: 'Must be a string' })
  @IsOptional()
  nameEN?: string;

  @IsString({ message: 'Must be a string' })
  @IsOptional()
  nameUA?: string;

  @IsString({ message: 'Must be a string' })
  @IsOptional()
  nameRU?: string;

  @IsString({ message: 'Must be a string' })
  @IsOptional()
  descriptionEN?: string;

  @IsString({ message: 'Must be a string' })
  @IsOptional()
  descriptionUA?: string;

  @IsString({ message: 'Must be a string' })
  @IsOptional()
  descriptionRU?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsOptional()
  months_count?: number;

  @IsBoolean({ message: 'Must be a boolean' })
  @IsOptional()
  is_published?: boolean;

  @IsString({ message: 'Must be a string' })
  @IsOptional()
  field?: string;
}
