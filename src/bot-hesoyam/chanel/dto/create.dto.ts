import { IsString, IsNumber } from 'class-validator';
import { BotEnum } from 'src/helper';

export class CreateDto {
  @IsString({ message: 'Must be a string' })
  readonly name: string;

  @IsNumber()
  readonly chat_id: number;

  @IsString({ message: 'Must be a string' })
  readonly type: string;

  bot: BotEnum;
}
