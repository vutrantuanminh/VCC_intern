import { IsEmail, IsNotEmpty, MinLength, MaxLength, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export class RegisterDto {
  @ApiProperty({ description: 'Địa chỉ email', example: 'nguyenvan@example.com', required: true })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Mật khẩu, tối thiểu 6 ký tự', example: 'password123', required: true })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'Giới tính', enum: Gender, example: Gender.MALE, required: true })
  @IsNotEmpty()
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ description: 'Số điện thoại, đúng 10 số', example: 1234567890, required: true })
  @MinLength(10)
  @MaxLength(10)
  phone_number: string;

  @ApiProperty({ description: 'Tên người dùng, tối đa 16 ký tự', example: 'nguyenvan', required: true })
  @IsNotEmpty()
  @MaxLength(16)
  username: string;
}