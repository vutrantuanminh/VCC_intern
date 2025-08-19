import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Category } from './entities/category.entity';

@ApiTags('Categories')
@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Post()
  @Roles('admin')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Tạo category mới' })
  @ApiResponse({ status: 201, description: 'Category được tạo thành công', type: Category })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  create(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Lấy danh sách category' })
  @ApiResponse({ status: 200, description: 'Danh sách category', type: [Category] })
  findAll(): Promise<Category[]> {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Lấy thông tin category theo ID' })
  @ApiResponse({ status: 200, description: 'Thông tin category', type: Category })
  @ApiResponse({ status: 404, description: 'Category không tìm thấy' })
  findOne(@Param('id') id: string): Promise<Category> {
    return this.categoriesService.findOne(+id);
  }

  @Patch(':id')
  @Roles('admin')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Cập nhật category' })
  @ApiResponse({ status: 200, description: 'Category được cập nhật thành công', type: Category })
  @ApiResponse({ status: 404, description: 'Category không tìm thấy' })
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    return this.categoriesService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Xóa category' })
  @ApiResponse({ status: 200, description: 'Category được xóa thành công' })
  @ApiResponse({ status: 404, description: 'Category không tìm thấy' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.categoriesService.remove(+id);
  }
}