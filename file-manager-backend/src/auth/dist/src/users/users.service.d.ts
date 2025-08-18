import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Gender } from 'src/auth/dto/register.dto';
export declare class UsersService {
    private usersRepository;
    constructor(usersRepository: Repository<User>);
    findOne(email: string): Promise<User | null>;
    findOneById(id: number): Promise<User | null>;
    create(email: string, password: string, gender: Gender, phone_number: string, username: string): Promise<User>;
}
