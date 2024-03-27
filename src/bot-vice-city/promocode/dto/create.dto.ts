import { IsString, IsNumber } from 'class-validator';

export class CreateDto {
  @IsString({ message: 'Must be a string' })
  readonly name?: string;

  @IsNumber()
  readonly sale_percent?: number;
}
