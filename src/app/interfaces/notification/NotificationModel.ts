
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
    message: string;
    noticeType: NoticeType;
    isRead: boolean;
}