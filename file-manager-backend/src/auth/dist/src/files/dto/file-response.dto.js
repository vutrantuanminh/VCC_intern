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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class OwnerDto {
    id;
    username;
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID của người sở hữu', example: 25 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], OwnerDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tên người dùng', example: 'user1' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OwnerDto.prototype, "username", void 0);
class FolderDto {
    id;
    name;
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID của thư mục', example: 1 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], FolderDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tên thư mục', example: 'MyFolder' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FolderDto.prototype, "name", void 0);
class CategoryDto {
    id;
    name;
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID của category', example: 1 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CategoryDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tên category', example: 'Documents' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CategoryDto.prototype, "name", void 0);
class FileResponseDto {
    id;
    name;
    externalPath;
    mimeType;
    size;
    owner;
    folder;
    category;
}
exports.FileResponseDto = FileResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID của file',
        example: 1,
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], FileResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tên file',
        example: 'example.txt',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FileResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Đường dẫn công khai để truy cập file',
        example: '/files/download/1',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FileResponseDto.prototype, "externalPath", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Loại MIME của file',
        example: 'text/plain',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FileResponseDto.prototype, "mimeType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Kích thước file (bytes)',
        example: 1024,
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], FileResponseDto.prototype, "size", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Thông tin chủ sở hữu file',
        type: OwnerDto,
    }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => OwnerDto),
    __metadata("design:type", OwnerDto)
], FileResponseDto.prototype, "owner", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Thông tin thư mục chứa file (nếu có)',
        type: FolderDto,
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => FolderDto),
    __metadata("design:type", FolderDto)
], FileResponseDto.prototype, "folder", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Thông tin category của file',
        type: CategoryDto,
    }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CategoryDto),
    __metadata("design:type", CategoryDto)
], FileResponseDto.prototype, "category", void 0);
//# sourceMappingURL=file-response.dto.js.map