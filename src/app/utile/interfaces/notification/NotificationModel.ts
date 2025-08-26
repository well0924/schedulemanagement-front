
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
    scheduleId: number;
    message: string;
    scheduledAt: Date;
    noticeType: NoticeType;
    isRead: boolean;
    isSent: boolean;
}

//알림 구독 여부용 dto
export interface NotificationSetting {
    id:number,
    userId:number,
    scheduleCreatedEnabled:boolean,
    scheduleUpdatedEnabled:boolean,
    scheduleDeletedEnabled:boolean,
    scheduleRemindEnabled:boolean,
    webEnabled:boolean,
    emailEnabled:boolean,
    pushEnabled:boolean
}

//알림 웹푸시 dto