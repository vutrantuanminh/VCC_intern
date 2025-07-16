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
    createFolder(userId: number, createFolderDto: CreateFolderDto): Promise<Folder>;
    findFolders(userId: number, parentId?: number): Promise<Folder[]>;
    findFolderById(userId: number, folderId: number): Promise<Folder>;
    updateFolder(userId: number, folderId: number, updateFolderDto: UpdateFolderDto): Promise<Folder>;
    deleteFolder(userId: number, folderId: number): Promise<void>;
    uploadFile(userId: number, file: Express.Multer.File, folderId?: number): Promise<File>;
    findFileById(userId: number, fileId: number): Promise<File>;
    deleteFile(userId: number, fileId: number): Promise<void>;
}
