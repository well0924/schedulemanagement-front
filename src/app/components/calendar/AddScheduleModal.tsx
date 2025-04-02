'use client';

import { ScheduleRequest } from '@/app/interfaces/calendar/calendarModel';
import { useState } from 'react';


interface Props {
    isOpen: boolean;
    onClose: () => void;
    onScheduleAdd?: (schedule: ScheduleRequest) => void;
}

export default function AddScheduleModal({ isOpen, onClose, onScheduleAdd }: Props) {
    const [contents, setContents] = useState('');
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [categoryId, setCategoryId] = useState(1); // 기본 카테고리 ID

    const handleSubmit = () => {

        if (!contents.trim()) {
            alert('일정 내용을 입력해주세요.');
            return;
        }
        if (!date || !startTime || !endTime) {
            alert('날짜와 시간을 모두 입력해주세요.');
            return;
        }
        if (startTime >= endTime) {
            alert('시작 시간이 종료 시간보다 빠르거나 같을 수 없습니다.');
            return;
        }

        const scheduleData : ScheduleRequest = {
            contents,
            scheduleMonth: new Date(date).getMonth() + 1,
            scheduleDays: new Date(date).getDate(),
            startTime: `${date}T${startTime}`,
            endTime: `${date}T${endTime}`,
            userId: 1,
            categoryId,
            repeatType: 'NONE',
            repeatCount: 0,
        };

        onScheduleAdd?.(scheduleData);

        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white w-full max-w-md p-6 rounded shadow">
                <h2 className="text-lg font-bold mb-4">📝 일정 추가</h2>

                <div className="space-y-3">
                    <input
                        type="text"
                        placeholder="일정 내용"
                        className="w-full border px-3 py-2 rounded text-sm"
                        value={contents}
                        onChange={(e) => setContents(e.target.value)}
                    />
                    <input
                        type="date"
                        className="w-full border px-3 py-2 rounded text-sm"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                    <div className="flex gap-2">
                        <input
                            type="time"
                            className="w-full border px-3 py-2 rounded text-sm"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                        />
                        <input
                            type="time"
                            className="w-full border px-3 py-2 rounded text-sm"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                        />
                    </div>
                    <select
                        className="w-full border px-3 py-2 rounded text-sm"
                        value={categoryId}
                        onChange={(e) => setCategoryId(Number(e.target.value))}
                    >
                        <option value={1}>MariaDB 공부</option>
                        <option value={2}>운동</option>
                    </select>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm bg-gray-200 rounded"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 text-sm bg-blue-500 text-white rounded"
                    >
                        등록
                    </button>
                </div>
            </div>
        </div>
    );
}