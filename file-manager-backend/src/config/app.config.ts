import * as Joi from 'joi';

export const appValidationSchema = Joi.object({
  PORT: Joi.number().default(3000),
  JWT_SECRET: Joi.string().required(),
  FRONTEND_URL: Joi.string().uri().required(),
  NODE_ENV: Joi.string().required(),
});

export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  env: process.env.NODE_ENV as string,
  jwtSecret: process.env.JWT_SECRET as string,
  frontendUrl: process.env.FRONTEND_URL as string,
});