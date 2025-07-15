import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
export class UsersController {
  @Get('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)//Kiểm tra JWT token, Kiểm tra role phù hợp
  @Roles('user', 'admin') //chỉ 2 roll này mới được getProfile
  getProfile(@Request() req) {
    return req.user; // Trả về thông tin user từ JWT
  }
}