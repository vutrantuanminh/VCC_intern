import { Response as ExpressResponse } from 'express';
import { FilesService } from './files.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
export declare class FilesController {
    private filesService;
    constructor(filesService: FilesService);
    createFolder(req: any, createFolderDto: CreateFolderDto, ownerId?: number): Promise<import("./entities/folder.entity").Folder>;
    getFolders(req: any, parentId?: number): Promise<import("./entities/folder.entity").Folder[]>;
    getFolderById(req: any, id: number): Promise<import("./entities/folder.entity").Folder>;
    updateFolder(req: any, id: number, updateFolderDto: UpdateFolderDto): Promise<import("./entities/folder.entity").Folder>;
    deleteFolder(req: any, id: number): Promise<void>;
    uploadFile(req: any, file: Express.Multer.File, folderId?: number): Promise<import("./entities/file.entity").File>;
    listFiles(req: any, folderId?: number): Promise<import("./entities/file.entity").File[]>;
    downloadFile(req: any, id: number, res: ExpressResponse): Promise<void>;
    deleteFile(req: any, id: number): Promise<void>;
}
