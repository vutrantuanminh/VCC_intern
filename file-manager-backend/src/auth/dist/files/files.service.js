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
    async createFolder(userContext, createFolderDto, ownerId) {
        const { userId, role } = userContext;
        const { name, parentId } = createFolderDto;
        let targetUserId;
        if (role === 'admin' && ownerId) {
            targetUserId = ownerId;
        }
        else {
            targetUserId = userId;
        }
        const user = await this.usersService.findOneById(targetUserId);
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
            }
        });
        if (parentId) {
            let parent;
            if (role === 'admin') {
                parent = await this.folderRepository.findOne({
                    where: { id: (0, typeorm_2.Equal)(parentId) },
                    relations: ['owner'],
                    select: {
                        id: true,
                        name: true,
                        owner: { id: true, username: true },
                    },
                });
                if (parent && parent.owner.id !== user.id) {
                    throw new common_1.BadRequestException('Thư mục cha phải thuộc về cùng người sở hữu với thư mục');
                }
            }
            else {
                parent = await this.folderRepository.findOne({
                    where: { id: (0, typeorm_2.Equal)(parentId), owner: { id: (0, typeorm_2.Equal)(userId) } },
                });
            }
            if (!parent)
                throw new common_1.NotFoundException('Thư mục cha không tồn tại hoặc không sở hữu');
            folder.parent = parent;
        }
        return this.folderRepository.save(folder);
    }
    async listFolders(userContext, parentId) {
        const { userId, role } = userContext;
        let whereCondition;
        if (role === 'admin') {
            whereCondition = { parent: parentId ? { id: (0, typeorm_2.Equal)(parentId) } : (0, typeorm_2.IsNull)() };
        }
        else {
            whereCondition = { owner: { id: (0, typeorm_2.Equal)(userId) }, parent: parentId ? { id: (0, typeorm_2.Equal)(parentId) } : (0, typeorm_2.IsNull)() };
        }
        return this.folderRepository.find({
            where: whereCondition,
        });
    }
    async findFolderById(userContext, folderId) {
        const { userId, role } = userContext;
        let folder;
        if (role === 'admin') {
            folder = await this.folderRepository.findOne({
                where: { id: (0, typeorm_2.Equal)(folderId) },
                relations: ['parent', 'owner'],
                select: {
                    id: true,
                    name: true,
                    parent: { id: true, name: true },
                    owner: { id: true, username: true },
                },
            });
        }
        else {
            folder = await this.folderRepository.findOne({
                where: { id: (0, typeorm_2.Equal)(folderId), owner: { id: (0, typeorm_2.Equal)(userId) } },
                relations: ['parent', 'owner'],
                select: {
                    id: true,
                    name: true,
                    parent: { id: true, name: true },
                    owner: { id: true, username: true },
                },
            });
        }
        if (!folder)
            throw new common_1.NotFoundException('Thư mục không tồn tại hoặc không sở hữu');
        return folder;
    }
    async updateFolder(userContext, folderId, updateFolderDto) {
        const { userId, role } = userContext;
        const folder = await this.findFolderById(userContext, folderId);
        if (!folder.owner)
            throw new common_1.BadRequestException('Thư mục phải có người sở hữu');
        let newOwner = folder.owner;
        if (role === 'admin' && updateFolderDto.ownerId) {
            const user = await this.usersService.findOneById(updateFolderDto.ownerId);
            if (!user)
                throw new common_1.NotFoundException('Người dùng mới không tồn tại');
            newOwner = user;
        }
        if (updateFolderDto.name)
            folder.name = updateFolderDto.name;
        if (updateFolderDto.parentId) {
            let parent;
            if (role === 'admin') {
                parent = await this.folderRepository.findOne({
                    where: { id: (0, typeorm_2.Equal)(updateFolderDto.parentId) },
                    relations: ['owner'],
                    select: {
                        id: true,
                        name: true,
                        owner: { id: true, username: true },
                    },
                });
                if (parent && parent.owner.id !== newOwner.id) {
                    throw new common_1.BadRequestException('Thư mục cha phải thuộc về cùng người sở hữu với thư mục');
                }
            }
            else {
                parent = await this.folderRepository.findOne({
                    where: { id: (0, typeorm_2.Equal)(updateFolderDto.parentId), owner: { id: (0, typeorm_2.Equal)(userId) } },
                });
            }
            if (!parent)
                throw new common_1.NotFoundException('Thư mục cha không tồn tại hoặc không sở hữu');
            folder.parent = parent;
        }
        else if (updateFolderDto.parentId === null) {
            folder.parent = null;
        }
        if (role === 'admin' && updateFolderDto.ownerId) {
            if (folder.parent && folder.parent.owner.id !== newOwner.id) {
                throw new common_1.BadRequestException('Người sở hữu mới phải khớp với người sở hữu của thư mục cha');
            }
            folder.owner = newOwner;
        }
        return this.folderRepository.save(folder);
    }
    async deleteFolder(userContext, folderId) {
        const folder = await this.findFolderById(userContext, folderId);
        await this.folderRepository.remove(folder);
    }
    async uploadFile(userContext, file, folderId) {
        const { userId, role } = userContext;
        let targetUserId = userId;
        let folder;
        if (folderId) {
            folder = await this.folderRepository.findOne({
                where: { id: (0, typeorm_2.Equal)(folderId) },
                relations: ['owner'],
                select: {
                    id: true,
                    name: true,
                    owner: { id: true, username: true, email: true, gender: true, phone_number: true },
                },
            });
            if (!folder)
                throw new common_1.NotFoundException('Thư mục không tồn tại');
            if (role === 'admin') {
                targetUserId = folder.owner.id;
            }
            else {
                if (folder.owner.id !== userId) {
                    throw new common_1.BadRequestException('Thư mục phải thuộc về bạn');
                }
            }
        }
        const user = await this.usersService.findOneById(targetUserId);
        if (!user)
            throw new common_1.NotFoundException('Người dùng không tồn tại');
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
    async findFileById(userContext, fileId) {
        const { userId, role } = userContext;
        let file;
        if (role === 'admin') {
            file = await this.fileRepository.findOne({
                where: { id: (0, typeorm_2.Equal)(fileId) },
                relations: ['folder'],
                select: {
                    id: true,
                    name: true,
                    owner: { id: true, username: true },
                },
            });
        }
        else {
            file = await this.fileRepository.findOne({
                where: { id: (0, typeorm_2.Equal)(fileId), owner: { id: (0, typeorm_2.Equal)(userId) } },
                relations: ['folder'],
                select: {
                    id: true,
                    name: true,
                    owner: { id: true, username: true },
                },
            });
        }
        if (!file)
            throw new common_1.NotFoundException('Tệp không tồn tại hoặc không sở hữu');
        return file;
    }
    async listFiles(userContext, folderId) {
        const { userId, role } = userContext;
        let queryOptions = {};
        if (folderId) {
            const folder = await this.folderRepository.findOne({
                where: { id: (0, typeorm_2.Equal)(folderId) },
                relations: ['owner'],
                select: { id: true, owner: { id: true } },
            });
            if (!folder)
                throw new common_1.NotFoundException('Thư mục không tồn tại');
            if (role !== 'admin' && folder.owner.id !== userId) {
                throw new common_1.BadRequestException('Bạn không sở hữu thư mục này');
            }
            queryOptions = { where: { folder: { id: (0, typeorm_2.Equal)(folderId) } } };
        }
        else {
            queryOptions = {
                where: {
                    folder: (0, typeorm_2.IsNull)(),
                    ...(role !== 'admin' ? { owner: { id: (0, typeorm_2.Equal)(userId) } } : {}),
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
    async deleteFile(userContext, fileId) {
        const file = await this.findFileById(userContext, fileId);
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