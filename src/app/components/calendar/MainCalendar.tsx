'use client';

import 'react-calendar/dist/Calendar.css';
import '@/app/styles/calendar.css';
import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useDarkModeContext } from '@/app/context/DarkModeContext';

interface calendarSchedule {
  date: Date;
  title: string;
}

export default function ScheduleCalendar() {
  const [value, setValue] = useState<Date>(new Date());
  const { isDark } = useDarkModeContext();

  const schedules: calendarSchedule[] = [
    { date: new Date(2025, 3, 1), title: '회의' },
    { date: new Date(2025, 3, 1), title: '스터디' },
    { date: new Date(2025, 3, 3), title: '운동' },
  ];
  
  const matchedSchedules = schedules.filter(
    (s) =>
      s.date.getFullYear() === value.getFullYear() &&
      s.date.getMonth() === value.getMonth() &&
      s.date.getDate() === value.getDate()
  );

  return (
    <div className={`w-full p-6 rounded shadow transition-colors ${
      isDark ? 'bg-gray-800 text-white' : 'bg-white text-black'
    }`}>
      <Calendar
        className={`w-full text-base ${
          isDark ? 'dark-calendar' : ''
        }`}
        onChange={(date) => setValue(date as Date)}
        value={value}
        locale="ko-KR"
        calendarType="gregory"
        onClickDay={(date) => setValue(date)}
        tileContent={({ date, view }) =>
          view === 'month' &&
          schedules.some(
            (s) =>
              s.date.getFullYear() === date.getFullYear() &&
              s.date.getMonth() === date.getMonth() &&
              s.date.getDate() === date.getDate()
          ) ? (
            <div className="text-blue-500 text-xs text-center mt-1">●</div>
          ) : null
        }
      />

      <p className="mt-4 text-sm text-gray-600">
        선택한 날짜: {value.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </p>

      {matchedSchedules.length > 0 ? (
        <div className={`mt-2 p-4 rounded ${
          isDark ? 'bg-gray-700' : 'bg-gray-50'
        }`}>
          <h3 className="text-sm font-semibold mb-2">
            일정 목록:
          </h3>
          <ul className="text-sm space-y-1">
            {matchedSchedules.map((s, idx) => (
              <li key={idx}>📌 {s.title}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-2 text-sm text-gray-400">이 날은 일정이 없습니다.</p>
      )}
    </div>
  );
}