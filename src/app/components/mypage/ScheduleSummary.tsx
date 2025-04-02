interface Props {
    total: number;
    completed: number;
}

export default function ScheduleSummary({ total, completed }: Props) {
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <div>
            <h2 className="text-lg font-semibold mb-2">📊 내 일정 요약</h2>
            <p className="text-sm">
                전체 일정: {total}개<br />
                완료된 일정: {completed}개 ({percent}%)
            </p>
        </div>
    );
}