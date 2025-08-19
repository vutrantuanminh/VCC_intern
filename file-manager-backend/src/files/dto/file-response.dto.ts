import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class OwnerDto {
  @ApiProperty({ description: 'ID của người sở hữu', example: 25 })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Tên người dùng', example: 'user1' })
  @IsString()
  username: string;
}

class FolderDto {
  @ApiProperty({ description: 'ID của thư mục', example: 1 })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Tên thư mục', example: 'MyFolder' })
  @IsString()
  name: string;
}

class CategoryDto {
  @ApiProperty({ description: 'ID của category', example: 1 })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Tên category', example: 'Documents' })
  @IsString()
  name: string;
}

export class FileResponseDto {
  @ApiProperty({
    description: 'ID của file',
    example: 1,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'Tên file',
    example: 'example.txt',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Đường dẫn công khai để truy cập file',
    example: '/files/download/1',
  })
  @IsString()
  externalPath: string;

  @ApiProperty({
    description: 'Loại MIME của file',
    example: 'text/plain',
  })
  @IsString()
  mimeType: string;

  @ApiProperty({
    description: 'Kích thước file (bytes)',
    example: 1024,
  })
  @IsNumber()
  size: number;

  @ApiProperty({
    description: 'Thông tin chủ sở hữu file',
    type: OwnerDto,
  })
  @ValidateNested()
  @Type(() => OwnerDto)
  owner: OwnerDto;

  @ApiProperty({
    description: 'Thông tin thư mục chứa file (nếu có)',
    type: FolderDto,
    nullable: true,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => FolderDto)
  folder?: FolderDto;

  @ApiProperty({
    description: 'Thông tin category của file',
    type: CategoryDto,
  })
  @ValidateNested()
  @Type(() => CategoryDto)
  category: CategoryDto;
}