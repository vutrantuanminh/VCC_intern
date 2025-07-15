import { IsEmail, IsNotEmpty, MinLength, MaxLength, IsEnum } from 'class-validator';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @IsEnum(Gender)
  gender: Gender;

  @MinLength(10)
  @MaxLength(10)
  phone_number: number;

  @IsNotEmpty()
  @MaxLength(16)
  username: string;
}
