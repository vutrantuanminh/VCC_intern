import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Địa chỉ email', example: 'b@gmail.com', required: true })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Mật khẩu', example: 'tuanminh', required: true })
  @IsNotEmpty()
  password: string;
}