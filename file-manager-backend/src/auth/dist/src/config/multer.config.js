"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.multerValidationSchema = void 0;
const Joi = require("joi");
const multer_1 = require("multer");
const path = require("path");
exports.multerValidationSchema = Joi.object({
    FILE_UPLOAD_MAX_SIZE: Joi.number().required(),
    FILE_UPLOAD_PATH: Joi.string().required(),
});
exports.default = () => ({
    storage: (0, multer_1.diskStorage)({
        destination: process.env.FILE_UPLOAD_PATH,
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = path.extname(file.originalname);
            cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
    }),
    limits: {
        fileSize: parseInt(process.env.FILE_UPLOAD_MAX_SIZE, 10),
    },
});
//# sourceMappingURL=multer.config.js.map