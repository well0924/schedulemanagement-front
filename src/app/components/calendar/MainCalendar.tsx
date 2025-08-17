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
      <div className={`w-full p-4 md:p-6 rounded shadow transition-colors ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h2 className="text-base md:text-lg font-semibold">
            {value.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
          </h2>
        </div>

        {/* 캘린더 */}
        <section className="min-w-0">
          <Calendar
            className={`w-full text-sm md:text-base ${isDark ? 'dark-calendar' : ''}`}
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

              // 시작시간 오름차순
              daySchedules.sort((a, b) =>
                new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
              );

              // 터치 환경에서 드래그 비활성
              const isTouchDevice =
                typeof window !== 'undefined' &&
                ('ontouchstart' in window || navigator.maxTouchPoints > 0);

              return (
                <div className="cal-cell relative w-full h-full" onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, date)}>
                  <div className="cal-events flex flex-col gap-[2px] mt-5 items-start relative z-10">
                    {daySchedules.map((s, i) => {
                      const current = new Date(date);
                      const start = new Date(s.startTime);
                      const end = new Date(s.endTime);
                      const isStart = isSameDay(current, start);
                      const isEnd = isSameDay(current, end);
                      const canDrag = !isTouchDevice && (isStart || isEnd);
                      const draggedDate = isStart ? s.startTime : isEnd ? s.endTime : '';

                      return (
                        <div
                          key={`${s.id}-${draggedDate}-${i}`}
                          draggable={canDrag}
                          onDragStart={(e) =>
                            canDrag && handleDragStart(e, s.id, s.color, draggedDate)
                          }
                          className="flex items-center gap-1 text-[10px] md:text-[11px] truncate cursor-pointer"
                          title={`${s.title} (${s.startTime.split('T')[0]} ~ ${s.endTime.split('T')[0]})`}
                        >
                          <div className={`h-[6px] w-2 rounded-full ${s.color}`} />
                          <span className="max-w-[95%] md:max-w-[90%] truncate">
                            {s.title || '(제목 없음)'}
                          </span>
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
        </section>

        {/* 상세/목록 (항상 아래) */}
        <section className={`min-w-0 mt-4 ${matchedSchedules.length ? '' : 'opacity-80'}`}>
          <p className="text-sm text-gray-600">
            선택한 날짜: {value.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          {matchedSchedules.length > 0 ? (
            <div className={`mt-2 p-3 md:p-4 rounded border ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
              <h3 className="text-sm md:text-base font-semibold mb-2">
                일정 목록 ({matchedSchedules.length})
              </h3>

              <div className="max-h-64 md:max-h-[60vh] overflow-auto pr-1">
                <ul className="text-sm space-y-1">
                  {matchedSchedules.map((s) => {
                    const start = new Date(s.startTime);
                    const end = new Date(s.endTime);
                    const hhmm = (d: Date) =>
                      `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
                    const isAllDay = start.getTime() === end.getTime();
                    const timeText = isAllDay ? '하루 종일' : `${hhmm(start)} ~ ${hhmm(end)}`;

                    return (
                      <li
                        key={`${s.id}-${s.startTime}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, s.id, s.color, s.startTime)}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="checkbox"
                          checked={!!selectedIds[s.id]}
                          onChange={() => toggleSelect(s.id)}
                          className="h-4 w-4"
                        />
                        <button
                          type="button"
                          onClick={() => router.push(`/calendar/${s.id}`)}
                          className="flex-1 text-left hover:underline"
                          title={s.title}
                        >
                          <span className="inline-block mr-1 align-middle">📌</span>
                          <span className="align-middle">{s.title}</span>
                          <span className="ml-1 text-gray-500 align-middle">({timeText})</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded disabled:opacity-50"
                  disabled={Object.values(selectedIds).every(v => !v)}
                  onClick={async () => {
                    const ids = Object.entries(selectedIds).filter(([, v]) => v).map(([k]) => Number(k));
                    if (ids.length === 0) return;
                    if (!confirm(`${ids.length}개 일정을 삭제할까요?`)) return;
                    try {
                      await bulkDeleteSchedules(ids);
                      setSchedules(prev => prev.filter(s => !ids.includes(s.id)));
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
        </section>
      </div>
    </DndContext>
  );

}