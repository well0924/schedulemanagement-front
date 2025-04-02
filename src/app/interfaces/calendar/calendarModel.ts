

export interface Schedule {
    id: number;
    title: string;
    time: string;
    category: string;
    status: string;
}

export interface ScheduleRequest {
    contents: string;
    scheduleMonth: number;
    scheduleDays: number;
    startTime: string;
    endTime: string;
    userId: number;
    categoryId: number;
    repeatType: 'NONE' | 'DAILY' | 'MONTHLY' | 'YEARS';
    repeatCount: number;
}