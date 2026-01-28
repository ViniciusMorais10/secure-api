import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'D5oT0@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongPass#123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, {
    message: 'password must be at least 8 characters',
  })
  password: string;
}
