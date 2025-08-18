import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Equal, IsNull } from 'typeorm';
import { File } from './entities/file.entity';
import { Folder } from './entities/folder.entity';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { FolderOperationDto } from './dto/folder-operation.dto';
import { FileOperationDto } from './dto/file-operation.dto';
import { UploadFileDto } from './dto/upload-file.dto';
import { FileResponseDto } from './dto/file-response.dto';
import { UserContextDto } from '../users/dto/user-context.dto';
import { UsersService } from '../users/users.service';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    @InjectRepository(Folder)
    private folderRepository: Repository<Folder>,
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

  // Xác định ID của owner dựa trên vai trò
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
    let whereCondition;

    if (role === 'admin') {
      whereCondition = { parent: folderId ? { id: Equal(folderId) } : IsNull() };
    } else {
      whereCondition = { owner: { id: Equal(userId) }, parent: folderId ? { id: Equal(folderId) } : IsNull() };
    }

    if (folderId) {
      const parent = await this.folderRepository.findOne({
        where: { id: Equal(folderId) },
        relations: ['owner'],
      });
      if (!parent) throw new NotFoundException('Thư mục cha không tồn tại');
      await this.checkAccess(userContext, parent.owner.id, 'folder');
    }

    return this.folderRepository.find({
      where: whereCondition,
      relations: ['owner'],
      select: {
        owner: { id: true, username: true },
      },
    });
  }

  async findFolderById(userContext: UserContextDto, operationDto: FolderOperationDto): Promise<Folder> {
    const { folderId } = operationDto;
    if (!folderId) throw new BadRequestException('folderId là bắt buộc');

    const folder = await this.folderRepository.findOne({
      where: { id: Equal(folderId) },
      relations: ['parent', 'owner'],
      select: {
        id: true,
        name: true,
        parent: { id: true, name: true },
        owner: { id: true, username: true },
      },
    });

    if (!folder) throw new NotFoundException('Thư mục không tồn tại');
    await this.checkAccess(userContext, folder.owner.id, 'folder');
    return folder;
  }

  async updateFolder(userContext: UserContextDto, operationDto: FolderOperationDto, updateFolderDto: UpdateFolderDto): Promise<Folder> {
    const { folderId } = operationDto;
    if (!folderId) throw new BadRequestException('folderId là bắt buộc');

    const folder = await this.folderRepository.findOne({
      where: { id: Equal(folderId) },
      relations: ['parent', 'owner'],
    });
    if (!folder) throw new NotFoundException('Thư mục không tồn tại');
    await this.checkAccess(userContext, folder.owner.id, 'folder');

    let newOwner = folder.owner;

    if (userContext.role === 'admin' && updateFolderDto.ownerId) {
      const user = await this.usersService.findOneById(updateFolderDto.ownerId);
      if (!user) throw new NotFoundException('Người dùng mới không tồn tại');
      newOwner = user;
    }

    if (updateFolderDto.name) folder.name = updateFolderDto.name;

    if (updateFolderDto.parentId) {
      const parent = await this.folderRepository.findOne({
        where: { id: Equal(updateFolderDto.parentId) },
        relations: ['owner'],
      });
      if (!parent) throw new NotFoundException('Thư mục cha không tồn tại');
      await this.checkAccess(userContext, parent.owner.id, 'folder');
      if (parent.owner.id !== newOwner.id) {
        throw new BadRequestException('Thư mục cha phải thuộc về cùng người sở hữu với thư mục');
      }
      folder.parent = parent;
    } else if (updateFolderDto.parentId === null) {
      folder.parent = null;
    }

    if (userContext.role === 'admin' && updateFolderDto.ownerId) {
      if (folder.parent && folder.parent.owner.id !== newOwner.id) {
        throw new BadRequestException('Người sở hữu mới phải khớp với người sở hữu của thư mục cha');
      }
      folder.owner = newOwner;
    }

    const updatedFolder = await this.folderRepository.save(folder);

    // Cập nhật externalPath cho tất cả file trong thư mục nếu thư mục thay đổi
    const files = await this.fileRepository.find({
      where: { folder: { id: Equal(folder.id) } },
      relations: ['folder'],
    });

    for (const file of files) {
      file.externalPath = await this.buildExternalPath(file, updatedFolder);
      await this.fileRepository.save(file);
    }

    return updatedFolder;
  }

  async deleteFolder(userContext: UserContextDto, operationDto: FolderOperationDto): Promise<void> {
    const { folderId } = operationDto;
    if (!folderId) throw new BadRequestException('folderId là bắt buộc');

    const folder = await this.folderRepository.findOne({
      where: { id: Equal(folderId) },
      relations: ['owner'],
    });
    if (!folder) throw new NotFoundException('Thư mục không tồn tại');
    await this.checkAccess(userContext, folder.owner.id, 'folder');
    await this.folderRepository.remove(folder);
  }

  async uploadFile(userContext: UserContextDto, file: Express.Multer.File, uploadFileDto: UploadFileDto): Promise<FileResponseDto> {
    const { userId } = userContext;
    const { folderId } = uploadFileDto;
    let targetUserId = userId;
    let folder;

    if (folderId) {
      folder = await this.folderRepository.findOne({
        where: { id: Equal(folderId) },
        relations: ['owner'],
      });
      if (!folder) throw new NotFoundException('Thư mục không tồn tại');
      await this.checkAccess(userContext, folder.owner.id, 'folder');
      targetUserId = folder.owner.id;
    }

    const user = await this.usersService.findOneById(targetUserId);
    if (!user) throw new NotFoundException('Người dùng không tồn tại');

    if (!existsSync(file.path)) {
      throw new BadRequestException('Tệp không được lưu trữ đúng cách trên hệ thống');
    }

    const fileEntity = this.fileRepository.create({
      name: file.originalname,
      path: file.path,
      externalPath: '', // Giá trị tạm thời, sẽ cập nhật sau
      mimeType: file.mimetype,
      size: file.size,
      owner: {
        id: user.id,
        email: user.email,
        username: user.username,
        gender: user.gender,
        phone_number: user.phone_number,
      },
    });

    if (folder) {
      fileEntity.folder = folder;
    }

    const savedFile = await this.fileRepository.save(fileEntity);

    // Cập nhật externalPath dựa trên cây thư mục
    savedFile.externalPath = await this.buildExternalPath(savedFile, folder);
    await this.fileRepository.save(savedFile);

    // Trả về FileResponseDto
    return {
      id: savedFile.id,
      name: savedFile.name,
      externalPath: savedFile.externalPath,
      mimeType: savedFile.mimeType,
      size: savedFile.size,
      owner: {
        id: savedFile.owner.id,
        username: savedFile.owner.username,
      },
      folder: savedFile.folder ? { id: savedFile.folder.id, name: savedFile.folder.name } : undefined,
    };
  }

  async findFileById(userContext: UserContextDto, operationDto: FileOperationDto): Promise<FileResponseDto> {
    const { fileId } = operationDto;
    if (!fileId) throw new BadRequestException('fileId là bắt buộc');

    const file = await this.fileRepository.findOne({
      where: { id: Equal(fileId) },
      relations: ['folder', 'owner'],
      select: {
        id: true,
        name: true,
        externalPath: true,
        mimeType: true,
        size: true,
        owner: { id: true, username: true },
        folder: { id: true, name: true },
      },
    });

    if (!file) throw new NotFoundException('Tệp không tồn tại');
    await this.checkAccess(userContext, file.owner.id, 'file');

    // Đảm bảo externalPath được cập nhật
    file.externalPath = await this.buildExternalPath(file, file.folder);
    await this.fileRepository.save(file);

    // Trả về FileResponseDto
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
      relations: ['owner', 'folder'],
      select: {
        id: true,
        name: true,
        externalPath: true,
        mimeType: true,
        size: true,
        owner: { id: true, username: true },
        folder: { id: true, name: true },
      },
    });

    // Cập nhật externalPath cho tất cả file
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