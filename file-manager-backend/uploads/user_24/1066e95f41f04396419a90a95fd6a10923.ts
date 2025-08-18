import { IsNotEmpty, IsOptional, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFolderDto {
  @ApiProperty({ description: 'Tên thư mục', example: 'MyFolder', required: true })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'ID của thư mục cha (tùy chọn)', example: 1, required: false })
  @IsOptional()
  @IsInt()
  parentId?: number;

  @ApiProperty({ description: 'ID người sở hữu (chỉ dành cho admin, tùy chọn)', example: 1, required: false })
  @IsOptional()
  @IsInt()
  ownerId?: number;
}