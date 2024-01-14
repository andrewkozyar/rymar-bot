import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateDto {
  @IsString({ message: 'Must be a string' })
  id: string;

  @IsString({ message: 'Must be a string' })
  @IsOptional()
  name?: string;

  @IsBoolean({ message: 'Must be a boolean' })
  @IsOptional()
  is_published?: boolean;

  @IsString({ message: 'Must be a string' })
  @IsOptional()
  address?: string;

  @IsString({ message: 'Must be a string' })
  @IsOptional()
  descriptionEN?: string;

  @IsString({ message: 'Must be a string' })
  @IsOptional()
  descriptionUA?: string;

  @IsString({ message: 'Must be a string' })
  @IsOptional()
  descriptionRU?: string;

  @IsString({ message: 'Must be a string' })
  @IsOptional()
  field?: string;
}
