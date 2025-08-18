import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional } from 'class-validator';

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
    type: 'object',
    properties: {
      id: { type: 'number', example: 25 },
      username: { type: 'string', example: 'user1' },
    },
  })
  owner: { id: number; username: string };

  @ApiProperty({
    description: 'Thông tin thư mục chứa file (nếu có)',
    type: 'object',
    nullable: true,
    properties: {
      id: { type: 'number', example: 1 },
      name: { type: 'string', example: 'MyFolder' },
    },
  })
  @IsOptional()
  folder?: { id: number; name: string };
}