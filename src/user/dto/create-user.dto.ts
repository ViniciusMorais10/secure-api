import { IsDefined, IsEmail, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
export class CreateUserDto {
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string') return '';
    return value.trim().toLowerCase();
  })
  @IsDefined()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, {
    message: 'Password must be at least 8 characters',
  })
  password: string;
}
