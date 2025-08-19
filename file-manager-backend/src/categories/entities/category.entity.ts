import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column('simple-array', { nullable: true })
  extensions: string[]; // Lưu danh sách extension, ví dụ: ['.doc', '.docx', '.pdf']
}