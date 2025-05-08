import { Notification } from "@/app/interfaces/notification/NotificationModel";
import { fetcher } from "../fetcher";


// 알림 전체 목록 가져오기 (최신순)
export async function getNotifications(userId: number): Promise<Notification[]> {
    return fetcher<Notification[]>(`/api/notice/${userId}`);
}

// 읽지 않은 알림 목록 가져오기
export async function getUnreadNotifications(userId: number): Promise<Notification[]> {
    return fetcher<Notification[]>(`/api/notice/unread/${userId}`);
}