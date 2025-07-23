import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Địa chỉ email', example: 'nguyenvan@example.com', required: true })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Mật khẩu', example: 'password123', required: true })
  @IsNotEmpty()
  password: string;
}