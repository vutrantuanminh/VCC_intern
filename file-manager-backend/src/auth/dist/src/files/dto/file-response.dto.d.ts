export declare class FileResponseDto {
    id: number;
    name: string;
    externalPath: string;
    mimeType: string;
    size: number;
    owner: {
        id: number;
        username: string;
    };
    folder?: {
        id: number;
        name: string;
    };
}
