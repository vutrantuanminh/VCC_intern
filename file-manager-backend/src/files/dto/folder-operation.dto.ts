import { IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class FolderOperationDto {
  @ApiProperty({ description: 'ID của thư mục (tùy chọn)', example: 1, required: false })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  folderId?: number;
}