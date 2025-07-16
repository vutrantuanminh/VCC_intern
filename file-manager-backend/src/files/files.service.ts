// src/files/files.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Equal } from 'typeorm';
import { File } from './entities/file.entity';
import { Folder } from './entities/folder.entity';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    @InjectRepository(Folder)
    private folderRepository: Repository<Folder>,
    private usersService: UsersService,
  ) {}

  async createFolder(userId: number, createFolderDto: CreateFolderDto): Promise<Folder> {
    const { name, parentId } = createFolderDto;
    const user = await this.usersService.findOneById(userId);
    if (!user) throw new NotFoundException('User not found');

    const folder = this.folderRepository.create({ name, owner: user });
    if (parentId) {
      const parent = await this.folderRepository.findOne({
        where: { id: Equal(parentId), owner: { id: Equal(userId) } },
      });
      if (!parent) throw new NotFoundException('Parent folder not found or not owned');
      folder.parent = parent;
    }
    return this.folderRepository.save(folder);
  }

  async findFolders(userId: number, parentId?: number): Promise<Folder[]> {
    return this.folderRepository.find({
      where: {
        owner: { id: Equal(userId) },
        parent: parentId ? { id: Equal(parentId) } : Equal(null),
      },
      relations: ['children', 'files'],
    });
  }

  async findFolderById(userId: number, folderId: number): Promise<Folder> {
    const folder = await this.folderRepository.findOne({
      where: { id: Equal(folderId), owner: { id: Equal(userId) } },
      relations: ['children', 'files'],
    });
    if (!folder) throw new NotFoundException('Folder not found or not owned');
    return folder;
  }

  async updateFolder(userId: number, folderId: number, updateFolderDto: UpdateFolderDto): Promise<Folder> {
    const folder = await this.findFolderById(userId, folderId);
    if (updateFolderDto.name) folder.name = updateFolderDto.name;
    if (updateFolderDto.parentId) {
      const parent = await this.folderRepository.findOne({
        where: { id: Equal(updateFolderDto.parentId), owner: { id: Equal(userId) } },
      });
      if (!parent) throw new NotFoundException('Parent folder not found or not owned');
      folder.parent = parent;
    } else if (updateFolderDto.parentId === null) {
      folder.parent = null;
    }
    return this.folderRepository.save(folder);
  }

  async deleteFolder(userId: number, folderId: number): Promise<void> {
    const folder = await this.findFolderById(userId, folderId);
    await this.folderRepository.remove(folder);
  }

  async uploadFile(userId: number, file: Express.Multer.File, folderId?: number): Promise<File> {
    const user = await this.usersService.findOneById(userId);
    if (!user) throw new NotFoundException('User not found');

    const fileEntity = this.fileRepository.create({
      name: file.originalname,
      path: file.path,
      mimeType: file.mimetype,
      size: file.size,
      owner: user,
    });

    if (folderId) {
      const folder = await this.folderRepository.findOne({
        where: { id: Equal(folderId), owner: { id: Equal(userId) } },
      });
      if (!folder) throw new NotFoundException('Folder not found or not owned');
      fileEntity.folder = folder;
    }

    return this.fileRepository.save(fileEntity);
  }

  async findFileById(userId: number, fileId: number): Promise<File> {
    const file = await this.fileRepository.findOne({
      where: { id: Equal(fileId), owner: { id: Equal(userId) } },
      relations: ['folder'],
    });
    if (!file) throw new NotFoundException('File not found or not owned');
    return file;
  }

  async deleteFile(userId: number, fileId: number): Promise<void> {
    const file = await this.findFileById(userId, fileId);
    await this.fileRepository.remove(file);
  }
}