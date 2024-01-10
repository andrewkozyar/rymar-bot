import { IsString, IsEmail, IsOptional } from 'class-validator';
import { UserLanguageEnum } from '../../helper';

export class UpdateUserDto {
  @IsString({ message: 'Must be a string' })
  @IsOptional()
  readonly name?: string;

  @IsString({ message: 'Must be a string' })
  @IsEmail({}, { message: 'Must be email' })
  @IsOptional()
  email?: string;

  @IsString({ message: 'Must be a string' })
  @IsOptional()
  timezone?: string;

  @IsString({ message: 'Must be a string' })
  @IsOptional()
  language?: UserLanguageEnum;
}
