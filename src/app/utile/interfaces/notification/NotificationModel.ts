
//알림 유형
export type NoticeType = 
    'SCHEDULE_CREATED' |
    'SCHEDULE_UPDATED' |
    'SCHEDULE_DELETED' |
    'SCHEDULE_COMPLETED' |
    'SCHEDULE_REPEATED' ;

//알림 dto
export interface Notification {
    id: number;
    userId: number;
    message: string;
    scheduledAt: Date;
    noticeType: NoticeType;
    isRead: boolean;
    isSent: boolean;
}