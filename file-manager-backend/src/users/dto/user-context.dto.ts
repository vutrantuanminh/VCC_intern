import { IsInt, IsString, IsIn } from 'class-validator';

export class UserContextDto {
  @IsInt({ message: 'userId phải là một số nguyên' })
  userId: number;

  @IsString({ message: 'role phải là một chuỗi' })
  @IsIn(['admin', 'user'], { message: 'role phải là "admin" hoặc "user"' })
  role: string;
}