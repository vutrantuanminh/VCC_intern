import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cấu hình Swagger
  const config = new DocumentBuilder()
    .setTitle('API Quản lý File') // Tiêu đề của API
    .setDescription('API để quản lý file và thư mục, đăng ký, đăng nhập người dùng') // Mô tả
    .setVersion('1.0') // Phiên bản API
    .addBearerAuth() // Thêm hỗ trợ Bearer Token cho xác thực JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // Đặt endpoint cho Swagger, ví dụ: /api

  await app.listen(3000); // Khởi động ứng dụng
}
bootstrap();