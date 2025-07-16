export declare enum Gender {
    MALE = "male",
    FEMALE = "female"
}
export declare class RegisterDto {
    email: string;
    password: string;
    gender: Gender;
    phone_number: number;
    username: string;
}
