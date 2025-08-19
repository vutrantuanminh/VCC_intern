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
const category_entity_1 = require("../categories/entities/category.entity");
const users_service_1 = require("../users/users.service");
const fs_1 = require("fs");
const path_1 = require("path");
const extension_config_1 = require("../config/extension.config");
let FilesService = class FilesService {
    fileRepository;
    folderRepository;
    categoryRepository;
    usersService;
    constructor(fileRepository, folderRepository, categoryRepository, usersService) {
        this.fileRepository = fileRepository;
        this.folderRepository = folderRepository;
        this.categoryRepository = categoryRepository;
        this.usersService = usersService;
    }
    async checkAccess(userContext, resourceOwnerId, resourceType) {
        const { userId, role } = userContext;
        if (role === 'admin') {
            return;
        }
        if (resourceOwnerId !== userId) {
            throw new common_1.BadRequestException(`Bạn không có quyền truy cập ${resourceType === 'folder' ? 'thư mục' : 'tệp'} này`);
        }
    }
    async buildExternalPath(file, folder) {
        const parts = [file.name];
        let currentFolder = folder;
        while (currentFolder) {
            parts.unshift(currentFolder.name);
            const parentId = currentFolder.parent?.id;
            if (!parentId) {
                break;
            }
            currentFolder = await this.folderRepository.findOne({
                where: { id: (0, typeorm_2.Equal)(parentId) },
                relations: ['parent'],
            });
        }
        parts.unshift('Home');
        return `/${parts.join('/')}`;
    }
    async createFolder(userContext, createFolderDto) {
        const { userId, role } = userContext;
        const { name, parentId, ownerId } = createFolderDto;
        let targetOwnerId = userId;
        if (role === 'admin' && ownerId) {
            const targetUser = await this.usersService.findOneById(ownerId);
            if (!targetUser)
                throw new common_1.NotFoundException('Người dùng được chỉ định không tồn tại');
            targetOwnerId = ownerId;
        }
        const user = await this.usersService.findOneById(targetOwnerId);
        if (!user)
            throw new common_1.NotFoundException('Người dùng không tồn tại');
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
                where: { id: (0, typeorm_2.Equal)(parentId) },
                relations: ['owner'],
            });
            if (!parent)
                throw new common_1.NotFoundException('Thư mục cha không tồn tại');
            await this.checkAccess(userContext, parent.owner.id, 'folder');
            if (parent.owner.id !== targetOwnerId) {
                throw new common_1.BadRequestException('Thư mục cha phải thuộc về cùng người sở hữu với thư mục');
            }
            folder.parent = parent;
        }
        return this.folderRepository.save(folder);
    }
    async listFolders(userContext, operationDto) {
        const { userId, role } = userContext;
        const { folderId } = operationDto;
        let queryOptions = {};
        if (folderId) {
            const folder = await this.folderRepository.findOne({
                where: { id: (0, typeorm_2.Equal)(folderId) },
                relations: ['owner'],
            });
            if (!folder)
                throw new common_1.NotFoundException('Thư mục không tồn tại');
            await this.checkAccess(userContext, folder.owner.id, 'folder');
            queryOptions = { where: { parent: { id: (0, typeorm_2.Equal)(folderId) } } };
        }
        else {
            queryOptions = {
                where: {
                    parent: (0, typeorm_2.IsNull)(),
                    ...(role !== 'admin' ? { owner: { id: (0, typeorm_2.Equal)(userId) } } : {}),
                },
            };
        }
        return this.folderRepository.find({
            ...queryOptions,
            relations: ['owner'],
            select: {
                id: true,
                name: true,
                owner: { id: true, username: true },
            },
        });
    }
    async findFolderById(userContext, operationDto) {
        const { folderId } = operationDto;
        if (!folderId)
            throw new common_1.BadRequestException('folderId là bắt buộc');
        const folder = await this.folderRepository.findOne({
            where: { id: (0, typeorm_2.Equal)(folderId) },
            relations: ['owner'],
        });
        if (!folder)
            throw new common_1.NotFoundException('Thư mục không tồn tại');
        await this.checkAccess(userContext, folder.owner.id, 'folder');
        return folder;
    }
    async updateFolder(userContext, operationDto, updateFolderDto) {
        const { folderId } = operationDto;
        const { name, parentId } = updateFolderDto;
        const folder = await this.findFolderById(userContext, { folderId });
        if (name)
            folder.name = name;
        if (parentId) {
            const parent = await this.folderRepository.findOne({
                where: { id: (0, typeorm_2.Equal)(parentId) },
                relations: ['owner'],
            });
            if (!parent)
                throw new common_1.NotFoundException('Thư mục cha không tồn tại');
            await this.checkAccess(userContext, parent.owner.id, 'folder');
            if (parent.owner.id !== folder.owner.id) {
                throw new common_1.BadRequestException('Thư mục cha phải thuộc về cùng người sở hữu');
            }
            folder.parent = parent;
        }
        return this.folderRepository.save(folder);
    }
    async deleteFolder(userContext, operationDto) {
        const { folderId } = operationDto;
        if (!folderId)
            throw new common_1.BadRequestException('folderId là bắt buộc');
        const folder = await this.findFolderById(userContext, { folderId });
        await this.folderRepository.remove(folder);
    }
    async uploadFile(userContext, file, uploadFileDto) {
        if (!file) {
            throw new common_1.BadRequestException('Không có tệp được tải lên');
        }
        const { folderId } = uploadFileDto;
        let folder = null;
        if (folderId) {
            folder = await this.folderRepository.findOne({
                where: { id: (0, typeorm_2.Equal)(folderId) },
                relations: ['owner'],
            });
            if (!folder)
                throw new common_1.NotFoundException('Thư mục không tồn tại');
            await this.checkAccess(userContext, folder.owner.id, 'folder');
        }
        const extension = (0, path_1.extname)(file.originalname).toLowerCase();
        const categoryName = extension_config_1.EXTENSION_CONFIG[extension] || 'Others';
        const category = await this.categoryRepository.findOne({ where: { name: categoryName } });
        if (!category) {
            throw new common_1.BadRequestException(`Category "${categoryName}" không tồn tại`);
        }
        const newFile = this.fileRepository.create({
            name: file.originalname,
            path: file.path,
            externalPath: '',
            mimeType: file.mimetype,
            size: file.size,
            owner: { id: userContext.userId },
            folder: folder || undefined,
            category,
        });
        await this.fileRepository.save(newFile);
        newFile.externalPath = await this.buildExternalPath(newFile, folder);
        await this.fileRepository.save(newFile);
        return {
            id: newFile.id,
            name: newFile.name,
            externalPath: newFile.externalPath,
            mimeType: newFile.mimeType,
            size: newFile.size,
            owner: {
                id: newFile.owner.id,
                username: newFile.owner.username,
            },
            folder: folder ? { id: folder.id, name: folder.name } : undefined,
            category: {
                id: newFile.category.id,
                name: newFile.category.name,
            },
        };
    }
    async findFileById(userContext, operationDto) {
        const { fileId } = operationDto;
        if (!fileId)
            throw new common_1.BadRequestException('fileId là bắt buộc');
        const file = await this.fileRepository.findOne({
            where: { id: (0, typeorm_2.Equal)(fileId) },
            relations: ['folder', 'owner', 'category'],
            select: {
                id: true,
                name: true,
                externalPath: true,
                mimeType: true,
                size: true,
                owner: { id: true, username: true },
                folder: { id: true, name: true },
                category: { id: true, name: true },
            },
        });
        if (!file)
            throw new common_1.NotFoundException('Tệp không tồn tại');
        await this.checkAccess(userContext, file.owner.id, 'file');
        file.externalPath = await this.buildExternalPath(file, file.folder);
        await this.fileRepository.save(file);
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
            category: {
                id: file.category.id,
                name: file.category.name,
            },
        };
    }
    async listFiles(userContext, operationDto) {
        const { folderId } = operationDto;
        let queryOptions = {};
        if (folderId) {
            const folder = await this.folderRepository.findOne({
                where: { id: (0, typeorm_2.Equal)(folderId) },
                relations: ['owner'],
            });
            if (!folder)
                throw new common_1.NotFoundException('Thư mục không tồn tại');
            await this.checkAccess(userContext, folder.owner.id, 'folder');
            queryOptions = { where: { folder: { id: (0, typeorm_2.Equal)(folderId) } } };
        }
        else {
            queryOptions = {
                where: {
                    folder: (0, typeorm_2.IsNull)(),
                    ...(userContext.role !== 'admin' ? { owner: { id: (0, typeorm_2.Equal)(userContext.userId) } } : {}),
                },
            };
        }
        const files = await this.fileRepository.find({
            ...queryOptions,
            relations: ['owner', 'folder', 'category'],
            select: {
                id: true,
                name: true,
                externalPath: true,
                mimeType: true,
                size: true,
                owner: { id: true, username: true },
                folder: { id: true, name: true },
                category: { id: true, name: true },
            },
        });
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
            category: {
                id: file.category.id,
                name: file.category.name,
            },
        }));
    }
    async deleteFile(userContext, operationDto) {
        const { fileId } = operationDto;
        if (!fileId)
            throw new common_1.BadRequestException('fileId là bắt buộc');
        const file = await this.fileRepository.findOne({
            where: { id: (0, typeorm_2.Equal)(fileId) },
            relations: ['owner'],
        });
        if (!file)
            throw new common_1.NotFoundException('Tệp không tồn tại');
        await this.checkAccess(userContext, file.owner.id, 'file');
        if ((0, fs_1.existsSync)(file.path)) {
            await Promise.resolve().then(() => require('fs/promises')).then(fs => fs.unlink(file.path));
        }
        await this.fileRepository.remove(file);
    }
};
exports.FilesService = FilesService;
exports.FilesService = FilesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(file_entity_1.File)),
    __param(1, (0, typeorm_1.InjectRepository)(folder_entity_1.Folder)),
    __param(2, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        users_service_1.UsersService])
], FilesService);
//# sourceMappingURL=files.service.js.map