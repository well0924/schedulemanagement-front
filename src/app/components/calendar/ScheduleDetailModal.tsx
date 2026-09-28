'use client';

import { getPresignedDownloadUrl } from "@/app/utile/api/AttachApi";
import { ScheduleResponse } from "@/app/utile/interfaces/calendar/calendarModel";
import Image from "next/image";
import { useEffect, useState } from "react";

interface Props {
  schedule: ScheduleResponse;
  onClose: () => void;
  onDelete: (id: number) => void;
  onEdit: (schedule: ScheduleResponse) => void;
}

export default function ScheduleDetailModal({ schedule, onClose, onDelete, onEdit }: Props) {

  const [isDark, setIsDark] = useState(false);

  // 다크 모드 상태를 추적하기 위한 useEffect
  useEffect(() => {
    const checkDark = () => {
      const hasDark = document.documentElement.classList.contains("dark");
      setIsDark(hasDark);
    };
    checkDark();
    const observer = new MutationObserver(() => {
      checkDark();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);


  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`rounded-xl shadow-2xl p-6 w-[90%] max-w-xl relative transition-colors duration-300 ${isDark ? "bg-gray-800 text-white" : "bg-white text-black"}`}>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl"
        >
          ✖
        </button>

        <h2 className="text-2xl font-semibold mb-4">{schedule.contents}</h2>

        <div className="text-sm space-y-2">
          <p><span className="font-semibold">진행 상태:</span> {schedule.progressStatus.value === 'COMPLETE' ? '✅ 완료' : '⏳ 미완료'}</p>
          <p><span className="font-semibold">시작:</span> {formatDateTime(schedule.startTime)}</p>
          <p><span className="font-semibold">종료:</span> {formatDateTime(schedule.endTime)}</p>
          <p><span className="font-semibold">반복:</span> {schedule.repeatType !== 'NONE' ? `${schedule.repeatType} x${schedule.repeatCount}` : '없음'}</p>
          <p><span className="font-semibold">카테고리 ID:</span> {schedule.categoryId}</p>
        </div>

        {schedule.attachFiles?.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold text-gray-800 mb-1">📎 첨부파일</h3>
            {schedule.attachFiles?.length > 0 ? (
              <ul className="space-y-2">
                {schedule.attachFiles.map(file => (
                  <li key={file.id} className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        try {
                          const url = await getPresignedDownloadUrl(file.id);
                          window.open(url, "_blank");
                          // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        } catch (err: unknown) {
                          alert("다운로드 실패");
                        }
                      }}
                      className="text-blue-600 underline text-sm"
                    >
                      {file.originFileName}
                    </button>
                    <div className="relative w-12 h-12">
                      <Image
                        src={file.thumbnailFilePath}
                        alt="thumbnail"
                        fill
                        sizes="48px"
                        className="object-cover border rounded"
                      />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400 italic">📎 첨부파일이 없습니다.</p>
            )}
          </div>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => onEdit(schedule)}
            className="px-4 py-2 text-sm rounded-lg transition-colors duration-200 bg-blue-500 text-white hover:bg-blue-600"
          >
            ✏️ 수정
          </button>
          <button
            onClick={() => onDelete(schedule.id)}
            className="px-4 py-2 text-sm rounded-lg transition-colorss duration-200 bg-red-600 text-white hover:bg-red-700"
          >
            🗑 삭제
          </button>
        </div>
      </div>
    </div >
  );
}
