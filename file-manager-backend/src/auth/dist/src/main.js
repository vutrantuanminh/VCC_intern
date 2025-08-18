"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    app.useGlobalInterceptors(new common_1.ClassSerializerInterceptor(app.get('Reflector')));
    app.enableCors({
        origin: configService.get('FRONTEND_URL'),
        credentials: true,
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('API Quản lý File')
        .setDescription('API để quản lý file và thư mục, đăng ký, đăng nhập người dùng')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    const port = configService.get('APP_PORT', 3000);
    await app.listen(port);
}
bootstrap();
//# sourceMappingURL=main.js.map