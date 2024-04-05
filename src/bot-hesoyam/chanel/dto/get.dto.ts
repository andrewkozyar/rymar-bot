import { IsString, IsUUID, IsNumber } from 'class-validator';
import { BotEnum } from 'src/helper';

export class GetDto {
  @IsString({ message: 'Must be a string' })
  @IsUUID('all', { message: 'Must be uuid' })
  readonly id?: string;

  @IsString()
  name?: string;

  @IsNumber()
  readonly chat_id: number;

  bot: BotEnum;
}
