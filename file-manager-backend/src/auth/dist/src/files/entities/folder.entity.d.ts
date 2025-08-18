import { User } from '../../users/entities/user.entity';
import { File } from './file.entity';
export declare class Folder {
    id: number;
    name: string;
    owner: User;
    parent: Folder | null;
    children: Folder[];
    files: File[];
}
