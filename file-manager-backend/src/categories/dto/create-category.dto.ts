import { IsString, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @IsString()
  @ApiProperty({ description: 'Tên của category', example: 'Documents' })
  name: string;

  @IsOptional()
  @IsArray()
  @ApiProperty({ description: 'Danh sách extension liên quan', example: ['.doc', '.docx', '.pdf'], nullable: true })
  extensions?: string[];
}