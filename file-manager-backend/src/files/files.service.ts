import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Equal, IsNull } from 'typeorm';
import { File } from './entities/file.entity';
import { Folder } from './entities/folder.entity';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { UserContextDto } from '../users/dto/user-context.dto';
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

  async createFolder(userContext: UserContextDto, createFolderDto: CreateFolderDto, ownerId?: number): Promise<Folder> {
    const { userId, role } = userContext;
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
          relations: ['owner'],
          select: {
            id: true,
            name: true,  
            owner: { id: true, username: true }, 
          },
        });
        if (parent && parent.owner.id !== user.id) {
          throw new BadRequestException('Thư mục cha phải thuộc về cùng người sở hữu với thư mục');
        }
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

  async listFolders(userContext: UserContextDto, parentId?: number): Promise<Folder[]> {
    const { userId, role } = userContext;
    let whereCondition;
    if (role === 'admin') {
      whereCondition = { parent: parentId ? { id: Equal(parentId) } : IsNull() };
    } else {
      whereCondition = { owner: { id: Equal(userId) }, parent: parentId ? { id: Equal(parentId) } : IsNull() };
    }
    return this.folderRepository.find({
      where: whereCondition,
    });
  }

  async findFolderById(userContext: UserContextDto, folderId: number): Promise<Folder> {
    const { userId, role } = userContext;
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

  async updateFolder(userContext: UserContextDto, folderId: number, updateFolderDto: UpdateFolderDto): Promise<Folder> {
    const { userId, role } = userContext;
    const folder = await this.findFolderById(userContext, folderId);
    if (!folder.owner) throw new BadRequestException('Thư mục phải có người sở hữu');

    let newOwner = folder.owner;

    if (role === 'admin' && updateFolderDto.ownerId) {
      const user = await this.usersService.findOneById(updateFolderDto.ownerId);
      if (!user) throw new NotFoundException('Người dùng mới không tồn tại');
      newOwner = user;
    }

    if (updateFolderDto.name) folder.name = updateFolderDto.name;

    if (updateFolderDto.parentId) {
      let parent;
      if (role === 'admin') {
        parent = await this.folderRepository.findOne({
          where: { id: Equal(updateFolderDto.parentId) },
          relations: ['owner'],
          select: {
            id: true,
            name: true,  
            owner: { id: true, username: true }, 
          },
        });
        if (parent && parent.owner.id !== newOwner.id) {
          throw new BadRequestException('Thư mục cha phải thuộc về cùng người sở hữu với thư mục');
        }
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

    if (role === 'admin' && updateFolderDto.ownerId) {
      if (folder.parent && folder.parent.owner.id !== newOwner.id) {
        throw new BadRequestException('Người sở hữu mới phải khớp với người sở hữu của thư mục cha');
      }
      folder.owner = newOwner;
    }

    return this.folderRepository.save(folder);
  }

  async deleteFolder(userContext: UserContextDto, folderId: number): Promise<void> {
    const folder = await this.findFolderById(userContext, folderId);
    await this.folderRepository.remove(folder);
  }

  async uploadFile(userContext: UserContextDto, file: Express.Multer.File, folderId?: number): Promise<File> {
    const { userId, role } = userContext;
    let targetUserId = userId;
    let folder;

    if (folderId) {
      folder = await this.folderRepository.findOne({
        where: { id: Equal(folderId) },
        relations: ['owner'],
        select: {
          id: true,
          name: true,
          owner: { id: true, username: true, email: true, gender: true, phone_number: true },
        },
      });
      if (!folder) throw new NotFoundException('Thư mục không tồn tại');

      if (role === 'admin') {
        targetUserId = folder.owner.id;
      } else {
        if (folder.owner.id !== userId) {
          throw new BadRequestException('Thư mục phải thuộc về bạn');
        }
      }
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

    if (folder) {
      fileEntity.folder = folder;
    }

    return this.fileRepository.save(fileEntity);
  }

  async findFileById(userContext: UserContextDto, fileId: number): Promise<File> {
    const { userId, role } = userContext;
    let file;
    if (role === 'admin') {
      file = await this.fileRepository.findOne({
        where: { id: Equal(fileId) },
        relations: ['folder'],
        select: {
          id: true,
          name: true,  
          owner: { id: true, username: true }, 
        },
      });
    } else {
      file = await this.fileRepository.findOne({
        where: { id: Equal(fileId), owner: { id: Equal(userId) } },
        relations: ['folder'],
        select: {
          id: true,
          name: true,  
          owner: { id: true, username: true }, 
        },
      });
    }
    if (!file) throw new NotFoundException('Tệp không tồn tại hoặc không sở hữu');
    return file;
  }

  async listFiles(userContext: UserContextDto, folderId?: number): Promise<File[]> {
    const { userId, role } = userContext;
    let queryOptions: any = {};

    if (folderId) {
      const folder = await this.folderRepository.findOne({
        where: { id: Equal(folderId) },
        relations: ['owner'],
        select: { id: true, owner: { id: true } },
      });
      if (!folder) throw new NotFoundException('Thư mục không tồn tại');

      if (role !== 'admin' && folder.owner.id !== userId) {
        throw new BadRequestException('Bạn không sở hữu thư mục này');
      }
      queryOptions = { where: { folder: { id: Equal(folderId) } } };
    } else {
      queryOptions = {
        where: {
          folder: IsNull(),
          ...(role !== 'admin' ? { owner: { id: Equal(userId) } } : {}),
        },
      };
    }

    const files = await this.fileRepository.find({
      ...queryOptions,
      relations: ['owner', 'folder'],
      select: {
        id: true,
        name: true,
        path: true,
        mimeType: true,
        size: true,
        owner: { id: true, username: true, email: true },
        folder: { id: true, name: true },
      },
    });

    return files;
  }

  async deleteFile(userContext: UserContextDto, fileId: number): Promise<void> {
    const file = await this.findFileById(userContext, fileId);
    await this.fileRepository.remove(file);
  }
}