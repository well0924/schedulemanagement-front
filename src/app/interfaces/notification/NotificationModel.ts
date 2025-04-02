
//알림 유형
export type NoticeType = 'SCHEDULE_CREATED' |
    'SCHEDULE_REMINDER' |
    'SCHEDULE_UPDATED' |
    'SCHEDULE_DELETED' |
    'SCHEDULE_OVERDUE' |
    'SCHEDULE_COMPLETED' |
    'SCHEDULE_REPEATED' |
    'SYSTEM_ANNOUNCEMENT' |
    'CUSTOM_NOTIFICATION' |
    'TAG_MENTION';

//알림 dto
export interface Notification {
    id: number;
    message: string;
    noticeType: NoticeType;
    isRead: boolean;
}