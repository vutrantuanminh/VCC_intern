import * as Joi from 'joi';
import { MulterModuleOptions } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';

export const multerValidationSchema = Joi.object({
  FILE_UPLOAD_MAX_SIZE: Joi.number().required(),
  FILE_UPLOAD_PATH: Joi.string().required(),
});

export default (): MulterModuleOptions => ({
  storage: diskStorage({
    destination: process.env.FILE_UPLOAD_PATH as string,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  }),
  limits: {
    fileSize: parseInt(process.env.FILE_UPLOAD_MAX_SIZE as string, 10),
  },
});
