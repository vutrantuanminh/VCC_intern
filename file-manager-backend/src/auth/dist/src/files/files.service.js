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
const fs_1 = require("fs");
let FilesService = class FilesService {
    fileRepository;
    folderRepository;
    usersService;
    constructor(fileRepository, folderRepository, usersService) {
        this.fileRepository = fileRepository;
        this.folderRepository = folderRepository;
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
        let whereCondition;
        if (role === 'admin') {
            whereCondition = { parent: folderId ? { id: (0, typeorm_2.Equal)(folderId) } : (0, typeorm_2.IsNull)() };
        }
        else {
            whereCondition = { owner: { id: (0, typeorm_2.Equal)(userId) }, parent: folderId ? { id: (0, typeorm_2.Equal)(folderId) } : (0, typeorm_2.IsNull)() };
        }
        if (folderId) {
            const parent = await this.folderRepository.findOne({
                where: { id: (0, typeorm_2.Equal)(folderId) },
                relations: ['owner'],
            });
            if (!parent)
                throw new common_1.NotFoundException('Thư mục cha không tồn tại');
            await this.checkAccess(userContext, parent.owner.id, 'folder');
        }
        return this.folderRepository.find({
            where: whereCondition,
            relations: ['owner'],
            select: {
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
            relations: ['parent', 'owner'],
            select: {
                id: true,
                name: true,
                parent: { id: true, name: true },
                owner: { id: true, username: true },
            },
        });
        if (!folder)
            throw new common_1.NotFoundException('Thư mục không tồn tại');
        await this.checkAccess(userContext, folder.owner.id, 'folder');
        return folder;
    }
    async updateFolder(userContext, operationDto, updateFolderDto) {
        const { folderId } = operationDto;
        if (!folderId)
            throw new common_1.BadRequestException('folderId là bắt buộc');
        const folder = await this.folderRepository.findOne({
            where: { id: (0, typeorm_2.Equal)(folderId) },
            relations: ['parent', 'owner'],
        });
        if (!folder)
            throw new common_1.NotFoundException('Thư mục không tồn tại');
        await this.checkAccess(userContext, folder.owner.id, 'folder');
        let newOwner = folder.owner;
        if (userContext.role === 'admin' && updateFolderDto.ownerId) {
            const user = await this.usersService.findOneById(updateFolderDto.ownerId);
            if (!user)
                throw new common_1.NotFoundException('Người dùng mới không tồn tại');
            newOwner = user;
        }
        if (updateFolderDto.name)
            folder.name = updateFolderDto.name;
        if (updateFolderDto.parentId) {
            const parent = await this.folderRepository.findOne({
                where: { id: (0, typeorm_2.Equal)(updateFolderDto.parentId) },
                relations: ['owner'],
            });
            if (!parent)
                throw new common_1.NotFoundException('Thư mục cha không tồn tại');
            await this.checkAccess(userContext, parent.owner.id, 'folder');
            if (parent.owner.id !== newOwner.id) {
                throw new common_1.BadRequestException('Thư mục cha phải thuộc về cùng người sở hữu với thư mục');
            }
            folder.parent = parent;
        }
        else if (updateFolderDto.parentId === null) {
            folder.parent = null;
        }
        if (userContext.role === 'admin' && updateFolderDto.ownerId) {
            if (folder.parent && folder.parent.owner.id !== newOwner.id) {
                throw new common_1.BadRequestException('Người sở hữu mới phải khớp với người sở hữu của thư mục cha');
            }
            folder.owner = newOwner;
        }
        const updatedFolder = await this.folderRepository.save(folder);
        const files = await this.fileRepository.find({
            where: { folder: { id: (0, typeorm_2.Equal)(folder.id) } },
            relations: ['folder'],
        });
        for (const file of files) {
            file.externalPath = await this.buildExternalPath(file, updatedFolder);
            await this.fileRepository.save(file);
        }
        return updatedFolder;
    }
    async deleteFolder(userContext, operationDto) {
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
        await this.folderRepository.remove(folder);
    }
    async uploadFile(userContext, file, uploadFileDto) {
        const { userId } = userContext;
        const { folderId } = uploadFileDto;
        let targetUserId = userId;
        let folder;
        if (folderId) {
            folder = await this.folderRepository.findOne({
                where: { id: (0, typeorm_2.Equal)(folderId) },
                relations: ['owner'],
            });
            if (!folder)
                throw new common_1.NotFoundException('Thư mục không tồn tại');
            await this.checkAccess(userContext, folder.owner.id, 'folder');
            targetUserId = folder.owner.id;
        }
        const user = await this.usersService.findOneById(targetUserId);
        if (!user)
            throw new common_1.NotFoundException('Người dùng không tồn tại');
        if (!(0, fs_1.existsSync)(file.path)) {
            throw new common_1.BadRequestException('Tệp không được lưu trữ đúng cách trên hệ thống');
        }
        const fileEntity = this.fileRepository.create({
            name: file.originalname,
            path: file.path,
            externalPath: '',
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
        const savedFile = await this.fileRepository.save(fileEntity);
        savedFile.externalPath = await this.buildExternalPath(savedFile, folder);
        await this.fileRepository.save(savedFile);
        return {
            id: savedFile.id,
            name: savedFile.name,
            externalPath: savedFile.externalPath,
            mimeType: savedFile.mimeType,
            size: savedFile.size,
            owner: {
                id: savedFile.owner.id,
                username: savedFile.owner.username,
            },
            folder: savedFile.folder ? { id: savedFile.folder.id, name: savedFile.folder.name } : undefined,
        };
    }
    async findFileById(userContext, operationDto) {
        const { fileId } = operationDto;
        if (!fileId)
            throw new common_1.BadRequestException('fileId là bắt buộc');
        const file = await this.fileRepository.findOne({
            where: { id: (0, typeorm_2.Equal)(fileId) },
            relations: ['folder', 'owner'],
            select: {
                id: true,
                name: true,
                externalPath: true,
                mimeType: true,
                size: true,
                owner: { id: true, username: true },
                folder: { id: true, name: true },
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
            relations: ['owner', 'folder'],
            select: {
                id: true,
                name: true,
                externalPath: true,
                mimeType: true,
                size: true,
                owner: { id: true, username: true },
                folder: { id: true, name: true },
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
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        users_service_1.UsersService])
], FilesService);
//# sourceMappingURL=files.service.js.map