// user-context.dto.ts
import { IsInt, IsString, IsIn, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UserContextDto {
  @ApiProperty({ description: 'ID của người dùng', example: 1 })
  @IsInt({ message: 'userId phải là một số nguyên' })
  userId: number;

  @ApiProperty({ description: 'Vai trò của người dùng', example: 'user' })
  @IsString({ message: 'role phải là một chuỗi' })
  @IsIn(['admin', 'user'], { message: 'role phải là "admin" hoặc "user"' })
  role: string;

  @ApiProperty({ description: 'ID của thư mục (tùy chọn)', example: 1, required: false })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  folderId?: number;

  @ApiProperty({ description: 'ID của tệp (tùy chọn)', example: 1, required: false })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  fileId?: number;
}