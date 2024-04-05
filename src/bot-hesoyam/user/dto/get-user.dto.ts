import { IsString, IsEmail, IsUUID, IsNumber } from 'class-validator';
import { BotEnum } from 'src/helper';

export class GetUserDto {
  @IsString({ message: 'Must be a string' })
  @IsUUID('all', { message: 'Must be uuid' })
  readonly id?: string;

  @IsString({ message: 'Must be a string' })
  @IsEmail({}, { message: 'Must be email' })
  email?: string;

  @IsString({ message: 'Must be a string' })
  name?: string;

  @IsNumber()
  chat_id?: number;

  bot!: BotEnum;
}
