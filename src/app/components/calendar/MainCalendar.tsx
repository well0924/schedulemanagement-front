'use client';

import 'react-calendar/dist/Calendar.css';
import '@/app/styles/calendar.css';
import { useCallback, useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import { useDarkModeContext } from '@/app/utile/context/DarkModeContext';
import { ScheduleAllList } from '@/app/utile/api/ScheduleApi';
import { DndContext } from '@dnd-kit/core';

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
  const { isDark } = useDarkModeContext();

  const assignColor = useCallback((id: number) => {
    return colorPalette[id % colorPalette.length];
  }, [colorPalette]);
  //const newId = Date.now() + Math.floor(Math.random() * 1000);

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
      <div className={`w-full p-6 rounded shadow transition-colors ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
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
              return d >= new Date(start.getFullYear(), start.getMonth(), start.getDate()) &&
                d <= new Date(end.getFullYear(), end.getMonth(), end.getDate());
            });

            return (
              <div className="relative w-full h-full">
                <div className="flex flex-col gap-[2px] mt-5 items-center relative z-10">
                  {daySchedules.slice(0, 3).map((s,i) => {
                    const current = new Date(date);
                    const start = new Date(s.startTime);
                    const end = new Date(s.endTime);

                    const isStart = isSameDay(current, start);
                    const isEnd = isSameDay(current, end);
                    const canDrag = isStart || isEnd;
                    const draggedDate = isStart ? s.startTime : isEnd ? s.endTime : '';

                    return (
                      <div
                        key={`${s.id}-${draggedDate}-${i}`}
                        draggable={canDrag}
                        onDragStart={(e) =>
                          canDrag && handleDragStart(e, s.id, s.color, draggedDate)
                        }
                        className={`h-[2px] w-4 rounded-full ${s.color} cursor-move`}
                        title={`${s.title} (${s.startTime.split('T')[0]} ~ ${s.endTime.split('T')[0]})`}
                      />
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
          선택한 날짜: {value.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>

        {matchedSchedules.length > 0 ? (
          <div className={`mt-2 p-4 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h3 className="text-sm font-semibold mb-2">일정 목록:</h3>
            <ul className="text-sm space-y-1">
              {matchedSchedules.map((s) => (
                <li
                  key={`${s.id}-${s.startTime}`} 
                  draggable
                  onDragStart={(e) => handleDragStart(e, s.id, s.color, s.startTime)}
                >
                  📌 {s.title}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-2 text-sm text-gray-400">이 날은 일정이 없습니다.</p>
        )}
      </div>
    </DndContext>
  );
}