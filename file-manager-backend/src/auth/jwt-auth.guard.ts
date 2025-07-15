// src/auth/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

//JwtAuthGuard (kế thừa AuthGuard('jwt')) gọi JwtStrategy.validate.
//Nếu validate thành công (không ném lỗi), kết quả của validate được gắn vào req.user

/*không thêm logic gì mới, chỉ đổi tên guard thành JwtAuthGuard để:

Dễ gọi trong @UseGuards(...)

Tái sử dụng nhiều nơi mà không cần ghi AuthGuard('jwt') lặp đi lặp lại

Tạo một điểm mở rộng nếu sau này bạn muốn tùy biến thêm (như override handleRequest() hoặc canActivate())*/