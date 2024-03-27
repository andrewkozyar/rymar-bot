import { IsBoolean, IsString, IsUUID } from 'class-validator';

export class GetDto {
  @IsString({ message: 'Must be a string' })
  @IsUUID('all', { message: 'Must be uuid' })
  readonly id?: string;

  @IsString()
  name?: string;

  @IsBoolean()
  readonly is_published?: boolean;

  @IsBoolean({ message: 'Must be a boolean' })
  is_multiple?: boolean;

  user_id?: string;
}
