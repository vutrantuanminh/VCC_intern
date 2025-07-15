import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler()); //admin-user
    if (!requiredRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user; //lấy ttin từ jwtguard 
    return requiredRoles.includes(user.role);//Kiểm tra xem user.role (ví dụ: "user") có nằm trong danh sách requiredRoles (ví dụ: ['user', 'admin']) hay không
  }
}