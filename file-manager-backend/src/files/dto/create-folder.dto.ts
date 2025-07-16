import { IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class CreateFolderDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsInt()
  parentId?: number; // ID của thư mục cha (nếu có)
}