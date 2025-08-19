import { Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { EXTENSION_CONFIG } from '../config/extension.config';

@Injectable()
export class CategoriesService implements OnModuleInit {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async onModuleInit() {
    await this.initializeDefaultCategories();
  }

  async initializeDefaultCategories(): Promise<void> {
    const defaultCategories = [
      { name: 'Documents', extensions: Object.keys(EXTENSION_CONFIG).filter(ext => EXTENSION_CONFIG[ext] === 'Documents') },
      { name: 'Media', extensions: Object.keys(EXTENSION_CONFIG).filter(ext => EXTENSION_CONFIG[ext] === 'Media') },
      { name: 'Code', extensions: Object.keys(EXTENSION_CONFIG).filter(ext => EXTENSION_CONFIG[ext] === 'Code') },
      { name: 'Others', extensions: Object.keys(EXTENSION_CONFIG).filter(ext => EXTENSION_CONFIG[ext] === 'Others') },
    ];

    for (const defaultCategory of defaultCategories) {
      const exists = await this.categoryRepository.findOne({ where: { name: defaultCategory.name } });
      if (!exists) {
        await this.categoryRepository.save(this.categoryRepository.create(defaultCategory));
      }
    }
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const existingCategory = await this.categoryRepository.findOne({ where: { name: createCategoryDto.name } });
    if (existingCategory) {
      throw new BadRequestException('Category đã tồn tại');
    }

    const category = this.categoryRepository.create(createCategoryDto);
    return this.categoryRepository.save(category);
  }

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find();
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new BadRequestException('Category không tồn tại');
    }
    return category;
  }

  async ensureOthersCategory(): Promise<Category> {
    let othersCategory = await this.categoryRepository.findOne({ where: { name: 'Others' } });
    if (!othersCategory) {
      othersCategory = this.categoryRepository.create({ name: 'Others', extensions: [] });
      await this.categoryRepository.save(othersCategory);
    }
    return othersCategory;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);
    if (updateCategoryDto.name) {
      const existingCategory = await this.categoryRepository.findOne({ where: { name: updateCategoryDto.name } });
      if (existingCategory && existingCategory.id !== id) {
        throw new BadRequestException('Tên category đã tồn tại');
      }
    }
    Object.assign(category, updateCategoryDto);
    return this.categoryRepository.save(category);
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);
    if (category.name === 'Others') {
      throw new BadRequestException('Không thể xóa category mặc định "Others"');
    }
    await this.categoryRepository.delete(id);
  }
}