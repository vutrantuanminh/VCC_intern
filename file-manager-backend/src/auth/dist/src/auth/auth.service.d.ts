import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<{
        message: string;
        user: {
            id: number;
            email: string;
            username: string;
            gender: import("../users/entities/user.entity").Gender;
            phone_number: string;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
    }>;
}
