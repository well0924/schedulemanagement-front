import { AttachResponse } from "@/app/utile/interfaces/attach/Attach";
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
    const res = await fetch(`http://localhost:8082/api/attach/${id}/presigned-download-url`);
    if (!res.ok) throw new Error("다운로드 URL 요청 실패");

    return await res.text(); // ❗ text 그대로 받기
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
