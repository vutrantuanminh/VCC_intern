declare class OwnerDto {
    id: number;
    username: string;
}
declare class FolderDto {
    id: number;
    name: string;
}
declare class CategoryDto {
    id: number;
    name: string;
}
export declare class FileResponseDto {
    id: number;
    name: string;
    externalPath: string;
    mimeType: string;
    size: number;
    owner: OwnerDto;
    folder?: FolderDto;
    category: CategoryDto;
}
export {};
