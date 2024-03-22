import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class UpdateDto {
  @IsString({ message: 'Must be a string' })
  id: string;

  @IsString({ message: 'Must be a string' })
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  sale_percent?: number;

  @IsBoolean({ message: 'Must be a boolean' })
  @IsOptional()
  is_published?: boolean;

  @IsBoolean({ message: 'Must be a boolean' })
  @IsOptional()
  is_multiple?: boolean;

  @IsString({ message: 'Must be a string' })
  @IsOptional()
  field?: string;
}
