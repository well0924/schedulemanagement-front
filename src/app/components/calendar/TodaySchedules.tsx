import { useDarkModeContext } from "@/app/context/DarkModeContext";
import { Schedule } from "@/app/interfaces/calendar/calendarModel";


interface Props {
    schedules: Schedule[];
}

export default function TodaySchedule({ schedules }: Props) {
    const total = schedules.length;
    const completed = schedules.filter(s => s.status === 'COMPLETE').length;
    const { isDark } = useDarkModeContext();

    return (
        <section className={`p-5 rounded shadow mb-6 max-w-[600px] transition-colors ${
            isDark ? 'bg-gray-800 text-white' : 'bg-white text-black'
          }`}>
            <h2 className="text-lg font-semibold mb-3">📌 오늘의 일정</h2>
            <p className="text-sm text-gray-600 mb-3">
                총 {total}개 중 {completed}개 완료
            </p>
            <ul className="space-y-2 text-sm">
                {schedules.length === 0 ? (
                    <li className="text-gray-500">오늘의 일정이 없습니다.</li>
                ) : (
                    schedules.map((s) => (
                        <li key={s.id} className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
                            <span>
                                [{s.category}] {s.title} ({s.time})
                            </span>
                            {s.status === 'COMPLETE' ? (
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