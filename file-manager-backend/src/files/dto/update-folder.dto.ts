import { IsNotEmpty, IsOptional, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFolderDto {
  @ApiProperty({ description: 'Tên mới của thư mục (tùy chọn)', example: 'UpdatedFolder', required: false })
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({ description: 'ID của thư mục cha (tùy chọn)', example: 1, required: false })
  @IsOptional()
  @IsInt()
  parentId?: number;

  @ApiProperty({ description: 'ID người sở hữu mới (chỉ dành cho admin, tùy chọn)', example: 1, required: false })
  @IsOptional()
  @IsInt()
  ownerId?: number;
}