interface TodaySummaryProps {
    total: number;
    completed: number;
}

export default function TodaySummary({ total, completed }:TodaySummaryProps) {
    return (
        <div className="mb-6">
            <div className="rounded-lg shadow-md p-5 bg-gray-800 border border-gray-700">
                <h2 className="text-lg font-semibold mb-2">오늘의 요약</h2>

                <p className="text-gray-300 text-sm mb-1">
                    총 {total}개 중 {completed}개 완료
                </p>

                <div className="w-full h-2 bg-gray-700 rounded">
                    <div
                        className="h-full bg-blue-500 rounded"
                        style={{ width: `${total === 0 ? 0 : (completed / total) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
