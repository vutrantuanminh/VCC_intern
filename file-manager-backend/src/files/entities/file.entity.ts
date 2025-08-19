import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Folder } from './folder.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity()
export class File {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  path: string; // Đường dẫn nội bộ của file trên server

  @Column()
  externalPath: string; // Đường dẫn công khai (ví dụ: /files/download/:fileId)

  @Column()
  mimeType: string; // Loại file (e.g., image/png)

  @Column()
  size: number; // Kích thước file (bytes)

  @ManyToOne(() => User, (user) => user.id)
  owner: User; // Chủ sở hữu file

  @ManyToOne(() => Folder, (folder) => folder.id, { nullable: true })
  folder: Folder; // Thư mục chứa file (có thể null)

  @ManyToOne(() => Category, { nullable: false })
  category: Category;
}