import * as Joi from 'joi';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseValidationSchema = Joi.object({
  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().required(), 
  DATABASE_USERNAME: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),
  NODE_ENV: Joi.string().required(), 
});

export default (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DATABASE_HOST as string,
  port: parseInt(process.env.DATABASE_PORT as string, 10),
  username: process.env.DATABASE_USERNAME as string,
  password: process.env.DATABASE_PASSWORD as string,
  database: process.env.DATABASE_NAME as string,
  autoLoadEntities: true,
  synchronize: process.env.NODE_ENV !== 'production',
});
