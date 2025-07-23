import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
import { Folder } from './entities/folder.entity';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { UsersService } from '../users/users.service';
export declare class FilesService {
    private fileRepository;
    private folderRepository;
    private usersService;
    constructor(fileRepository: Repository<File>, folderRepository: Repository<Folder>, usersService: UsersService);
    createFolder(userId: number, role: string, createFolderDto: CreateFolderDto, ownerId?: number): Promise<Folder>;
    listFolders(userId: number, role: string, parentId?: number): Promise<Folder[]>;
    findFolderById(userId: number, role: string, folderId: number): Promise<Folder>;
    updateFolder(userId: number, role: string, folderId: number, updateFolderDto: UpdateFolderDto): Promise<Folder>;
    deleteFolder(userId: number, role: string, folderId: number): Promise<void>;
    uploadFile(userId: number, role: string, file: Express.Multer.File, folderId?: number, ownerId?: number): Promise<File>;
    findFileById(userId: number, role: string, fileId: number): Promise<File>;
    deleteFile(userId: number, role: string, fileId: number): Promise<void>;
}
