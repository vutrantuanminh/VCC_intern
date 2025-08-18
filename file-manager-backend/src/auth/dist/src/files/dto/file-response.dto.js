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
class FileResponseDto {
    id;
    name;
    externalPath;
    mimeType;
    size;
    owner;
    folder;
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
        type: 'object',
        properties: {
            id: { type: 'number', example: 25 },
            username: { type: 'string', example: 'user1' },
        },
    }),
    __metadata("design:type", Object)
], FileResponseDto.prototype, "owner", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Thông tin thư mục chứa file (nếu có)',
        type: 'object',
        nullable: true,
        properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'MyFolder' },
        },
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], FileResponseDto.prototype, "folder", void 0);
//# sourceMappingURL=file-response.dto.js.map