import { AttachResponse } from "../attach/Attach";



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
    repeatInterval: number;
    isAllDay: boolean;
    scheduleType: 'ALL_DAY' | 'SINGLE_DAY' | 'MULTI_DAY'; 
    attachIds: number[];
}

export interface ScheduleResponse {
    status: string;
    id: number;
    contents: string;
    scheduleMonth: number;
    scheduleDays: number;
    startTime: string;
    endTime: string;
    userId: number;
    categoryId: number;
    progressStatus: {
        value: "COMPLETE" | "IN_COMPLETE";
    };
    repeatType: 'NONE' | 'DAILY' | 'MONTHLY' | 'YEARS';
    repeatCount: number;
    createdBy: string;
    createdTime: string;
    updatedBy: string;
    updatedTime: string;
    attachFiles: AttachResponse[];//첨부파일
}