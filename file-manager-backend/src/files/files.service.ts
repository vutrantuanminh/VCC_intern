import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Equal, IsNull } from 'typeorm';
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

  async createFolder(userId: number, role: string, createFolderDto: CreateFolderDto, ownerId?: number): Promise<Folder> {
    const { name, parentId } = createFolderDto;
    let targetUserId;
    if (role === 'admin' && ownerId) {
      targetUserId = ownerId;
    } else {
      targetUserId = userId;
    }
    const user = await this.usersService.findOneById(targetUserId);
    if (!user) throw new NotFoundException('Người dùng không tồn tại');

    const folder = this.folderRepository.create({ 
      name, 
      owner: {
        id: user.id,
        email: user.email,
        username: user.username,
        gender: user.gender,
        phone_number: user.phone_number,
      }
    });

    if (parentId) {
      let parent;
      if (role === 'admin') {
        parent = await this.folderRepository.findOne({
          where: { id: Equal(parentId) },
        });
      } else {
        parent = await this.folderRepository.findOne({
          where: { id: Equal(parentId), owner: { id: Equal(userId) } },
        });
      }
      if (!parent) throw new NotFoundException('Thư mục cha không tồn tại hoặc không sở hữu');
      folder.parent = parent;
    }
    return this.folderRepository.save(folder);
  }

  async listFolders(userId: number, role: string, parentId?: number): Promise<Folder[]> {
    let whereCondition;
    if (role === 'admin') {
      whereCondition = { parent: parentId ? { id: Equal(parentId) } : IsNull() };
    } else {
      whereCondition = { owner: { id: Equal(userId) }, parent: parentId ? { id: Equal(parentId) } : IsNull() };
    }
    return this.folderRepository.find({
      where: whereCondition,
      relations: ['children', 'files', 'owner'],
    });
  }

  async findFolderById(userId: number, role: string, folderId: number): Promise<Folder> {
    let folder;
    if (role === 'admin') {
      folder = await this.folderRepository.findOne({
        where: { id: Equal(folderId) },
        relations: ['parent', 'owner'],
        select: {
          id: true,
          name: true, 
          parent: { id: true, name: true }, 
          owner: { id: true, username: true }, 
        },
      });
    } else {
      folder = await this.folderRepository.findOne({
        where: { id: Equal(folderId), owner: { id: Equal(userId) } },
        relations: ['parent', 'owner'],
        select: {
          id: true,
          name: true, 
          parent: { id: true, name: true }, 
          owner: { id: true, username: true }, 
        },
      });
    }
    if (!folder) throw new NotFoundException('Thư mục không tồn tại hoặc không sở hữu');
    return folder;
  }

  async updateFolder(userId: number, role: string, folderId: number, updateFolderDto: UpdateFolderDto): Promise<Folder> {
    const folder = await this.findFolderById(userId, role, folderId);
    if (updateFolderDto.name) folder.name = updateFolderDto.name;
    
    if (role === 'admin' && updateFolderDto.ownerId) {
      const newOwner = await this.usersService.findOneById(updateFolderDto.ownerId);
      if (!newOwner) throw new NotFoundException('Người dùng mới không tồn tại');
      folder.owner = newOwner;
      
      // Kiểm tra quyền sở hữu của thư mục cha nếu có
      if (updateFolderDto.parentId) {
        const parent = await this.folderRepository.findOne({
          where: { id: Equal(updateFolderDto.parentId) },
          relations: ['owner'],
        });
        if (!parent) throw new NotFoundException('Thư mục cha không tồn tại');
        if (parent.owner.id !== newOwner.id) {
          throw new BadRequestException('Thư mục cha phải thuộc về cùng người sở hữu mới của thư mục');
        }
        folder.parent = parent;
      } else if (updateFolderDto.parentId === null) {
        folder.parent = null;
      }
    } else if (updateFolderDto.parentId) {
      let parent;
      if (role === 'admin') {
        parent = await this.folderRepository.findOne({
          where: { id: Equal(updateFolderDto.parentId) },
        });
      } else {
        parent = await this.folderRepository.findOne({
          where: { id: Equal(updateFolderDto.parentId), owner: { id: Equal(userId) } },
        });
      }
      if (!parent) throw new NotFoundException('Thư mục cha không tồn tại hoặc không sở hữu');
      folder.parent = parent;
    } else if (updateFolderDto.parentId === null) {
      folder.parent = null;
    }

    return this.folderRepository.save(folder);
  }

  async deleteFolder(userId: number, role: string, folderId: number): Promise<void> {
    const folder = await this.findFolderById(userId, role, folderId);
    await this.folderRepository.remove(folder);
  }

  async uploadFile(userId: number, role: string, file: Express.Multer.File, folderId?: number, ownerId?: number): Promise<File> {
    let targetUserId;
    if (role === 'admin' && ownerId) {
      targetUserId = ownerId;
    } else {
      targetUserId = userId;
    }
    const user = await this.usersService.findOneById(targetUserId);
    if (!user) throw new NotFoundException('Người dùng không tồn tại');

    const fileEntity = this.fileRepository.create({
      name: file.originalname,
      path: file.path,
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

    if (folderId) {
      let folder;
      if (role === 'admin') {
        folder = await this.folderRepository.findOne({
          where: { id: Equal(folderId) },
        });
      } else {
        folder = await this.folderRepository.findOne({
          where: { id: Equal(folderId), owner: { id: Equal(userId) } },
        });
      }
      if (!folder) throw new NotFoundException('Thư mục không tồn tại hoặc không sở hữu');
      fileEntity.folder = folder;
    }

    return this.fileRepository.save(fileEntity);
  }

  async findFileById(userId: number, role: string, fileId: number): Promise<File> {
    let file;
    if (role === 'admin') {
      file = await this.fileRepository.findOne({
        where: { id: Equal(fileId) },
        relations: ['folder', 'owner'],
      });
    } else {
      file = await this.fileRepository.findOne({
        where: { id: Equal(fileId), owner: { id: Equal(userId) } },
        relations: ['folder', 'owner'],
      });
    }
    if (!file) throw new NotFoundException('Tệp không tồn tại hoặc không sở hữu');
    return file;
  }

  async deleteFile(userId: number, role: string, fileId: number): Promise<void> {
    const file = await this.findFileById(userId, role, fileId);
    await this.fileRepository.remove(file);
  }
}