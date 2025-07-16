import { IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class UpdateFolderDto {
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsInt()
  parentId?: number;
}