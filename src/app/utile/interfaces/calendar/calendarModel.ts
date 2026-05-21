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
        value: "COMPLETE" |"PROGRESS" | "IN_COMPLETE";
    };
    isAllDay:boolean;
    repeatInterval: number;
    repeatType: 'NONE' | 'DAILY' | 'MONTHLY' | 'YEARS';
    repeatCount: number;
    scheduleType: 'ALL_DAY' | 'SINGLE_DAY' | 'MULTI_DAY'; 
    createdBy: string;
    createdTime: string;
    updatedBy: string;
    updatedTime: string;
    attachFiles: AttachResponse[];//첨부파일
}

export interface ScheduleCreatePayload {
  contents: string;
  startTime: string;
  endTime: string;
  scheduleMonth: number;
  scheduleDays: number;
  isAllDay: boolean;

  categoryId?: number;

  repeatType?: 'NONE' | 'DAILY' | 'MONTHLY' | 'YEARS';
  repeatCount?: number;
  repeatInterval?: number;

  scheduleType?: 'ALL_DAY' | 'SINGLE_DAY' | 'MULTI_DAY';
  attachIds?: number[];
}

// 일정 추천 응답
export interface RecommendedScheduleDraft {
  id: -1;
  contents: string;
  startTime: string;
  endTime: string;
  scheduleDays: number;
  scheduleMonth: number;
  memberId: number;
  isAllDay: boolean;
}