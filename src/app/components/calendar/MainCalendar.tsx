'use client';

import 'react-calendar/dist/Calendar.css';
import '@/app/styles/calendar.css';
import { useCallback, useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import { useDarkModeContext } from '@/app/utile/context/DarkModeContext';
import { bulkDeleteSchedules, ScheduleAllList } from '@/app/utile/api/ScheduleApi';
import { DndContext } from '@dnd-kit/core';
import { useRouter } from "next/navigation";
import { createPortal } from 'react-dom';

interface calendarSchedule {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  color: string;
}

interface Props {
  reloadTrigger?: boolean;
}

const colorPalette = [
  'bg-blue-500', 'bg-red-500', 'bg-green-500',
  'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500',
];

const pad = (n: number) => n.toString().padStart(2, '0');
const fmtHM = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

export default function ScheduleCalendar({ reloadTrigger }: Props) {
  const [value, setValue] = useState<Date>(new Date());
  const [schedules, setSchedules] = useState<calendarSchedule[]>([]);
  const [selectedIds, setSelectedIds] = useState<Record<number, boolean>>({});
  const toggleSelect = (id: number) => setSelectedIds(prev => ({ ...prev, [id]: !prev[id] }));
  const clearSelection = () => setSelectedIds({});
  const { isDark } = useDarkModeContext();
  const router = useRouter();

  // Day Popover 상태
  const [dayPopover, setDayPopover] = useState<{ date: Date; x: number; y: number; } | null>(null);

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

        if (isSameDay(draggedStart, start)) newStart = dropDate;
        else if (isSameDay(draggedStart, end)) newEnd = dropDate;
        else return s;

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

  const getSchedulesForDate = (date: Date) => {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const list = schedules.filter((s) => {
      const start = new Date(s.startTime);
      const end = new Date(s.endTime);
      return (
        d >= new Date(start.getFullYear(), start.getMonth(), start.getDate()) &&
        d <= new Date(end.getFullYear(), end.getMonth(), end.getDate())
      );
    });
    return list.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  };

  const openDayPopover = (date: Date, tileEl: HTMLElement) => {
    const r = tileEl.getBoundingClientRect();
    setDayPopover({ date, x: r.left, y: r.bottom + 4 });
  };
  const closeDayPopover = () => setDayPopover(null);

  const matchedSchedules = getSchedulesForDate(value);

  return (
    <DndContext>
      <div className={`cal-compact w-full p-4 md:p-6 rounded shadow ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h2 className="text-base md:text-lg font-semibold">
            {value.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
          </h2>
        </div>

        {/* 캘린더 */}
        <section className="min-w-0 mx-auto w-full max-w-[600px] lg:max-w-[800px]">
          <Calendar
            className={`w-full text-sm md:text-base ${isDark ? 'dark-calendar' : ''}`}
            onChange={(date) => setValue(date as Date)}
            value={value}
            locale="ko-KR"
            calendarType="gregory"
            onClickDay={(date) => setValue(date)}
            tileContent={({ date, view }) => {
              if (view !== 'month') return null;

              const daySchedules = getSchedulesForDate(date);

              const isTouchDevice =
                typeof window !== 'undefined' &&
                ('ontouchstart' in window || navigator.maxTouchPoints > 0);

              return (
                <div
                  className="cal-cell relative w-full h-full"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, date)}
                  onClick={(e) => openDayPopover(date, e.currentTarget as HTMLElement)}
                >
                  <div className="cal-events flex flex-col gap-[2px] mt-3 items-start relative z-10">
                    {daySchedules.map((s, i) => {
                      const current = new Date(date);
                      const start = new Date(s.startTime);
                      const end = new Date(s.endTime);
                      const isStart = isSameDay(current, start);
                      const isEnd = isSameDay(current, end);
                      const canDrag = !isTouchDevice && (isStart || isEnd);
                      const draggedDate = isStart ? s.startTime : isEnd ? s.endTime : '';
                      const isAllDay = start.getTime() === end.getTime();
                      const label = isAllDay ? '종일' : fmtHM(start);

                      return (
                        <div
                          key={`${s.id}-${draggedDate}-${i}`}
                          draggable={canDrag}
                          onDragStart={(e) =>
                            canDrag && handleDragStart(e, s.id, s.color, draggedDate)
                          }
                          onClick={(e) => { e.stopPropagation(); router.push(`/calendar/${s.id}`); }}
                          className="flex items-center gap-1 text-[11px] md:text-[12px] leading-4 truncate cursor-pointer"
                          title={`${s.title} (${s.startTime.split('T')[0]} ~ ${s.endTime.split('T')[0]})`}
                        >
                          <div className={`h-[8px] w-2 rounded-full ${s.color}`} />
                          <span className="text-[10px] md:text-[11px] font-medium tabular-nums mr-1">{label}</span>
                          <span className="max-w-[85%] md:max-w-[82%] truncate">
                            {s.title || '(제목 없음)'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
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

        {/* Day Popover */}
        {dayPopover && createPortal(
          <>
            {/* 클릭 닫힘 영역 */}
            <div className="fixed inset-0 z-40" onClick={closeDayPopover} />
            {/* 카드 */}
            {(() => {
              const popWidth = 360;
              const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;
              const left = Math.max(8, Math.min(dayPopover.x, vw - popWidth - 8));
              const list = getSchedulesForDate(dayPopover.date);
              return (
                <div
                  className={`fixed z-50 shadow-xl border rounded-md ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}
                  style={{ left, top: dayPopover.y, width: popWidth, maxHeight: '60vh' }}
                  role="dialog" aria-modal="true"
                >
                  <div className={`px-3 py-2 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
                    <div className="font-semibold text-sm">
                      {dayPopover.date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })} · {list.length}건
                    </div>
                    <button className="text-xs px-2 py-1 rounded border opacity-80 hover:opacity-100" onClick={closeDayPopover}>
                      닫기
                    </button>
                  </div>
                  <div className="p-3 overflow-auto max-h-[calc(60vh-44px)]">
                    <ul className="space-y-2">
                      {list.map((s) => {
                        const st = new Date(s.startTime);
                        const en = new Date(s.endTime);
                        const isAllDay = st.getTime() === en.getTime();
                        const timeText = isAllDay ? '하루 종일' : `${fmtHM(st)} ~ ${fmtHM(en)}`;
                        return (
                          <li key={`${s.id}-${s.startTime}`}>
                            <button
                              className="w-full flex items-start gap-2 text-left hover:bg-black/5 dark:hover:bg-white/10 rounded px-2 py-1.5"
                              onClick={() => { closeDayPopover(); router.push(`/calendar/${s.id}`); }}
                            >
                              <div className={`mt-1 h-2 w-2 rounded-full ${s.color}`} />
                              <div className="flex-1">
                                <div className="text-xs text-gray-600 dark:text-gray-300 font-medium">{timeText}</div>
                                <div className="text-sm leading-tight">{s.title || '(제목 없음)'}</div>
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              );
            })()}
          </>,
          document.body
        )}
      </div>
    </DndContext>
  );
}
