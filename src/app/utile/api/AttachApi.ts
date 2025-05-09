import { AttachResponse } from "@/app/interfaces/attach/Attach";
import { fetcher } from "./fetcher";

// 전체 파일 조회
export async function getAllAttachments() {
    return fetcher<AttachResponse[]>("/api/attach/", {
        method: "GET",
    });
}

// 단일 파일 조회
export async function getAttachmentById(id: number) {
    return fetcher<AttachResponse>(`/api/attach/${id}`, {
        method: "GET",
    });
}

// 업로드용 presigned URL 발급
export async function getPresignedUploadUrls(fileNames: string[]) {
    return fetcher<string[]>("/api/attach/presigned-urls", {
        method: "POST",
        body: JSON.stringify(fileNames),
        headers: { "Content-Type": "application/json" },
    });
}

// 다운로드용 presigned URL 발급
export async function getPresignedDownloadUrl(id: number) {
    return fetcher<string>(`/api/attach/${id}/presigned-download-url`, {
        method: "GET",
    });
}

// 업로드 완료 후 등록 처리
export async function completeFileUpload(uploadedFileNames: string[]) {
    return fetcher<AttachResponse[]>("/api/attach/complete-upload", {
        method: "POST",
        body: JSON.stringify(uploadedFileNames),
        headers: { "Content-Type": "application/json" },
    });
}

// 파일 및 attach 삭제
export async function deleteAttachment(id: number) {
    return fetcher<void>(`/api/attach/${id}`, {
        method: "DELETE",
    });
}
