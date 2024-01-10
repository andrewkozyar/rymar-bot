import { IsString, IsNumber } from 'class-validator';
import { UserLanguageEnum } from '../../helper';

export class CreateUserDto {
  @IsString({ message: 'Must be a string' })
  readonly name: string;

  @IsNumber()
  readonly chat_id: number;

  @IsNumber()
  readonly language: UserLanguageEnum;
}
