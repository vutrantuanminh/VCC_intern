import { IsString, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Tên mới của category', example: 'Documents Updated', nullable: true })
  name?: string;

  @IsOptional()
  @IsArray()
  @ApiProperty({ description: 'Danh sách extension mới', example: ['.doc', '.docx', '.pdf', '.txt'], nullable: true })
  extensions?: string[];
}