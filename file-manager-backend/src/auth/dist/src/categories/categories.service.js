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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const category_entity_1 = require("./entities/category.entity");
const extension_config_1 = require("../config/extension.config");
let CategoriesService = class CategoriesService {
    categoryRepository;
    constructor(categoryRepository) {
        this.categoryRepository = categoryRepository;
    }
    async onModuleInit() {
        await this.initializeDefaultCategories();
    }
    async initializeDefaultCategories() {
        const defaultCategories = [
            { name: 'Documents', extensions: Object.keys(extension_config_1.EXTENSION_CONFIG).filter(ext => extension_config_1.EXTENSION_CONFIG[ext] === 'Documents') },
            { name: 'Media', extensions: Object.keys(extension_config_1.EXTENSION_CONFIG).filter(ext => extension_config_1.EXTENSION_CONFIG[ext] === 'Media') },
            { name: 'Code', extensions: Object.keys(extension_config_1.EXTENSION_CONFIG).filter(ext => extension_config_1.EXTENSION_CONFIG[ext] === 'Code') },
            { name: 'Others', extensions: Object.keys(extension_config_1.EXTENSION_CONFIG).filter(ext => extension_config_1.EXTENSION_CONFIG[ext] === 'Others') },
        ];
        for (const defaultCategory of defaultCategories) {
            const exists = await this.categoryRepository.findOne({ where: { name: defaultCategory.name } });
            if (!exists) {
                await this.categoryRepository.save(this.categoryRepository.create(defaultCategory));
            }
        }
    }
    async create(createCategoryDto) {
        const existingCategory = await this.categoryRepository.findOne({ where: { name: createCategoryDto.name } });
        if (existingCategory) {
            throw new common_1.BadRequestException('Category đã tồn tại');
        }
        const category = this.categoryRepository.create(createCategoryDto);
        return this.categoryRepository.save(category);
    }
    async findAll() {
        return this.categoryRepository.find();
    }
    async findOne(id) {
        const category = await this.categoryRepository.findOne({ where: { id } });
        if (!category) {
            throw new common_1.BadRequestException('Category không tồn tại');
        }
        return category;
    }
    async ensureOthersCategory() {
        let othersCategory = await this.categoryRepository.findOne({ where: { name: 'Others' } });
        if (!othersCategory) {
            othersCategory = this.categoryRepository.create({ name: 'Others', extensions: [] });
            await this.categoryRepository.save(othersCategory);
        }
        return othersCategory;
    }
    async update(id, updateCategoryDto) {
        const category = await this.findOne(id);
        if (updateCategoryDto.name) {
            const existingCategory = await this.categoryRepository.findOne({ where: { name: updateCategoryDto.name } });
            if (existingCategory && existingCategory.id !== id) {
                throw new common_1.BadRequestException('Tên category đã tồn tại');
            }
        }
        Object.assign(category, updateCategoryDto);
        return this.categoryRepository.save(category);
    }
    async remove(id) {
        const category = await this.findOne(id);
        if (category.name === 'Others') {
            throw new common_1.BadRequestException('Không thể xóa category mặc định "Others"');
        }
        await this.categoryRepository.delete(id);
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map