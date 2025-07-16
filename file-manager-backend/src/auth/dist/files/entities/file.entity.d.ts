import { User } from '../../users/entities/user.entity';
import { Folder } from './folder.entity';
export declare class File {
    id: number;
    name: string;
    path: string;
    mimeType: string;
    size: number;
    owner: User;
    folder: Folder;
}
