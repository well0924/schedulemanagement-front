'use client';

import { getScheduleRecommendation } from "@/app/utile/api/ScheduleApi";
import { RecommendedScheduleDraft } from "@/app/utile/interfaces/calendar/calendarModel";
import { useEffect, useState } from "react";

interface Props {
  onSelect: (draft: RecommendedScheduleDraft) => void;
}


export default function ScheduleRecommendationCard({ onSelect }: Props) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<RecommendedScheduleDraft[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getScheduleRecommendation(0, 3);
      setItems(result);
    } catch (e) {
      console.error(e);
      setError("추천 일정을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();

  }, []);

  const formatTime = (start: string, end: string) =>
    `${start.slice(11, 16)} ~ ${end.slice(11, 16)}`;

  return (
    <div className="mt-4 rounded-xl border border-gray-700 bg-gray-800 p-4 shadow">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">🤖 일정 추천</h3>
        <button
          onClick={fetchRecommendations}
          disabled={loading}
          className="text-xs text-blue-400 hover:underline disabled:opacity-50"
        >
          다시 추천
        </button>
      </div>

      {/* 상태 처리 */}
      {loading && (
        <p className="text-sm text-gray-400">일정을 분석 중입니다…</p>
      )}

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {!loading && !error && items.length === 0 && (
        <p className="text-sm text-gray-400">
          오늘은 추천할 일정이 없습니다.
        </p>
      )}

      {/* 추천 리스트 */}
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li
            key={idx}
            className="rounded-lg bg-gray-700 p-3 hover:bg-gray-600 transition"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white">
                  {item.contents}
                </p>
                <p className="text-xs text-gray-400">
                  {item.scheduleMonth}월 {item.scheduleDays}일 ·{" "}
                  {formatTime(item.startTime, item.endTime)}
                </p>
                <p className="text-xs text-gray-500">
                  최근 일정 패턴과 빈 시간 기반 추천
                </p>
              </div>

              <button
                onClick={() => onSelect(item)}
                className="rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600"
              >
                추가
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
