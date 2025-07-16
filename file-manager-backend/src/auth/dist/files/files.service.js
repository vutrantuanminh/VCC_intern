"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const file_entity_1 = require("./entities/file.entity");
const folder_entity_1 = require("./entities/folder.entity");
const users_service_1 = require("../users/users.service");
let FilesService = class FilesService {
    fileRepository;
    folderRepository;
    usersService;
    constructor(fileRepository, folderRepository, usersService) {
        this.fileRepository = fileRepository;
        this.folderRepository = folderRepository;
        this.usersService = usersService;
    }
    async createFolder(userId, createFolderDto) {
        const { name, parentId } = createFolderDto;
        const user = await this.usersService.findOneById(userId);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const folder = this.folderRepository.create({ name, owner: user });
        if (parentId) {
            const parent = await this.folderRepository.findOne({
                where: { id: (0, typeorm_2.Equal)(parentId), owner: { id: (0, typeorm_2.Equal)(userId) } },
            });
            if (!parent)
                throw new common_1.NotFoundException('Parent folder not found or not owned');
            folder.parent = parent;
        }
        return this.folderRepository.save(folder);
    }
    async findFolders(userId, parentId) {
        return this.folderRepository.find({
            where: {
                owner: { id: (0, typeorm_2.Equal)(userId) },
                parent: parentId ? { id: (0, typeorm_2.Equal)(parentId) } : (0, typeorm_2.Equal)(null),
            },
            relations: ['children', 'files'],
        });
    }
    async findFolderById(userId, folderId) {
        const folder = await this.folderRepository.findOne({
            where: { id: (0, typeorm_2.Equal)(folderId), owner: { id: (0, typeorm_2.Equal)(userId) } },
            relations: ['children', 'files'],
        });
        if (!folder)
            throw new common_1.NotFoundException('Folder not found or not owned');
        return folder;
    }
    async updateFolder(userId, folderId, updateFolderDto) {
        const folder = await this.findFolderById(userId, folderId);
        if (updateFolderDto.name)
            folder.name = updateFolderDto.name;
        if (updateFolderDto.parentId) {
            const parent = await this.folderRepository.findOne({
                where: { id: (0, typeorm_2.Equal)(updateFolderDto.parentId), owner: { id: (0, typeorm_2.Equal)(userId) } },
            });
            if (!parent)
                throw new common_1.NotFoundException('Parent folder not found or not owned');
            folder.parent = parent;
        }
        else if (updateFolderDto.parentId === null) {
            folder.parent = null;
        }
        return this.folderRepository.save(folder);
    }
    async deleteFolder(userId, folderId) {
        const folder = await this.findFolderById(userId, folderId);
        await this.folderRepository.remove(folder);
    }
    async uploadFile(userId, file, folderId) {
        const user = await this.usersService.findOneById(userId);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const fileEntity = this.fileRepository.create({
            name: file.originalname,
            path: file.path,
            mimeType: file.mimetype,
            size: file.size,
            owner: user,
        });
        if (folderId) {
            const folder = await this.folderRepository.findOne({
                where: { id: (0, typeorm_2.Equal)(folderId), owner: { id: (0, typeorm_2.Equal)(userId) } },
            });
            if (!folder)
                throw new common_1.NotFoundException('Folder not found or not owned');
            fileEntity.folder = folder;
        }
        return this.fileRepository.save(fileEntity);
    }
    async findFileById(userId, fileId) {
        const file = await this.fileRepository.findOne({
            where: { id: (0, typeorm_2.Equal)(fileId), owner: { id: (0, typeorm_2.Equal)(userId) } },
            relations: ['folder'],
        });
        if (!file)
            throw new common_1.NotFoundException('File not found or not owned');
        return file;
    }
    async deleteFile(userId, fileId) {
        const file = await this.findFileById(userId, fileId);
        await this.fileRepository.remove(file);
    }
};
exports.FilesService = FilesService;
exports.FilesService = FilesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(file_entity_1.File)),
    __param(1, (0, typeorm_1.InjectRepository)(folder_entity_1.Folder)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        users_service_1.UsersService])
], FilesService);
//# sourceMappingURL=files.service.js.map