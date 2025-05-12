'use client';

import { useEffect, useState } from 'react';
import { ScheduleById } from '@/app/utile/api/ScheduleApi';
import { ScheduleResponse } from '@/app/utile/interfaces/calendar/calendarModel';

interface Props {
  scheduleId: number;
  onClose: () => void;
}

export default function ScheduleDetailModal({ scheduleId, onClose }: Props) {
  const [schedule, setSchedule] = useState<ScheduleResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const result = await ScheduleById(scheduleId);
        setSchedule(result);
      } catch (error) {
        console.error('일정 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [scheduleId]);

  if (!schedule) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-xl relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-lg"
        >
          ✖
        </button>

        {loading ? (
          <div className="text-center">불러오는 중...</div>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-4">{schedule.contents}</h2>
            <p><strong>시작:</strong> {formatDateTime(schedule.startTime)}</p>
            <p><strong>종료:</strong> {formatDateTime(schedule.endTime)}</p>
            <p><strong>상태:</strong> {schedule.progressStatus?.value === 'COMPLETE' ? '✅ 완료' : '⏳ 미완료'}</p>
            <p><strong>카테고리:</strong> {schedule.categoryId}</p>
            <p><strong>반복:</strong> {schedule.repeatType !== 'NONE' ? `${schedule.repeatType} x${schedule.repeatCount}` : '없음'}</p>
            {/* 첨부파일이 있다면 여기에 추가 표시 */}
          </>
        )}
      </div>
    </div>
  );
}