import * as Joi from 'joi';
export declare const appValidationSchema: Joi.ObjectSchema<any>;
declare const _default: () => {
    port: number;
    env: string;
    jwtSecret: string;
    frontendUrl: string;
};
export default _default;
