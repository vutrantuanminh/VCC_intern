import { Response as ExpressResponse } from 'express';
import { FilesService } from './files.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { FolderOperationDto } from './dto/folder-operation.dto';
import { FileOperationDto } from './dto/file-operation.dto';
import { UploadFileDto } from './dto/upload-file.dto';
import { FileResponseDto } from './dto/file-response.dto';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
export declare class FilesController {
    private filesService;
    private fileRepository;
    constructor(filesService: FilesService, fileRepository: Repository<File>);
    createFolder(req: any, createFolderDto: CreateFolderDto): Promise<import("./entities/folder.entity").Folder>;
    getFolders(req: any, operationDto: FolderOperationDto): Promise<import("./entities/folder.entity").Folder[]>;
    getFolderById(req: any, operationDto: FolderOperationDto): Promise<import("./entities/folder.entity").Folder>;
    updateFolder(req: any, operationDto: FolderOperationDto, updateFolderDto: UpdateFolderDto): Promise<import("./entities/folder.entity").Folder>;
    deleteFolder(req: any, operationDto: FolderOperationDto): Promise<void>;
    uploadFile(req: any, file: Express.Multer.File, uploadFileDto: UploadFileDto): Promise<FileResponseDto>;
    listFiles(req: any, operationDto: FolderOperationDto): Promise<FileResponseDto[]>;
    downloadFile(req: any, operationDto: FileOperationDto, res: ExpressResponse): Promise<void>;
    deleteFile(req: any, operationDto: FileOperationDto): Promise<void>;
}
