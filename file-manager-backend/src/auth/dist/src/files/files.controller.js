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
exports.FilesController = void 0;
const common_1 = require("@nestjs/common");
const files_service_1 = require("./files.service");
const create_folder_dto_1 = require("./dto/create-folder.dto");
const update_folder_dto_1 = require("./dto/update-folder.dto");
const folder_operation_dto_1 = require("./dto/folder-operation.dto");
const file_operation_dto_1 = require("./dto/file-operation.dto");
const upload_file_dto_1 = require("./dto/upload-file.dto");
const file_response_dto_1 = require("./dto/file-response.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const swagger_1 = require("@nestjs/swagger");
const fs_1 = require("fs");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const file_entity_1 = require("./entities/file.entity");
let FilesController = class FilesController {
    filesService;
    fileRepository;
    constructor(filesService, fileRepository) {
        this.filesService = filesService;
        this.fileRepository = fileRepository;
    }
    createFolder(req, createFolderDto) {
        const userContext = {
            userId: req.user.id,
            role: req.user.role,
        };
        return this.filesService.createFolder(userContext, createFolderDto);
    }
    getFolders(req, operationDto) {
        const userContext = {
            userId: req.user.id,
            role: req.user.role,
        };
        return this.filesService.listFolders(userContext, operationDto);
    }
    getFolderById(req, operationDto) {
        const userContext = {
            userId: req.user.id,
            role: req.user.role,
        };
        return this.filesService.findFolderById(userContext, operationDto);
    }
    updateFolder(req, operationDto, updateFolderDto) {
        const userContext = {
            userId: req.user.id,
            role: req.user.role,
        };
        return this.filesService.updateFolder(userContext, operationDto, updateFolderDto);
    }
    deleteFolder(req, operationDto) {
        const userContext = {
            userId: req.user.id,
            role: req.user.role,
        };
        return this.filesService.deleteFolder(userContext, operationDto);
    }
    async uploadFile(req, file, uploadFileDto) {
        const userContext = {
            userId: req.user.id,
            role: req.user.role,
        };
        let targetUserId = userContext.userId;
        if (uploadFileDto.folderId) {
            if (isNaN(uploadFileDto.folderId)) {
                throw new common_1.BadRequestException('folderId phải là một số hợp lệ');
            }
            const folder = await this.filesService.findFolderById(userContext, { folderId: uploadFileDto.folderId });
            if (!folder) {
                throw new common_1.NotFoundException('Thư mục không tồn tại');
            }
            targetUserId = folder.owner.id;
        }
        const finalPath = (0, path_1.join)('./uploads', `user_${targetUserId}`);
        if (!(0, fs_1.existsSync)(finalPath)) {
            (0, fs_1.mkdirSync)(finalPath, { recursive: true });
        }
        const newFilePath = (0, path_1.join)(finalPath, file.filename);
        (0, fs_1.renameSync)(file.path, newFilePath);
        file.path = newFilePath;
        return this.filesService.uploadFile(userContext, file, uploadFileDto);
    }
    listFiles(req, operationDto) {
        const userContext = {
            userId: req.user.id,
            role: req.user.role,
        };
        return this.filesService.listFiles(userContext, operationDto);
    }
    async downloadFile(req, operationDto, res) {
        const userContext = {
            userId: req.user.id,
            role: req.user.role,
        };
        const { fileId } = operationDto;
        if (!fileId) {
            throw new common_1.BadRequestException('fileId là bắt buộc');
        }
        const file = await this.fileRepository.findOne({
            where: { id: (0, typeorm_2.Equal)(fileId) },
            relations: ['owner'],
        });
        if (!file) {
            throw new common_1.NotFoundException('Tệp không tồn tại');
        }
        await this.filesService.checkAccess(userContext, file.owner.id, 'file');
        if (!(0, fs_1.existsSync)(file.path)) {
            throw new common_1.NotFoundException('Tệp không tồn tại trên hệ thống');
        }
        return res.sendFile(file.path, { root: '.' });
    }
    deleteFile(req, operationDto) {
        const userContext = {
            userId: req.user.id,
            role: req.user.role,
        };
        return this.filesService.deleteFile(userContext, operationDto);
    }
};
exports.FilesController = FilesController;
__decorate([
    (0, common_1.Post)('folders'),
    (0, roles_decorator_1.Roles)('user', 'admin'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo thư mục mới' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Thư mục được tạo thành công' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Không được phép (Unauthorized)' }),
    (0, swagger_1.ApiBody)({ type: create_folder_dto_1.CreateFolderDto }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_folder_dto_1.CreateFolderDto]),
    __metadata("design:returntype", void 0)
], FilesController.prototype, "createFolder", null);
__decorate([
    (0, common_1.Get)('folders'),
    (0, roles_decorator_1.Roles)('user', 'admin'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách thư mục' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Danh sách thư mục' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Không được phép (Unauthorized)' }),
    (0, swagger_1.ApiQuery)({
        name: 'folderId',
        type: Number,
        description: 'ID của thư mục cha (tùy chọn)',
        required: false,
        example: 1,
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, folder_operation_dto_1.FolderOperationDto]),
    __metadata("design:returntype", void 0)
], FilesController.prototype, "getFolders", null);
__decorate([
    (0, common_1.Get)('folders/:folderId'),
    (0, roles_decorator_1.Roles)('user', 'admin'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy thông tin thư mục theo ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Thông tin thư mục' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Thư mục không tồn tại' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, folder_operation_dto_1.FolderOperationDto]),
    __metadata("design:returntype", void 0)
], FilesController.prototype, "getFolderById", null);
__decorate([
    (0, common_1.Patch)('folders/:folderId'),
    (0, roles_decorator_1.Roles)('user', 'admin'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật thư mục' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Thư mục được cập nhật thành công' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Thư mục không tồn tại' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, folder_operation_dto_1.FolderOperationDto, update_folder_dto_1.UpdateFolderDto]),
    __metadata("design:returntype", void 0)
], FilesController.prototype, "updateFolder", null);
__decorate([
    (0, common_1.Delete)('folders/:folderId'),
    (0, roles_decorator_1.Roles)('user', 'admin'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa thư mục' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Thư mục được xóa thành công' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Thư mục không tồn tại' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, folder_operation_dto_1.FolderOperationDto]),
    __metadata("design:returntype", void 0)
], FilesController.prototype, "deleteFolder", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, roles_decorator_1.Roles)('user', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload tệp' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
                folderId: { type: 'number' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Tệp được upload thành công', type: file_response_dto_1.FileResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dữ liệu không hợp lệ' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/temp',
            filename: (req, file, callback) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const filename = `${uniqueSuffix}${(0, path_1.extname)(file.originalname)}`;
                callback(null, filename);
            },
        }),
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, upload_file_dto_1.UploadFileDto]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Get)('files'),
    (0, roles_decorator_1.Roles)('user', 'admin'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    (0, swagger_1.ApiOperation)({ summary: 'Liệt kê tệp theo thư mục' }),
    (0, swagger_1.ApiQuery)({
        name: 'folderId',
        type: Number,
        description: 'ID của thư mục (tùy chọn)',
        required: false,
        example: 1,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Danh sách tệp được trả về thành công',
        type: [file_response_dto_1.FileResponseDto],
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Không được phép (Unauthorized)' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Thư mục không tồn tại' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, folder_operation_dto_1.FolderOperationDto]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "listFiles", null);
__decorate([
    (0, common_1.Get)('download/:fileId'),
    (0, roles_decorator_1.Roles)('user', 'admin'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    (0, swagger_1.ApiOperation)({ summary: 'Tải xuống tệp theo ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tệp được tải xuống thành công' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tệp không tìm thấy' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'fileId là bắt buộc' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)()),
    __param(2, (0, common_1.Response)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, file_operation_dto_1.FileOperationDto, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "downloadFile", null);
__decorate([
    (0, common_1.Delete)('files/:fileId'),
    (0, roles_decorator_1.Roles)('user', 'admin'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa tệp' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tệp được xóa thành công' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tệp không tìm thấy' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, file_operation_dto_1.FileOperationDto]),
    __metadata("design:returntype", void 0)
], FilesController.prototype, "deleteFile", null);
exports.FilesController = FilesController = __decorate([
    (0, swagger_1.ApiTags)('Files'),
    (0, common_1.Controller)('files'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(1, (0, typeorm_1.InjectRepository)(file_entity_1.File)),
    __metadata("design:paramtypes", [files_service_1.FilesService,
        typeorm_2.Repository])
], FilesController);
//# sourceMappingURL=files.controller.js.map