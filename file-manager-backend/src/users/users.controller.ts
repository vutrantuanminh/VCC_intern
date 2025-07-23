import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Users') // Nhóm các endpoint vào tag "Users"
@Controller('users')
export class UsersController {
  @Get('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  @ApiBearerAuth() // Yêu cầu Bearer Token
  @ApiOperation({ summary: 'Lấy thông tin hồ sơ người dùng' })
  @ApiResponse({ status: 200, description: 'Thông tin hồ sơ người dùng' })
  @ApiResponse({ status: 401, description: 'Không được phép (Unauthorized)' })
  getProfile(@Request() req) {
    return req.user; // Trả về thông tin user từ JWT
  }
}