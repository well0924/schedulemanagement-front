'use client'

import { useDarkModeContext } from "@/app/utile/context/DarkModeContext";
import { ScheduleResponse } from "@/app/utile/interfaces/calendar/calendarModel";
import { useRouter } from "next/navigation";
import { useState } from "react";


interface Props {
    schedules: ScheduleResponse[];
    onDeleteSchedules?: (ids: number[]) => void;
    onEditSchedule?: (schedule: ScheduleResponse) => void;
}

export default function TodaySchedule({ schedules, onDeleteSchedules }: Props) {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const router = useRouter();
    const total = schedules.length;
    const completed = schedules.filter(s => s.progressStatus?.value === 'COMPLETE').length;
    const { isDark } = useDarkModeContext();

    const toggleSelection = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleDelete = () => {
        if (selectedIds.length === 0) return
        if (typeof onDeleteSchedules === 'function') {
            onDeleteSchedules(selectedIds);
        }
        setSelectedIds([]);
    };

    return (
        <section className={`p-5 rounded shadow mb-6 max-w-[600px] transition-colors ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-black'
            }`}>
            <h2 className="text-lg font-semibold mb-3">📌 오늘의 일정</h2>
            <p className="text-sm text-gray-600 mb-3">
                총 {total}개 중 {completed}개 완료
            </p>

            {selectedIds.length > 0 && (
                <button
                    onClick={handleDelete}
                    className="mb-3 px-4 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                    선택 일정 삭제
                </button>
            )}
            <ul className="space-y-2 text-sm">
                {schedules.length === 0 ? (
                    <li className="text-gray-500">오늘의 일정이 없습니다.</li>
                ) : (
                    schedules.map((s) => (
                        <li
                            key={s.id}
                            className="flex flex-col lg:flex-row justify-between items-start lg:items-center"
                        >
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(s.id)}
                                    onChange={() => toggleSelection(s.id)}
                                />
                                <span
                                    onClick={() => router.push(`/calendar/${s.id}`)}
                                    className="cursor-pointer hover:underline"
                                >
                                    [{s.categoryId}] {s.contents} ({s.startTime})
                                </span>
                            </div>
                            {s.progressStatus?.value === 'COMPLETE' ? (
                                <span className="text-green-500">✔ 완료</span>
                            ) : (
                                <span className="text-red-500">⏳ 미완료</span>
                            )}
                        </li>
                    ))
                )}
            </ul>
        </section>
    );
}


