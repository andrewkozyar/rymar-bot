import { IsString, IsUUID } from 'class-validator';

export class GetDto {
  @IsString({ message: 'Must be a string' })
  @IsUUID('all', { message: 'Must be uuid' })
  readonly id?: string;

  @IsString()
  user_id?: string;
}
