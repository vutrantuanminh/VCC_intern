import { User } from '../../users/entities/user.entity';
import { Folder } from './folder.entity';
import { Category } from '../../categories/entities/category.entity';
export declare class File {
    id: number;
    name: string;
    path: string;
    externalPath: string;
    mimeType: string;
    size: number;
    owner: User;
    folder: Folder;
    category: Category;
}
