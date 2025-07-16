import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        message: string;
        user: {
            id: number;
            email: string;
            username: string;
            gender: import("../users/entities/user.entity").Gender;
            phone_number: number;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
    }>;
}
