"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appValidationSchema = void 0;
const Joi = require("joi");
exports.appValidationSchema = Joi.object({
    PORT: Joi.number().default(3000),
    JWT_SECRET: Joi.string().required(),
    FRONTEND_URL: Joi.string().uri().required(),
    NODE_ENV: Joi.string().required(),
});
exports.default = () => ({
    port: parseInt(process.env.PORT || '3000', 10),
    env: process.env.NODE_ENV,
    jwtSecret: process.env.JWT_SECRET,
    frontendUrl: process.env.FRONTEND_URL,
});
//# sourceMappingURL=app.config.js.map