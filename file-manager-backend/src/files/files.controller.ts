import { Controller, Post, Body, Get, Param, Patch, Delete, UseGuards, Request, UseInterceptors, UploadedFile, Query, Response, UsePipes, ValidationPipe } from '@nestjs/common';
import { Response as ExpressResponse } from 'express';
import { FilesService } from './files.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';

@ApiTags('Files')
@Controller('files')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Post('folders')
  @Roles('user', 'admin')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Tạo thư mục mới' })
  @ApiResponse({ status: 201, description: 'Thư mục được tạo thành công' })
  @ApiResponse({ status: 401, description: 'Không được phép (Unauthorized)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Tên thư mục' },
        parentId: { type: 'number', description: 'ID thư mục cha (tùy chọn)', nullable: true },
        ownerId: { type: 'number', description: 'ID người sở hữu (chỉ dành cho admin)', nullable: true },
      },
    },
  })
  createFolder(@Request() req, @Body() createFolderDto: CreateFolderDto, @Body('ownerId') ownerId?: number) {
    return this.filesService.createFolder(req.user.id, req.user.role, createFolderDto, ownerId);
  }

  @Get('folders')
  @Roles('user', 'admin')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Lấy danh sách thư mục' })
  @ApiResponse({ status: 200, description: 'Danh sách thư mục' })
  @ApiResponse({ status: 401, description: 'Không được phép (Unauthorized)' })
  @ApiQuery({
    name: 'parentId',
    type: Number,
    description: 'ID của thư mục cha (tùy chọn)',
    required: false,
    example: 1,
  })
  getFolders(@Request() req, @Query('parentId') parentId?: number) {
    return this.filesService.listFolders(req.user.id, req.user.role, parentId);
  }

  @Get('folders/:id')
  @Roles('user', 'admin')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Lấy thông tin thư mục theo ID' })
  @ApiResponse({ status: 200, description: 'Thông tin thư mục' })
  @ApiResponse({ status: 404, description: 'Thư mục không tìm thấy' })
  getFolderById(@Request() req, @Param('id') id: number) {
    return this.filesService.findFolderById(req.user.id, req.user.role, id);
  }

  @Patch('folders/:id')
  @Roles('user', 'admin')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Cập nhật thông tin thư mục' })
  @ApiResponse({ status: 200, description: 'Thư mục được cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Thư mục không tìm thấy' })
  updateFolder(@Request() req, @Param('id') id: number, @Body() updateFolderDto: UpdateFolderDto) {
    return this.filesService.updateFolder(req.user.id, req.user.role, id, updateFolderDto);
  }

  @Delete('folders/:id')
  @Roles('user', 'admin')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Xóa thư mục' })
  @ApiResponse({ status: 200, description: 'Thư mục được xóa thành công' })
  @ApiResponse({ status: 404, description: 'Thư mục không tìm thấy' })
  deleteFolder(@Request() req, @Param('id') id: number) {
    return this.filesService.deleteFolder(req.user.id, req.user.role, id);
  }

  @Post('upload')
  @Roles('user', 'admin')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Tải lên tệp' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Tệp cần tải lên',
        },
        folderId: {
          type: 'number',
          description: 'ID của thư mục (tùy chọn)',
          example: 1,
          nullable: true,
        },
        ownerId: {
          type: 'number',
          description: 'ID người sở hữu (chỉ dành cho admin)',
          example: 1,
          nullable: true,
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Tệp được tải lên thành công' })
  @ApiResponse({ status: 401, description: 'Không được phép (Unauthorized)' })
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => Math.round(Math.random() * 16).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  uploadFile(@Request() req, @UploadedFile() file: Express.Multer.File, @Body('folderId') folderId?: number, @Body('ownerId') ownerId?: number) {
    return this.filesService.uploadFile(req.user.id, req.user.role, file, folderId, ownerId);
  }

  @Get('download/:id')
  @Roles('user', 'admin')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Tải xuống tệp theo ID' })
  @ApiResponse({ status: 200, description: 'Tệp được tải xuống thành công' })
  @ApiResponse({ status: 404, description: 'Tệp không tìm thấy' })
  async downloadFile(@Request() req, @Param('id') id: number, @Response() res: ExpressResponse) {
    const file = await this.filesService.findFileById(req.user.id, req.user.role, id);
    return res.sendFile(file.path, { root: '.' });
  }

  @Delete('files/:id')
  @Roles('user', 'admin')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Xóa tệp' })
  @ApiResponse({ status: 200, description: 'Tệp được xóa thành công' })
  @ApiResponse({ status: 404, description: 'Tệp không tìm thấy' })
  deleteFile(@Request() req, @Param('id') id: number) {
    return this.filesService.deleteFile(req.user.id, req.user.role, id);
  }
}