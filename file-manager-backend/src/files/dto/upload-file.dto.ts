import { IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UploadFileDto {
  @ApiProperty({
    description: 'ID của thư mục (tùy chọn)',
    example: 1,
    nullable: true,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  folderId?: number;
}