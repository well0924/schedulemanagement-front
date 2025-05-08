
//일정 응답
export interface AttachResponse {
    id: number;
    originFileName: string;
    storedFileName: string;
    thumbnailFilePath: string;
    fileSize: number;
    filePath: string;
    isDeletedAttach: boolean;
}