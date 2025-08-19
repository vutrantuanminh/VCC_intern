import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Equal, IsNull } from 'typeorm';
import { File } from './entities/file.entity';
import { Folder } from './entities/folder.entity';
import { Category } from '../categories/entities/category.entity';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { FolderOperationDto } from './dto/folder-operation.dto';
import { FileOperationDto } from './dto/file-operation.dto';
import { UploadFileDto } from './dto/upload-file.dto';
import { FileResponseDto } from './dto/file-response.dto';
import { UserContextDto } from '../users/dto/user-context.dto';
import { UsersService } from '../users/users.service';
import { existsSync, mkdirSync } from 'fs';
import { join, extname } from 'path';
import { EXTENSION_CONFIG } from '../config/extension.config';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    @InjectRepository(Folder)
    private folderRepository: Repository<Folder>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private usersService: UsersService,
  ) {}

  public async checkAccess(
    userContext: UserContextDto,
    resourceOwnerId: number,
    resourceType: 'folder' | 'file',
  ): Promise<void> {
    const { userId, role } = userContext;

    if (role === 'admin') {
      return;
    }

    if (resourceOwnerId !== userId) {
      throw new BadRequestException(`Bạn không có quyền truy cập ${resourceType === 'folder' ? 'thư mục' : 'tệp'} này`);
    }
  }

  private async buildExternalPath(file: File, folder: Folder | null): Promise<string> {
    const parts: string[] = [file.name];

    let currentFolder = folder;
    while (currentFolder) {
      parts.unshift(currentFolder.name);
      const parentId = currentFolder.parent?.id;
      if (!parentId) {
        break;
      }
      currentFolder = await this.folderRepository.findOne({
        where: { id: Equal(parentId) },
        relations: ['parent'],
      });
    }

    parts.unshift('Home');

    return `/${parts.join('/')}`;
  }

  async createFolder(userContext: UserContextDto, createFolderDto: CreateFolderDto): Promise<Folder> {
    const { userId, role } = userContext;
    const { name, parentId, ownerId } = createFolderDto;

    let targetOwnerId = userId;
    if (role === 'admin' && ownerId) {
      const targetUser = await this.usersService.findOneById(ownerId);
      if (!targetUser) throw new NotFoundException('Người dùng được chỉ định không tồn tại');
      targetOwnerId = ownerId;
    }

    const user = await this.usersService.findOneById(targetOwnerId);
    if (!user) throw new NotFoundException('Người dùng không tồn tại');

    const folder = this.folderRepository.create({
      name,
      owner: {
        id: user.id,
        email: user.email,
        username: user.username,
        gender: user.gender,
        phone_number: user.phone_number,
      },
    });

    if (parentId) {
      const parent = await this.folderRepository.findOne({
        where: { id: Equal(parentId) },
        relations: ['owner'],
      });
      if (!parent) throw new NotFoundException('Thư mục cha không tồn tại');
      await this.checkAccess(userContext, parent.owner.id, 'folder');
      if (parent.owner.id !== targetOwnerId) {
        throw new BadRequestException('Thư mục cha phải thuộc về cùng người sở hữu với thư mục');
      }
      folder.parent = parent;
    }

    return this.folderRepository.save(folder);
  }

  async listFolders(userContext: UserContextDto, operationDto: FolderOperationDto): Promise<Folder[]> {
    const { userId, role } = userContext;
    const { folderId } = operationDto;

    let queryOptions: any = {};

    if (folderId) {
      const folder = await this.folderRepository.findOne({
        where: { id: Equal(folderId) },
        relations: ['owner'],
      });
      if (!folder) throw new NotFoundException('Thư mục không tồn tại');
      await this.checkAccess(userContext, folder.owner.id, 'folder');
      queryOptions = { where: { parent: { id: Equal(folderId) } } };
    } else {
      queryOptions = {
        where: {
          parent: IsNull(),
          ...(role !== 'admin' ? { owner: { id: Equal(userId) } } : {}),
        },
      };
    }

    return this.folderRepository.find({
      ...queryOptions,
      relations: ['owner'],
      select: {
        id: true,
        name: true,
        owner: { id: true, username: true },
      },
    });
  }

  async findFolderById(userContext: UserContextDto, operationDto: FolderOperationDto): Promise<Folder> {
    const { folderId } = operationDto;
    if (!folderId) throw new BadRequestException('folderId là bắt buộc');

    const folder = await this.folderRepository.findOne({
      where: { id: Equal(folderId) },
      relations: ['owner'],
    });
    if (!folder) throw new NotFoundException('Thư mục không tồn tại');
    await this.checkAccess(userContext, folder.owner.id, 'folder');

    return folder;
  }

  async updateFolder(userContext: UserContextDto, operationDto: FolderOperationDto, updateFolderDto: UpdateFolderDto): Promise<Folder> {
    const { folderId } = operationDto;
    const { name, parentId } = updateFolderDto;

    const folder = await this.findFolderById(userContext, { folderId });
    if (name) folder.name = name;

    if (parentId) {
      const parent = await this.folderRepository.findOne({
        where: { id: Equal(parentId) },
        relations: ['owner'],
      });
      if (!parent) throw new NotFoundException('Thư mục cha không tồn tại');
      await this.checkAccess(userContext, parent.owner.id, 'folder');
      if (parent.owner.id !== folder.owner.id) {
        throw new BadRequestException('Thư mục cha phải thuộc về cùng người sở hữu');
      }
      folder.parent = parent;
    }

    return this.folderRepository.save(folder);
  }

  async deleteFolder(userContext: UserContextDto, operationDto: FolderOperationDto): Promise<void> {
    const { folderId } = operationDto;
    if (!folderId) throw new BadRequestException('folderId là bắt buộc');

    const folder = await this.findFolderById(userContext, { folderId });
    await this.folderRepository.remove(folder);
  }

  async uploadFile(userContext: UserContextDto, file: Express.Multer.File, uploadFileDto: UploadFileDto): Promise<FileResponseDto> {
    if (!file) {
      throw new BadRequestException('Không có tệp được tải lên');
    }

    const { folderId } = uploadFileDto;
    let folder: Folder | null = null;

    if (folderId) {
      folder = await this.folderRepository.findOne({
        where: { id: Equal(folderId) },
        relations: ['owner'],
      });
      if (!folder) throw new NotFoundException('Thư mục không tồn tại');
      await this.checkAccess(userContext, folder.owner.id, 'folder');
    }

    // Tự động gán category dựa trên extension
    const extension = extname(file.originalname).toLowerCase();
    const categoryName = EXTENSION_CONFIG[extension] || 'Others';
    const category = await this.categoryRepository.findOne({ where: { name: categoryName } });
    if (!category) {
      throw new BadRequestException(`Category "${categoryName}" không tồn tại`);
    }

    const newFile = this.fileRepository.create({
      name: file.originalname,
      path: file.path,
      externalPath: '',
      mimeType: file.mimetype,
      size: file.size,
      owner: { id: userContext.userId },
      folder: folder || undefined,
      category,
    });

    await this.fileRepository.save(newFile);

    newFile.externalPath = await this.buildExternalPath(newFile, folder);
    await this.fileRepository.save(newFile);

    return {
      id: newFile.id,
      name: newFile.name,
      externalPath: newFile.externalPath,
      mimeType: newFile.mimeType,
      size: newFile.size,
      owner: {
        id: newFile.owner.id,
        username: newFile.owner.username,
      },
      folder: folder ? { id: folder.id, name: folder.name } : undefined,
      category: {
        id: newFile.category.id,
        name: newFile.category.name,
      },
    };
  }

  async findFileById(userContext: UserContextDto, operationDto: FileOperationDto): Promise<FileResponseDto> {
    const { fileId } = operationDto;
    if (!fileId) throw new BadRequestException('fileId là bắt buộc');

    const file = await this.fileRepository.findOne({
      where: { id: Equal(fileId) },
      relations: ['folder', 'owner', 'category'],
      select: {
        id: true,
        name: true,
        externalPath: true,
        mimeType: true,
        size: true,
        owner: { id: true, username: true },
        folder: { id: true, name: true },
        category: { id: true, name: true },
      },
    });

    if (!file) throw new NotFoundException('Tệp không tồn tại');
    await this.checkAccess(userContext, file.owner.id, 'file');

    file.externalPath = await this.buildExternalPath(file, file.folder);
    await this.fileRepository.save(file);

    return {
      id: file.id,
      name: file.name,
      externalPath: file.externalPath,
      mimeType: file.mimeType,
      size: file.size,
      owner: {
        id: file.owner.id,
        username: file.owner.username,
      },
      folder: file.folder ? { id: file.folder.id, name: file.folder.name } : undefined,
      category: {
        id: file.category.id,
        name: file.category.name,
      },
    };
  }

  async listFiles(userContext: UserContextDto, operationDto: FolderOperationDto): Promise<FileResponseDto[]> {
    const { folderId } = operationDto;
    let queryOptions: any = {};

    if (folderId) {
      const folder = await this.folderRepository.findOne({
        where: { id: Equal(folderId) },
        relations: ['owner'],
      });
      if (!folder) throw new NotFoundException('Thư mục không tồn tại');
      await this.checkAccess(userContext, folder.owner.id, 'folder');
      queryOptions = { where: { folder: { id: Equal(folderId) } } };
    } else {
      queryOptions = {
        where: {
          folder: IsNull(),
          ...(userContext.role !== 'admin' ? { owner: { id: Equal(userContext.userId) } } : {}),
        },
      };
    }

    const files = await this.fileRepository.find({
      ...queryOptions,
      relations: ['owner', 'folder', 'category'],
      select: {
        id: true,
        name: true,
        externalPath: true,
        mimeType: true,
        size: true,
        owner: { id: true, username: true },
        folder: { id: true, name: true },
        category: { id: true, name: true },
      },
    });

    for (const file of files) {
      file.externalPath = await this.buildExternalPath(file, file.folder);
      await this.fileRepository.save(file);
    }

    return files.map(file => ({
      id: file.id,
      name: file.name,
      externalPath: file.externalPath,
      mimeType: file.mimeType,
      size: file.size,
      owner: {
        id: file.owner.id,
        username: file.owner.username,
      },
      folder: file.folder ? { id: file.folder.id, name: file.folder.name } : undefined,
      category: {
        id: file.category.id,
        name: file.category.name,
      },
    }));
  }

  async deleteFile(userContext: UserContextDto, operationDto: FileOperationDto): Promise<void> {
    const { fileId } = operationDto;
    if (!fileId) throw new BadRequestException('fileId là bắt buộc');

    const file = await this.fileRepository.findOne({
      where: { id: Equal(fileId) },
      relations: ['owner'],
    });
    if (!file) throw new NotFoundException('Tệp không tồn tại');
    await this.checkAccess(userContext, file.owner.id, 'file');
    if (existsSync(file.path)) {
      await import('fs/promises').then(fs => fs.unlink(file.path));
    }
    await this.fileRepository.remove(file);
  }
}