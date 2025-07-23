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
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
let FilesController = class FilesController {
    filesService;
    constructor(filesService) {
        this.filesService = filesService;
    }
    createFolder(req, createFolderDto, ownerId) {
        const folder = this.filesService.createFolder(req.user.id, req.user.role, createFolderDto, ownerId);
        return (0, class_transformer_1.instanceToPlain)(folder);
    }
    getFolders(req, parentId) {
        return this.filesService.listFolders(req.user.id, req.user.role, parentId);
    }
    getFolderById(req, id) {
        return this.filesService.findFolderById(req.user.id, req.user.role, id);
    }
    updateFolder(req, id, updateFolderDto) {
        return this.filesService.updateFolder(req.user.id, req.user.role, id, updateFolderDto);
    }
    deleteFolder(req, id) {
        return this.filesService.deleteFolder(req.user.id, req.user.role, id);
    }
    uploadFile(req, file, folderId, ownerId) {
        return this.filesService.uploadFile(req.user.id, req.user.role, file, folderId, ownerId);
    }
    async downloadFile(req, id, res) {
        const file = await this.filesService.findFileById(req.user.id, req.user.role, id);
        return res.sendFile(file.path, { root: '.' });
    }
    deleteFile(req, id) {
        return this.filesService.deleteFile(req.user.id, req.user.role, id);
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
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Tên thư mục' },
                parentId: { type: 'number', description: 'ID thư mục cha (tùy chọn)', nullable: true },
                ownerId: { type: 'number', description: 'ID người sở hữu (chỉ dành cho admin)', nullable: true },
            },
        },
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Body)('ownerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_folder_dto_1.CreateFolderDto, Number]),
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
        name: 'parentId',
        type: Number,
        description: 'ID của thư mục cha (tùy chọn)',
        required: false,
        example: 1,
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('parentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], FilesController.prototype, "getFolders", null);
__decorate([
    (0, common_1.Get)('folders/:id'),
    (0, roles_decorator_1.Roles)('user', 'admin'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy thông tin thư mục theo ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Thông tin thư mục' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Thư mục không tìm thấy' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], FilesController.prototype, "getFolderById", null);
__decorate([
    (0, common_1.Patch)('folders/:id'),
    (0, roles_decorator_1.Roles)('user', 'admin'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật thông tin thư mục' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Thư mục được cập nhật thành công' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Thư mục không tìm thấy' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, update_folder_dto_1.UpdateFolderDto]),
    __metadata("design:returntype", void 0)
], FilesController.prototype, "updateFolder", null);
__decorate([
    (0, common_1.Delete)('folders/:id'),
    (0, roles_decorator_1.Roles)('user', 'admin'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa thư mục' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Thư mục được xóa thành công' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Thư mục không tìm thấy' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], FilesController.prototype, "deleteFolder", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, roles_decorator_1.Roles)('user', 'admin'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    (0, swagger_1.ApiOperation)({ summary: 'Tải lên tệp' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Tệp cần tải lên',
                },
                folderId: {
                    type: 'number',
                    description: 'ID của thư mục (tùy chọn)',
                    example: 1,
                    nullable: true,
                },
                ownerId: {
                    type: 'number',
                    description: 'ID người sở hữu (chỉ dành cho admin)',
                    example: 1,
                    nullable: true,
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Tệp được tải lên thành công' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Không được phép (Unauthorized)' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => Math.round(Math.random() * 16).toString(16)).join('');
                return cb(null, `${randomName}${(0, path_1.extname)(file.originalname)}`);
            },
        }),
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)('folderId')),
    __param(3, (0, common_1.Body)('ownerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Number, Number]),
    __metadata("design:returntype", void 0)
], FilesController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Get)('download/:id'),
    (0, roles_decorator_1.Roles)('user', 'admin'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    (0, swagger_1.ApiOperation)({ summary: 'Tải xuống tệp theo ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tệp được tải xuống thành công' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tệp không tìm thấy' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Response)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "downloadFile", null);
__decorate([
    (0, common_1.Delete)('files/:id'),
    (0, roles_decorator_1.Roles)('user', 'admin'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa tệp' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tệp được xóa thành công' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tệp không tìm thấy' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], FilesController.prototype, "deleteFile", null);
exports.FilesController = FilesController = __decorate([
    (0, swagger_1.ApiTags)('Files'),
    (0, common_1.Controller)('files'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [files_service_1.FilesService])
], FilesController);
//# sourceMappingURL=files.controller.js.map