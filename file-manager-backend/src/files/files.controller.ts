import { Controller, Post, Body, Get, Param, Patch, Delete, UseGuards, Request, UseInterceptors, UploadedFile, Query, Response, UsePipes, ValidationPipe, NotFoundException, BadRequestException } from '@nestjs/common';
import { Response as ExpressResponse } from 'express';
import { FilesService } from './files.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { FolderOperationDto } from './dto/folder-operation.dto';
import { FileOperationDto } from './dto/file-operation.dto';
import { UploadFileDto } from './dto/upload-file.dto';
import { FileResponseDto } from './dto/file-response.dto';
import { UserContextDto } from '../users/dto/user-context.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import { existsSync, mkdirSync, renameSync } from 'fs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Equal } from 'typeorm';
import { File } from './entities/file.entity';

@ApiTags('Files')
@Controller('files')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FilesController {
  constructor(
    private filesService: FilesService,
    @InjectRepository(File)
    private fileRepository: Repository<File>,
  ) {}

  @Post('folders')
  @Roles('user', 'admin')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Tạo thư mục mới' })
  @ApiResponse({ status: 201, description: 'Thư mục được tạo thành công' })
  @ApiResponse({ status: 401, description: 'Không được phép (Unauthorized)' })
  @ApiBody({ type: CreateFolderDto })
  createFolder(@Request() req, @Body() createFolderDto: CreateFolderDto) {
    const userContext: UserContextDto = {
      userId: req.user.id,
      role: req.user.role,
    };
    return this.filesService.createFolder(userContext, createFolderDto);
  }

  @Get('folders')
  @Roles('user', 'admin')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Lấy danh sách thư mục' })
  @ApiResponse({ status: 200, description: 'Danh sách thư mục' })
  @ApiResponse({ status: 401, description: 'Không được phép (Unauthorized)' })
  @ApiQuery({
    name: 'folderId',
    type: Number,
    description: 'ID của thư mục cha (tùy chọn)',
    required: false,
    example: 1,
  })
  getFolders(@Request() req, @Query() operationDto: FolderOperationDto) {
    const userContext: UserContextDto = {
      userId: req.user.id,
      role: req.user.role,
    };
    return this.filesService.listFolders(userContext, operationDto);
  }

  @Get('folders/:folderId')
  @Roles('user', 'admin')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Lấy thông tin thư mục theo ID' })
  @ApiResponse({ status: 200, description: 'Thông tin thư mục' })
  @ApiResponse({ status: 404, description: 'Thư mục không tìm thấy' })
  getFolderById(@Request() req, @Param() operationDto: FolderOperationDto) {
    const userContext: UserContextDto = {
      userId: req.user.id,
      role: req.user.role,
    };
    return this.filesService.findFolderById(userContext, operationDto);
  }

  @Patch('folders/:folderId')
  @Roles('user', 'admin')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Cập nhật thông tin thư mục' })
  @ApiResponse({ status: 200, description: 'Thư mục được cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Thư mục không tìm thấy' })
  updateFolder(@Request() req, @Param() operationDto: FolderOperationDto, @Body() updateFolderDto: UpdateFolderDto) {
    const userContext: UserContextDto = {
      userId: req.user.id,
      role: req.user.role,
    };
    return this.filesService.updateFolder(userContext, operationDto, updateFolderDto);
  }

  @Delete('folders/:folderId')
  @Roles('user', 'admin')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Xóa thư mục' })
  @ApiResponse({ status: 200, description: 'Thư mục được xóa thành công' })
  @ApiResponse({ status: 404, description: 'Thư mục không tìm thấy' })
  deleteFolder(@Request() req, @Param() operationDto: FolderOperationDto) {
    const userContext: UserContextDto = {
      userId: req.user.id,
      role: req.user.role,
    };
    return this.filesService.deleteFolder(userContext, operationDto);
  }

  @Post('upload')
  @Roles('user', 'admin')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Tải lên tệp' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Tệp và thông tin liên quan',
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
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Tệp được tải lên thành công',
    type: FileResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Không được phép (Unauthorized)' })
  @ApiResponse({ status: 400, description: 'Yêu cầu không hợp lệ' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const userId = (req.user as any)?.id;
          const uploadPath = join('./uploads', `user_${userId}`, 'temp');
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadFile(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadFileDto: UploadFileDto,
  ): Promise<FileResponseDto> {
    const userContext: UserContextDto = {
      userId: req.user.id,
      role: req.user.role,
    };

    if (!file) {
      throw new BadRequestException('Không có tệp được tải lên');
    }

    const folderId = uploadFileDto.folderId ? Number(uploadFileDto.folderId) : null;
    let targetUserId = userContext.userId;

    if (folderId) {
      if (isNaN(folderId)) {
        throw new BadRequestException('folderId phải là một số hợp lệ');
      }
      const folder = await this.filesService.findFolderById(userContext, { folderId });
      if (!folder) {
        throw new NotFoundException('Thư mục không tồn tại');
      }
      targetUserId = folder.owner.id;
    }

    const finalPath = join('./uploads', `user_${targetUserId}`);
    if (!existsSync(finalPath)) {
      mkdirSync(finalPath, { recursive: true });
    }
    const newFilePath = join(finalPath, file.filename);
    renameSync(file.path, newFilePath);

    file.path = newFilePath;

    return this.filesService.uploadFile(userContext, file, uploadFileDto);
  }

  @Get('files')
  @Roles('user', 'admin')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Liệt kê tệp theo thư mục' })
  @ApiQuery({
    name: 'folderId',
    type: Number,
    description: 'ID của thư mục (tùy chọn)',
    required: false,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách tệp được trả về thành công',
    type: [FileResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Không được phép (Unauthorized)' })
  @ApiResponse({ status: 404, description: 'Thư mục không tồn tại' })
  listFiles(@Request() req, @Query() operationDto: FolderOperationDto): Promise<FileResponseDto[]> {
    const userContext: UserContextDto = {
      userId: req.user.id,
      role: req.user.role,
    };
    return this.filesService.listFiles(userContext, operationDto);
  }

  @Get('download/:fileId')
  @Roles('user', 'admin')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Tải xuống tệp theo ID' })
  @ApiResponse({ status: 200, description: 'Tệp được tải xuống thành công' })
  @ApiResponse({ status: 404, description: 'Tệp không tìm thấy' })
  @ApiResponse({ status: 400, description: 'fileId là bắt buộc' })
  async downloadFile(@Request() req, @Param() operationDto: FileOperationDto, @Response() res: ExpressResponse) {
    const userContext: UserContextDto = {
      userId: req.user.id,
      role: req.user.role,
    };

    const { fileId } = operationDto;
    if (!fileId) {
      throw new BadRequestException('fileId là bắt buộc');
    }

    const file = await this.fileRepository.findOne({
      where: { id: Equal(fileId) },
      relations: ['owner'],
    });

    if (!file) {
      throw new NotFoundException('Tệp không tồn tại');
    }

    await this.filesService.checkAccess(userContext, file.owner.id, 'file');

    if (!existsSync(file.path)) {
      throw new NotFoundException('Tệp không tồn tại trên hệ thống');
    }

    return res.sendFile(file.path, { root: '.' });
  }

  @Delete('files/:fileId')
  @Roles('user', 'admin')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Xóa tệp' })
  @ApiResponse({ status: 200, description: 'Tệp được xóa thành công' })
  @ApiResponse({ status: 404, description: 'Tệp không tìm thấy' })
  deleteFile(@Request() req, @Param() operationDto: FileOperationDto) {
    const userContext: UserContextDto = {
      userId: req.user.id,
      role: req.user.role,
    };
    return this.filesService.deleteFile(userContext, operationDto);
  }
}