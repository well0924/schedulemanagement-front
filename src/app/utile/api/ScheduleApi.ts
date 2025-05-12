import { ScheduleRequest, ScheduleResponse } from "@/app/utile/interfaces/calendar/calendarModel";
import { fetcher } from "./fetcher";

// 전체 일정 조회
export async function ScheduleAllList() {
  return fetcher<ScheduleResponse[]>(`/api/schedule/`, {
    method: "GET",
  });
}

// 단일 일정 조회
export async function ScheduleById(id: number) {
  return fetcher<ScheduleResponse>(`/api/schedule/${id}`, {
    method: "GET",
  });
}

// 오늘 일정 조회
export async function TodayScheduleList(userId: number) {
  return fetcher<ScheduleResponse[]>(`/api/schedule/today/${userId}`, {
    method: "GET",
  });
}

// 상태별 일정 조회
export async function findByScheduleProgressStatus(userId: string, status: "COMPLETE" | "IN_COMPLETE", page = 0, size = 10) {
  const params = new URLSearchParams({
    userId,
    status,
    page: page.toString(),
    size: size.toString(),
  });
  return fetcher<{
    content: ScheduleResponse[];
    totalElements: number;
    totalPages: number;
  }>(`/api/schedule/status?${params.toString()}`, {
    method: "GET",
  });
}

// 일정 추가
export async function createSchedule(data: ScheduleRequest) {
  return fetcher<ScheduleResponse>(`/api/schedule/`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
}

// 일정 수정
export async function updateSchedule(id: number, data: ScheduleRequest) {
  return fetcher<ScheduleResponse>(`/api/schedule/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
}

// 단일 일정 삭제
export async function deleteSchedule(id: number, type: "SINGLE" | "ALL_REPEAT" | "AFTER_THIS" = "SINGLE") {
  return fetcher<string>(`/api/schedule/${id}?type=${type}`, {
    method: "POST",
  });
}

// 다중 삭제
export async function bulkDeleteSchedules(ids: number[]) {
  return fetcher<string>(`/api/schedule/bulk-delete`, {
    method: "POST",
    body: JSON.stringify(ids),
    headers: { "Content-Type": "application/json" },
    autoJson: false,
  });
}