import { Schedule, ScheduleRequest } from "../interfaces/calendar/calendarModel";


export const mapRequestToSchedule = (request: ScheduleRequest): Schedule => {
    return {
      id: Date.now(), // 임시 ID, 서버 응답 사용 시 대체
      title: request.contents,
      time: `${request.startTime.slice(11, 16)} ~ ${request.endTime.slice(11, 16)}`,
      category: '임시카테고리', // categoryId → 이름 매핑 필요 시 처리
      status: 'IN_COMPLETE', // 기본값
    };
  };