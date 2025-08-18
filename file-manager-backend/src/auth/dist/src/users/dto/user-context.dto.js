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
exports.UserContextDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class UserContextDto {
    userId;
    role;
    folderId;
    fileId;
}
exports.UserContextDto = UserContextDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID của người dùng', example: 1 }),
    (0, class_validator_1.IsInt)({ message: 'userId phải là một số nguyên' }),
    __metadata("design:type", Number)
], UserContextDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Vai trò của người dùng', example: 'user' }),
    (0, class_validator_1.IsString)({ message: 'role phải là một chuỗi' }),
    (0, class_validator_1.IsIn)(['admin', 'user'], { message: 'role phải là "admin" hoặc "user"' }),
    __metadata("design:type", String)
], UserContextDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID của thư mục (tùy chọn)', example: 1, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UserContextDto.prototype, "folderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID của tệp (tùy chọn)', example: 1, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UserContextDto.prototype, "fileId", void 0);
//# sourceMappingURL=user-context.dto.js.map