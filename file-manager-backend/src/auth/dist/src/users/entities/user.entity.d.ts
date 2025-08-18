export declare enum Gender {
    MALE = "male",
    FEMALE = "female"
}
export declare class User {
    id: number;
    email: string;
    username: string;
    password: string;
    role: 'user' | 'admin';
    gender: Gender;
    phone_number: string;
}
