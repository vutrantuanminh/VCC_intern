import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
import { Folder } from './entities/folder.entity';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { UserContextDto } from '../users/dto/user-context.dto';
import { UsersService } from '../users/users.service';
export declare class FilesService {
    private fileRepository;
    private folderRepository;
    private usersService;
    constructor(fileRepository: Repository<File>, folderRepository: Repository<Folder>, usersService: UsersService);
    createFolder(userContext: UserContextDto, createFolderDto: CreateFolderDto, ownerId?: number): Promise<Folder>;
    listFolders(userContext: UserContextDto, parentId?: number): Promise<Folder[]>;
    findFolderById(userContext: UserContextDto, folderId: number): Promise<Folder>;
    updateFolder(userContext: UserContextDto, folderId: number, updateFolderDto: UpdateFolderDto): Promise<Folder>;
    deleteFolder(userContext: UserContextDto, folderId: number): Promise<void>;
    uploadFile(userContext: UserContextDto, file: Express.Multer.File, folderId?: number): Promise<File>;
    findFileById(userContext: UserContextDto, fileId: number): Promise<File>;
    listFiles(userContext: UserContextDto, folderId?: number): Promise<File[]>;
    deleteFile(userContext: UserContextDto, fileId: number): Promise<void>;
}
