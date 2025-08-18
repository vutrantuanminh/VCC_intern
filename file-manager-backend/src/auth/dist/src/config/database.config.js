"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseValidationSchema = void 0;
const Joi = require("joi");
exports.databaseValidationSchema = Joi.object({
    DATABASE_HOST: Joi.string().required(),
    DATABASE_PORT: Joi.number().required(),
    DATABASE_USERNAME: Joi.string().required(),
    DATABASE_PASSWORD: Joi.string().required(),
    DATABASE_NAME: Joi.string().required(),
    NODE_ENV: Joi.string().required(),
});
exports.default = () => ({
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    autoLoadEntities: true,
    synchronize: process.env.NODE_ENV !== 'production',
});
//# sourceMappingURL=database.config.js.map