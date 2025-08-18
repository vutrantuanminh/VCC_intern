import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import multerConfig from '../config/multer.config';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { File } from './entities/file.entity';
import { Folder } from './entities/folder.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MulterModule.registerAsync({
      useFactory: multerConfig, 
    }),
    TypeOrmModule.forFeature([File, Folder]),
    UsersModule,
  ],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService, MulterModule],
})
export class FilesModule {}