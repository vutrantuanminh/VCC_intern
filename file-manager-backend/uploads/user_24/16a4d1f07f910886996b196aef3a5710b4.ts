import { IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class FileOperationDto {
  @ApiProperty({ description: 'ID của tệp (tùy chọn)', example: 1, required: false })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  fileId?: number;
}