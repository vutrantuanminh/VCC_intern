import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import appConfig, { appValidationSchema } from './config/app.config';
import databaseConfig, { databaseValidationSchema } from './config/database.config';
import { multerValidationSchema } from './config/multer.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FilesModule } from './files/files.module';
import { CategoriesModule } from './categories/categories.module';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object()
        .concat(appValidationSchema)
        .concat(databaseValidationSchema)
        .concat(multerValidationSchema),
      load: [appConfig, databaseConfig],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: databaseConfig,
    }),
    AuthModule,
    UsersModule,
    FilesModule,
    CategoriesModule,
  ],
})
export class AppModule {}