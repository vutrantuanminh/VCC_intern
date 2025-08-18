"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesModule = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const typeorm_1 = require("@nestjs/typeorm");
const multer_config_1 = require("../config/multer.config");
const files_controller_1 = require("./files.controller");
const files_service_1 = require("./files.service");
const file_entity_1 = require("./entities/file.entity");
const folder_entity_1 = require("./entities/folder.entity");
const users_module_1 = require("../users/users.module");
let FilesModule = class FilesModule {
};
exports.FilesModule = FilesModule;
exports.FilesModule = FilesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            platform_express_1.MulterModule.registerAsync({
                useFactory: multer_config_1.default,
            }),
            typeorm_1.TypeOrmModule.forFeature([file_entity_1.File, folder_entity_1.Folder]),
            users_module_1.UsersModule,
        ],
        controllers: [files_controller_1.FilesController],
        providers: [files_service_1.FilesService],
        exports: [files_service_1.FilesService, platform_express_1.MulterModule],
    })
], FilesModule);
//# sourceMappingURL=files.module.js.map