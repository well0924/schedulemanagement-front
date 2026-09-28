import { RecommendedScheduleDraft, ScheduleRequest, ScheduleResponse } from "@/app/utile/interfaces/calendar/calendarModel";
import { fetcher } from "./fetcher";
import { ChatRequest } from "../interfaces/chat/chatModel";

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
export async function TodayScheduleList() {
  return fetcher<ScheduleResponse[]>(`/api/schedule/today`, {
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

//일정 상태 변경
// 서버가 소유자 검증을 하므로 fetcher로 호출해 Authorization 헤더(및 401 시 재발급)를 적용한다.
export async function updateScheduleStatus(scheduleId: number, status: "IN_COMPLETE" | "PROGRESS" | "COMPLETE") {
  return fetcher<{ id: number; progressStatus: string }>(`/api/schedule/status/${scheduleId}`, {
    method: "PATCH",
    body: JSON.stringify({ value: status }),
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

//일정 추천목록
export async function getScheduleRecommendation(
  page = 0,
  size = 3
): Promise<RecommendedScheduleDraft[]> {
  return fetcher<RecommendedScheduleDraft[]>(
    `/api/chat/recommend?page=${page}&size=${size}`
  );
}

//일정 챗봇
export const sendChatMessage = async (data: ChatRequest) => {
  return fetcher<void>(`/api/v1/chat/send`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};