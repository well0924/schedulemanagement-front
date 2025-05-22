'use client'

import { updateScheduleStatus } from "@/app/utile/api/ScheduleApi";
import { useDarkModeContext } from "@/app/utile/context/DarkModeContext";
import { ScheduleResponse } from "@/app/utile/interfaces/calendar/calendarModel";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


interface Props {
    schedules: ScheduleResponse[];
    onDeleteSchedules?: (ids: number[]) => void;
    onEditSchedule?: (schedule: ScheduleResponse) => void;
}

export default function TodaySchedule({ schedules, onDeleteSchedules, onEditSchedule }: Props) {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [localSchedules, setLocalSchedules] = useState<ScheduleResponse[]>(schedules);
    const router = useRouter();
    const total = localSchedules.length;
    const completed = localSchedules.filter(s => s.progressStatus?.value === 'COMPLETE').length;
    const { isDark } = useDarkModeContext();

    console.log(selectedIds);

    useEffect(() => {
        setLocalSchedules(schedules);
    }, [schedules]);

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
        setLocalSchedules(prev => prev.filter(s => !selectedIds.includes(s.id)));
        setSelectedIds([]);
    };

    const handleStatusChange = async (
        schedule: ScheduleResponse,
        newStatus: "IN_COMPLETE" | "PROGRESS" | "COMPLETE"
    ) => {
        try {
            await updateScheduleStatus(schedule.id, newStatus);

            const updated = { ...schedule, progressStatus: { value: newStatus } };

            // 1. 외부 콜백 호출
            if (typeof onEditSchedule === "function") {
                onEditSchedule(updated);
            }

            // 2. 내부 상태 업데이트
            setLocalSchedules(prev =>
                prev.map(s => (s.id === updated.id ? updated : s))
            );
        } catch (err) {
            console.error("상태 변경 실패:", err);
        }
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
                {localSchedules.length === 0 ? (
                    <li className="text-gray-500">오늘의 일정이 없습니다.</li>
                ) : (
                    localSchedules.map((s) => (
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
                            <div className="flex items-center gap-2 mt-1 lg:mt-0">
                                <select
                                    value={s.progressStatus?.value || "IN_COMPLETE"}
                                    onChange={(e) => handleStatusChange(s, e.target.value as "IN_COMPLETE" | "PROGRESS" | "COMPLETE")}
                                    className="text-xs px-2 py-1 border rounded bg-white dark:bg-gray-700 text-black dark:text-white">
                                    <option value="IN_COMPLETE">⏸ 미시작</option>
                                    <option value="PROGRESS">⏳ 진행중</option>
                                    <option value="COMPLETE">✔ 완료</option>
                                </select>
                            </div>
                        </li>
                    ))
                )}
            </ul>
        </section>
    );
}


