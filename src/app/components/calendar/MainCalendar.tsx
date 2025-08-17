'use client';

import 'react-calendar/dist/Calendar.css';
import '@/app/styles/calendar.css';
import { useCallback, useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import { useDarkModeContext } from '@/app/utile/context/DarkModeContext';
import { bulkDeleteSchedules, ScheduleAllList } from '@/app/utile/api/ScheduleApi';
import { DndContext } from '@dnd-kit/core';
import { useRouter } from "next/navigation";

interface calendarSchedule {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  color: string;
}

interface Props {
  reloadTrigger?: boolean; // 외부에서 갱신 트리거를 받기 위해 boolean
}

const colorPalette = [
  'bg-blue-500', 'bg-red-500', 'bg-green-500',
  'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500',
];

export default function ScheduleCalendar({ reloadTrigger }: Props) {
  const [value, setValue] = useState<Date>(new Date());
  const [schedules, setSchedules] = useState<calendarSchedule[]>([]);
  const [selectedIds, setSelectedIds] = useState<Record<number, boolean>>({});
  const toggleSelect = (id: number) => setSelectedIds(prev => ({ ...prev, [id]: !prev[id] }));
  const clearSelection = () => setSelectedIds({});
  const { isDark } = useDarkModeContext();
  const router = useRouter();

  const assignColor = useCallback((id: number) => {
    return colorPalette[id % colorPalette.length];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorPalette]);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const data = await ScheduleAllList();
        const mapped = data.map(item => ({
          id: item.id,
          title: item.contents,
          startTime: item.startTime,
          endTime: item.endTime,
          color: assignColor(item.id)
        }));
        setSchedules(mapped);
      } catch (e) {
        console.error('일정 불러오기 실패:', e);
      }
    };

    fetchSchedules();
  }, [assignColor, reloadTrigger]);

  const handleDragStart = (
    event: React.DragEvent<HTMLElement>,
    id: number,
    color: string,
    draggedStartTime: string
  ) => {
    event.dataTransfer.setData('scheduleId', id.toString());
    event.dataTransfer.setData('color', color);
    event.dataTransfer.setData('draggedStartTime', draggedStartTime);
    event.dataTransfer.effectAllowed = 'move';
  };

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>, dropDate: Date) => {
    const scheduleId = Number(event.dataTransfer.getData('scheduleId'));
    const color = event.dataTransfer.getData('color');
    const draggedStartStr = event.dataTransfer.getData('draggedStartTime');
    if (!draggedStartStr) return;

    const draggedStart = new Date(draggedStartStr);

    setSchedules(prev =>
      prev.map(s => {
        if (s.id !== scheduleId) return s;
        const start = new Date(s.startTime);
        const end = new Date(s.endTime);
        let newStart = start;
        let newEnd = end;

        if (isSameDay(draggedStart, start)) {
          newStart = dropDate;
        } else if (isSameDay(draggedStart, end)) {
          newEnd = dropDate;
        } else {
          return s;
        }

        if (newStart > newEnd) return s;

        return {
          ...s,
          startTime: newStart.toISOString(),
          endTime: newEnd.toISOString(),
          color,
        };
      })
    );
  };

  const matchedSchedules = schedules.filter(s => {
    const d = new Date(value.getFullYear(), value.getMonth(), value.getDate());
    const start = new Date(s.startTime);
    const end = new Date(s.endTime);
    return d >= new Date(start.getFullYear(), start.getMonth(), start.getDate()) &&
      d <= new Date(end.getFullYear(), end.getMonth(), end.getDate());
  });

  return (
    <DndContext>
      <div
        className={`w-full p-6 rounded shadow transition-colors ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-black'
          }`}
      >
        <Calendar
          className={`w-full text-base ${isDark ? 'dark-calendar' : ''}`}
          onChange={(date) => setValue(date as Date)}
          value={value}
          locale="ko-KR"
          calendarType="gregory"
          onClickDay={(date) => setValue(date)}
          tileContent={({ date, view }) => {
            if (view !== 'month') return null;

            const daySchedules = schedules.filter((s) => {
              const start = new Date(s.startTime);
              const end = new Date(s.endTime);
              const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
              return (
                d >= new Date(start.getFullYear(), start.getMonth(), start.getDate()) &&
                d <= new Date(end.getFullYear(), end.getMonth(), end.getDate())
              );
            });

            return (
              <div className="relative w-full h-full">
                <div className="flex flex-col gap-[2px] mt-5 items-start relative z-10">
                  {daySchedules.map((s, i) => {
                    const current = new Date(date);
                    const start = new Date(s.startTime);
                    const end = new Date(s.endTime);

                    const isStart = isSameDay(current, start);
                    const isEnd = isSameDay(current, end);
                    const canDrag = isStart || isEnd;
                    const draggedDate = isStart
                      ? s.startTime
                      : isEnd
                        ? s.endTime
                        : '';

                    return (
                      <div
                        key={`${s.id}-${draggedDate}-${i}`}
                        draggable={canDrag}
                        onDragStart={(e) =>
                          canDrag &&
                          handleDragStart(e, s.id, s.color, draggedDate)
                        }
                        className="flex items-center gap-1 text-[10px] truncate cursor-pointer"
                        title={`${s.title} (${s.startTime.split('T')[0]} ~ ${s.endTime.split('T')[0]
                          })`}
                      >
                        <div
                          className={`h-[6px] w-2 rounded-full ${s.color}`}
                        />
                        <span>{s.title || '(제목 없음)'}</span>
                      </div>
                    );
                  })}
                </div>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, date)}
                  className="absolute inset-0 z-0"
                />
              </div>
            );
          }}
        />

        <p className="mt-4 text-sm text-gray-600">
          선택한 날짜:{' '}
          {value.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>

        {matchedSchedules.length > 0 ? (
          <div className={`mt-2 p-4 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h3 className="text-sm font-semibold mb-2">일정 목록:</h3>
            <ul className="text-sm space-y-1">
              {matchedSchedules.map((s) => {
                const start = new Date(s.startTime);
                const end = new Date(s.endTime);
                const hhmm = (d: Date) =>
                  `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
                const timeText = start.toDateString() === end.toDateString() && start.getTime() === end.getTime()
                  ? '하루 종일'
                  : `${hhmm(start)} ~ ${hhmm(end)}`;

                return (
                  <li key={`${s.id}-${s.startTime}`} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!selectedIds[s.id]}
                      onChange={() => toggleSelect(s.id)}
                    />
                    <span
                      className="cursor-pointer hover:underline"
                      onClick={() => router.push(`/calendar/${s.id}`)}
                      title={`${s.title}`}
                    >
                      📌 {s.title} <span className="text-gray-500">({timeText})</span>
                    </span>
                  </li>
                );
              })}
            </ul>

            <div className="mt-3 flex gap-2">
              <button
                className="px-3 py-1 bg-red-500 text-white text-sm rounded disabled:opacity-50"
                disabled={Object.values(selectedIds).every(v => !v)}
                onClick={async () => {
                  const ids = Object.entries(selectedIds).filter(([, v]) => v).map(([k]) => Number(k));
                  if (ids.length === 0) return;
                  if (!confirm(`${ids.length}개 일정을 삭제할까요?`)) return;

                  try {
                    await bulkDeleteSchedules(ids);
                    // 1) 화면의 전체 일정 상태에서 제거
                    setSchedules(prev => prev.filter(s => !ids.includes(s.id)));
                    // 2) 선택 해제
                    clearSelection();
                  } catch (e) {
                    console.error('일정 선택삭제 실패:', e);
                    alert('삭제 중 오류가 발생했습니다.');
                  }
                }}
              >
                선택 삭제
              </button>
              <button
                className="px-3 py-1 border text-sm rounded"
                onClick={clearSelection}
              >
                선택 해제
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-gray-400">이 날은 일정이 없습니다.</p>
        )}
      </div>
    </DndContext>
  );
}