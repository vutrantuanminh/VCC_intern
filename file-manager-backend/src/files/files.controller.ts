import { Controller, Post, Body, Get, Param, Patch, Delete, UseGuards, Request, UseInterceptors, UploadedFile, Query, Response } from '@nestjs/common';
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

@Controller('files')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Post('folders')
  @Roles('user', 'admin')
  createFolder(@Request() req, @Body() createFolderDto: CreateFolderDto) {
    return this.filesService.createFolder(req.user.id, createFolderDto);
  }

  @Get('folders')
  @Roles('user', 'admin')
  getFolders(@Request() req, @Query('parentId') parentId?: number) {
    return this.filesService.findFolders(req.user.id, parentId);
  }

  @Get('folders/:id')
  @Roles('user', 'admin')
  getFolderById(@Request() req, @Param('id') id: number) {
    return this.filesService.findFolderById(req.user.id, id);
  }

  @Patch('folders/:id')
  @Roles('user', 'admin')
  updateFolder(@Request() req, @Param('id') id: number, @Body() updateFolderDto: UpdateFolderDto) {
    return this.filesService.updateFolder(req.user.id, id, updateFolderDto);
  }

  @Delete('folders/:id')
  @Roles('user', 'admin')
  deleteFolder(@Request() req, @Param('id') id: number) {
    return this.filesService.deleteFolder(req.user.id, id);
  }

  @Post('upload')
  @Roles('user', 'admin')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => Math.round(Math.random() * 16).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  uploadFile(@Request() req, @UploadedFile() file: Express.Multer.File, @Body('folderId') folderId?: number) {
    return this.filesService.uploadFile(req.user.id, file, folderId);
  }

  @Get('download/:id')
  @Roles('user', 'admin')
  async downloadFile(@Request() req, @Param('id') id: number, @Response() res: ExpressResponse) {
    const file = await this.filesService.findFileById(req.user.id, id);
    return res.sendFile(file.path, { root: '.' });
  }

  @Delete('files/:id')
  @Roles('user', 'admin')
  deleteFile(@Request() req, @Param('id') id: number) {
    return this.filesService.deleteFile(req.user.id, id);
  }
}